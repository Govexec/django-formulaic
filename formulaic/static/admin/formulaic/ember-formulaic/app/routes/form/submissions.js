//routes/form/submissions.js

import { action, computed } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SubmissionsRoute extends Route {
  @service store;

  page_size = 25;
  page = null;
  source = null;

  queryParams = {
    page: {
      refreshModel: false
    },
    source: {
      refreshModel: false
    }
  };

  get form() {
    return this.modelFor('form');
  }

  get formId() {
    return this.form.id;
  }

  async model(params) {
    try {
      return await this.store.query('submission', {
        form: this.formId,
        page: params.page || 1,
        page_size: this.page_size,
        source: params.source || null
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.setProperties({
      page_size: this.page_size,
      formId: this.formId
    });
  }

  gotoPage(page) {
    if (page == null) {
      page = 1;
    }

    this.transitionTo('form.submissions', {
      queryParams: { page: page }
    });
    this.refresh();
  }

  @action
  closeSubmissions() {
    this.transitionTo('form');
  }

  @action
  gotoNextPage(model) {
    let meta = model.meta;
    this.gotoPage(meta.next);
  }

  @action
  gotoPreviousPage(model) {
    let meta = model.meta;
    this.gotoPage(meta.previous);
  }

  @action
  changeSource(value) {
    let queryParams = {
      page: 1,
      source: value
    };

    this.transitionTo('form.submissions', {
      queryParams: queryParams
    });
    this.refresh();
  }
}
