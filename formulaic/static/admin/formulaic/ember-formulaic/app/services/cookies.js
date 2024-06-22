import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class CookieService extends Service {
 @service('cookies') emberCookies;

  read(name) {
    return this.emberCookies.read(name);
  }

  write(name, value, options = {}) {
    this.emberCookies.write(name, value, options);
  }

  clear(name, options = {}) {
    this.emberCookies.clear(name, options);
  }

  exists(name) {
    return this.read(name) !== undefined;
  }

  readAll() {
    return this.emberCookies.read();
  }

  clearAll(options = {}) {
    let allCookies = this.readAll();
    for (let name in allCookies) {
      this.clear(name, options);
    }
  }
}
