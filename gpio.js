const gpio = require('rpi-gpio');
const EventEmitter = require('events');

class GpioService {
  static get DIR_IN() {
    return gpio.DIR_IN;
  }

  static get EDGE_BOTH() {
    return gpio.EDGE_BOTH;
  }

  static get EDGE_RISING() {
    return gpio.EDGE_RISING;
  }

  static declareGpioPin(pin, dir, changedStrategy) {
    gpio.setup(pin, dir, changedStrategy);
  }
}
module.exports = {
  gpio,
  GpioService,
}
