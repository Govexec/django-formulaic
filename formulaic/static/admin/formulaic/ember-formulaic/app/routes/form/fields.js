//routes/form/field.js

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
      let fieldsData = await this.store.query('field', { form: this.formId });
      console.log("fieldsData:", fieldsData.toArray());
      return fieldsData.toArray();
    } catch (error) {
      console.error('Error fetching fields:', error);
      throw error;
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.setProperties({
      saveActive: false,
      saveContinueActive: false,
      model: model,
    });
  }

  renderTemplate() {
    this.render('form.fields');
    this.fieldService.renderDefaultSidebar(this.controller);
  }

  @action
  editFieldToRoute(field) {
    this.fieldService.openEditField(this.controller, field);
  }

  @action
  deleteFieldToRoute(field, completeField) {
    this.controller.removeValidatorFor(field);
    field.deleteRecord();
    this.controller.fieldsPendingDeletion.push(completeField);
    this.controller.invalidateOrder();

    if (this.controller.currentField === field) {
      this.fieldService.closeEditField(this.controller);
    }
  }

  @action
  doneEditingField() {
    this.fieldService.closeEditField(this.controller);
  }

  @action
  createTextField(subtype) {
    let field = this.fieldService.createField(subtype, this.form, 'text');
    this.fieldService.openEditField(this.controller, field);
  }

  @action
  createChoiceField(subtype) {
    let field = this.fieldService.createField(subtype, this.form, 'choice');
    this.fieldService.openEditField(this.controller, field);
  }

  @action
  createBooleanField(subtype) {
    let field = this.fieldService.createField(subtype, this.form, 'boolean');
    this.fieldService.openEditField(this.controller, field);
  }

  @action
  createHiddenField(subtype) {
    let field = this.fieldService.createField(subtype, this.form, 'hidden');
    this.fieldService.openEditField(this.controller, field);
  }

  @action
  reloadFields() {
    this.store.unloadAll('field');
    this.refresh();
  }
}
