import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  model() {
    return this.modelFor('form');
  }

  async setupController(controller, model) {
    super.setupController(controller, model);
    await controller.loadPrivacyPolicies();
  }
}
