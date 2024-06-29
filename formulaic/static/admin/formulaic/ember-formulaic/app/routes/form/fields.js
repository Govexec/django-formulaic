//routes/form/field.js

import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class FieldsRoute extends Route {
  @service store;
  @service('field-service') fieldService;

  get form() {
    return this.modelFor('form');
  }

  get formId() {
    return this.form.id;
  }

  async model() {
    try {
      let fieldRecords = await this.store.query('field', {form: this.formId});
      return fieldRecords.toArray();
    } catch (error) {
    }
  }

  renderTemplate() {
    this.render('form.fields');
    //this.fieldService.renderDefaultSidebar(this.controller);
  }
}
