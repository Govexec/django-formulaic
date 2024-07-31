//routes/form/index.js

import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  model() {
    return this.modelFor('form');
  }
}
