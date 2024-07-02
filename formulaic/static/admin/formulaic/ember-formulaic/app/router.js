import EmberRouter from '@ember/routing/router';
import config from 'ember-formulaic/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;

  constructor() {
    super(...arguments);
    console.log('Router initialized');
  }
}

Router.map(function() {
  this.route('form', { path: '/:form_id/change' }, function() {
    this.route('fields');
    this.route('rules');
    this.route('submissions');
  });
});
