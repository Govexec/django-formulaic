import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class RulesRoute extends Route {
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

      let formRules = await this.store.query('rule', {form: this.form.id});
      let formFields = await this.store.query('field', {form: this.form.id});
      await this.store.query('optionlist', {});
      await this.store.query('optiongroup', {});

      this.fieldService.currentForm = this.form;
      this.fieldService.currentFormFields = formFields.toArray();
      this.fieldService.currentFormRules = formRules.toArray();

      return this.fieldService.currentFormRules;
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }
  }
}
