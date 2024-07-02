import CookieService from 'ember-formulaic/services/cookie';

export function initialize(application) {
  application.register('service:cookie', CookieService);

}

export default {
  initialize,
  name: 'cookie-initializer'
};
