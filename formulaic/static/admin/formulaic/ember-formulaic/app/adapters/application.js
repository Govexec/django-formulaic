import RESTAdapter from '@ember-data/adapter/rest';


export default class ApplicationAdapter extends RESTAdapter {

  get host() {

    return "";
  }

  get namespace() {
    return "formulaic/api";
  }

  buildURL(modelName, id, snapshot, requestType, query) {
    let url = super.buildURL(...arguments);

    // Add cache breaker (if needed)
    let cacheBreaker = 'cacheBreaker=' + Math.round(new Date().getTime() / 1000);
    cacheBreaker = ((url.indexOf('?') > -1) ? '&' : '?') + cacheBreaker;

    return url + "/" + cacheBreaker;
  }

  get headers() {
    let csrfToken = this.getCsrfTokenFromCookies();
    return {
      'X-CSRFToken': csrfToken,
      'Accept': 'application/json, text/javascript, */*; q=0.01',
    };
  }

  getCsrfTokenFromCookies() {
    let csrfToken = null;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        csrfToken = value;
        break;
      }
    }
    return csrfToken;
  }

  handleResponse(status, headers, payload, requestData) {
    return super.handleResponse(status, headers, payload, requestData);
  }
}
