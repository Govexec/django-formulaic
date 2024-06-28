//controllers/form/field.js

import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {allSettled} from 'rsvp';
import FieldHelpers from '../../utils/fields';
import slug from '../../utils/slug';

export default class FieldsController extends Controller {
  @service store;
  @service router;
  @service('field-service') fieldService;

  @tracked model = [];
  @tracked currentField = null;
  @tracked saveActive = false;
  @tracked saveContinueActive = false;
  @tracked fieldsPendingDeletion = [];
  @tracked validators = {};

  get activeFields() {
    return this.model ? this.model.filter(item => !item.isDeleted) : [];
  }

  get controlsDisabled() {
    return this.saveActive || this.saveContinueActive;
  }

  validatorFor(field) {
    let actualField = FieldHelpers.getActualField(field);
    let validatorKey = actualField.toString();
    if (!this.validators[validatorKey]) {
      this.validators[validatorKey] = actualField.validator;
    }
    return this.validators[validatorKey];
  }

  removeValidatorFor(field) {
    let actualField = FieldHelpers.getActualField(field);
    let validatorKey = actualField.toString();
    if (this.validators[validatorKey]) {
      this.validators[validatorKey].destroy();
      delete this.validators[validatorKey];
    }
  }

  @action
  invalidateOrder() {
    if (!this.controlsDisabled) {
      this.orderInvalidated();
    }
  }

  orderInvalidated() {
    // Custom event handler logic
  }

  @action
  async saveFields(continueEditing) {
    this.saveActive = !continueEditing;
    this.saveContinueActive = continueEditing;

    let validationErrors = [];
    let actualFields = this.model.filter(field => !field.isDeleted).map(field => {
      let actualField = FieldHelpers.getActualField(field);
      if (!actualField.slug) {
        actualField.slug = slug.generateSlug(actualField.data_name);
      }

      let validator = this.validatorFor(actualField);
      if (validator.isInvalid) {
        validationErrors.push(`Field "${actualField.data_name}" is incomplete`);
      }

      return actualField;
    });

    if (validationErrors.length > 0) {
      toastr.options.positionClass = "toast-bottom-center";
      toastr.warning(`Unable to save because of these issues: <br>${validationErrors.join('<br>')}`);
      this.saveActive = false;
      this.saveContinueActive = false;
      return;
    }

    let promises = [
      ...this.fieldsPendingDeletion.map(field => field.deleteRecord().then(() => field.save())),
      ...actualFields.map(field => field.save())
    ];

    this.fieldsPendingDeletion.length = 0;

    try {
      let results = await allSettled(promises);
      let saveErrors = results.filter(result => result.state === "rejected");

      this.saveActive = false;
      this.saveContinueActive = false;

      if (saveErrors.length > 0) {
        toastr.options.positionClass = "toast-bottom-center";
        toastr.error('Save failed. Contact administrator.');
      } else {
        this.reloadFields();
        toastr.options.positionClass = "toast-bottom-center";
        toastr.success('Fields saved.');
        if (!continueEditing) {
          this.router.transitionTo('form');
        }
      }
    } catch (error) {
      console.error(error);
      this.saveActive = false;
      this.saveContinueActive = false;
    }
  }

  @action
  close() {
    this.router.transitionTo('form');
  }

  @action
  editField(field) {
    this.fieldService.openEditField(this, field);
  }

  @action
  deleteField(field, completeField) {
    this.removeValidatorFor(field);
    field.deleteRecord();
    this.fieldsPendingDeletion.push(completeField);
    this.invalidateOrder();

    if (this.currentField === field) {
      this.fieldService.closeEditField(this);
    }
  }

  @action
  doneEditingField() {
    this.fieldService.closeEditField(this);
  }

  @action
  createTextField(subtype) {
    let field = this.fieldService.createField(subtype, this.model, 'text');
    this.fieldService.openEditField(this, field);
  }

  @action
  createChoiceField(subtype) {
    let field = this.fieldService.createField(subtype, this.model, 'choice');
    this.fieldService.openEditField(this, field);
  }

  @action
  createBooleanField(subtype) {
    let field = this.fieldService.createField(subtype, this.model, 'boolean');
    this.fieldService.openEditField(this, field);
  }

  @action
  createHiddenField(subtype) {
    let field = this.fieldService.createField(subtype, this.model, 'hidden');
    this.fieldService.openEditField(this, field);
  }

  @action
  reloadFields() {
    this.store.unloadAll('field');
    this.refresh();
  }
}
