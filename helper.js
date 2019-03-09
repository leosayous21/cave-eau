
module.exports=class Helper {
  static async sleep(seconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(seconds*1000), seconds*1000);
    });
  }

  static async wait() {
    return new Promise((resolve, reject) => null);
  }

  static async predicate(condition) {
    if(condition) return;
    await Helper.wait();
  }
}

