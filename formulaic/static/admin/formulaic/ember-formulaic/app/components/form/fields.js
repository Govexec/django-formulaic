//components/form/field.js

import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import { A } from '@ember/array';
import {allSettled} from 'rsvp';
import slug from '../../utils/slug';

export default class FieldsComponent extends Component {
  @service store;
  @service router;
  @service('field-service') fieldService;

  @tracked model = A(this.fieldService.currentFormFields);
  @tracked currentField = this.fieldService.currentField;
  @tracked saveActive = false;
  @tracked saveContinueActive = false;
  @tracked fieldsPendingDeletion = [];
  @tracked validators = {};

  get activeFields() {
    return this.model.filter(item => !item.isDeleted);
  }

  get controlsDisabled() {
    return this.saveActive || this.saveContinueActive;
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

      let actualField = field.get(field.model_class);

      if (!actualField.slug) {
        actualField.slug = slug.generateSlug(actualField.data_name);
      }

      let validator = this.fieldService.validatorFor(actualField);

      if (validator.isInvalid) {
        validationErrors.push(`Field "${actualField.display_name}" is incomplete`);
      }

      return actualField;
    });

    if (validationErrors.length > 0) {
      toastr.options.positionClass = "toast-top-center";
      toastr.warning(`Unable to save because of these issues: <br>${validationErrors.join('<br>')}`);
      this.saveActive = false;
      this.saveContinueActive = false;
      return;
    }

    let promises = [
      ...this.fieldsPendingDeletion.map(field => {
        field.deleteRecord();
        return field.save();
      }),
      ...actualFields.map(field => field.save())
    ];

    this.fieldsPendingDeletion.length = 0;

    try {
      let results = await allSettled(promises);
      let saveErrors = results.filter(result => result.state === "rejected");

      this.saveActive = false;
      this.saveContinueActive = false;

      if (saveErrors.length > 0) {
        toastr.options.positionClass = "toast-top-center";
        toastr.error('Save failed. Contact administrator.');
      } else {
        toastr.options.positionClass = "toast-top-center";
        this.fieldService.refreshCurrentRoute(this.router.currentRouteName);
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

    this.fieldService.removeValidatorFor(completeField);
    this.fieldsPendingDeletion.push(completeField);

    if (this.fieldService.currentField === completeField) {
      this.fieldService.closeEditField(this);
    }

    field.deleteRecord();
  }
}
