import RESTAdapter from '@ember-data/adapter/rest';
import { inject as service } from '@ember/service';

export default class ApplicationAdapter extends RESTAdapter {
  @service('cookies-service') cookiesService;

  buildURL(type, id, snapshot, requestType) {
    let url = super.buildURL(type, id, snapshot, requestType);

    // Add a cache breaker to the URL
    let cacheBreaker = 'cacheBreaker=' + Math.round(new Date().getTime() / 1000);
    cacheBreaker = ((url.indexOf('?') > -1) ? '&' : '?') + cacheBreaker;

    return url + cacheBreaker;
  }

  get headers() {
    return {
      'X-CSRFToken': this.cookiesService.read('csrftoken')
    };
  }
}
