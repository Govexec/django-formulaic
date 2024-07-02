import Ember from 'ember';
import DRFAdapter from './drf';

export default DRFAdapter.extend({
    buildURL: function(type, id, snapshot, requestType) {
        /**
         * Overriding `buildURL` to keep data fresh.  Without this,
         * I was getting old data on refresh.
         */

        var url = this._super(type, id, snapshot, requestType);

        // TODO: replace this with a global constant that gets changed every time cache should be invalidated?
        var cacheBreaker = 'cacheBreaker=' + Math.round(new Date().getTime() / 1000);
        cacheBreaker = ((url.indexOf('?') > -1) ? '&' : '?') + cacheBreaker;

        return url + cacheBreaker;
    },

    headers: Ember.computed(function() {
        /**
         * Adding CSRF header to protect against cross-domain
         * forgery attacks.
         */

        return {
            "X-CSRFToken": this.cookie.getCookie('csrftoken')
        };
    }).volatile()
});
