const _ = require('lodash');
const { gpio, GpioService } = require('./gpio');
const Helper = require('./helper');
const CUVE_SECURITY=11;
const CUVE_HIGH=15;
const CUVE_LOW=13;
const CHASSE=19;
const RELAY_1=16;
const RELAY_2=18;
const ON=false;
const OFF=true;

GpioService.declareGpioPin(CUVE_SECURITY, gpio.DIR_IN, gpio.EDGE_BOTH);
GpioService.declareGpioPin(CUVE_HIGH, gpio.DIR_IN, gpio.EDGE_BOTH);
GpioService.declareGpioPin(CUVE_LOW, gpio.DIR_IN, gpio.EDGE_BOTH);
GpioService.declareGpioPin(CHASSE, gpio.DIR_IN, gpio.EDGE_BOTH);
GpioService.declareGpioPin(RELAY_1, gpio.DIR_OUT, () => gpio.write(RELAY_1, true));
GpioService.declareGpioPin(RELAY_2, gpio.DIR_OUT, () => gpio.write(RELAY_2, true)); 
const gpioRead = async (pin) => {
  return new Promise((resolve, reject) => gpio.read(pin, (err, value) => {
    if(err) reject(err);
    resolve(!value);
  }));
}


var lastState = ON;
const setPompe = (status) => (gpio.write(RELAY_1, status), lastState=status);
const delay = (time) => new Promise((resolve, reject) => setTimeout(resolve, time));

var mutex = false;

const mutexLoop = async () => {
  if(mutex) return;
  mutex = true;
  await loop();
  mutex = false;
}

const loop = async () => {
  const cuveHigh = await gpioRead(CUVE_HIGH);
  const cuveLow = await gpioRead(CUVE_LOW);
  const cuveSecurity = await gpioRead(CUVE_SECURITY);
  const chasse = await gpioRead(CHASSE);
  const logging = msg => {
    const currentDate = '[' + new Date().toUTCString() + '] ';
    console.log(currentDate, 'low: '+cuveLow+';haut: '+cuveHigh+'; security: '+cuveSecurity+'; chasse: '+chasse);
    console.log(currentDate, msg);
  }
  const pompeHighAndWait = async () => {
    setPompe(ON);
    await delay(5000);
  }
  if(cuveSecurity) {
    logging('SECURITY MODE !');
    await pompeHighAndWait();
    return;
  }
  if(cuveHigh) {
    logging('Niveau haut atteint, vidange dans la chasse');
    await pompeHighAndWait();
    return;
  }
  if(!chasse) {
    logging('chasse niveau bas. Remplissage');
    setPompe(ON);
    return;
  }
  if(lastState === ON) {
    logging('Tout est ok. extinction de la pompe');
  }
  setPompe(OFF);
}
setTimeout(() => {
  setInterval(() => mutexLoop().catch(err => console.log('err', err)), 500);
 }, 5000);
