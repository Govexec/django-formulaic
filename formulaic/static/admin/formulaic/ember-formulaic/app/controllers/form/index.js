import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { allSettled } from 'rsvp';

export default class FormIndexController extends Controller {
  @service store;
  @service toast;
  @service router;

  @tracked inEditMode = false;
  @tracked saveActive = false;
  @tracked downloadInProgress = false;
  @tracked downloadFailed = false;

  get form() {
    return this.model;
  }

  get formId() {
    return this.model.id;
  }

  get privacyPolicies() {
    return this.store.query('privacypolicy', {});
  }

  get privacyPoliciesReady() {
    return this.privacyPolicies.isFulfilled && this.model.privacy_policy.isFulfilled;
  }

  @action
  privacyPolicyChanged(value) {
    this.model.privacy_policy = value;
  }

  @action
  editForm() {
    this.inEditMode = true;
  }

  @action
  async saveForm() {
    this.saveActive = true;

    try {
      await allSettled([this.form.save()]);
      this.saveActive = false;
      this.toast.success('Form saved.');
      this.inEditMode = false;
    } catch (error) {
      console.error(error);
      this.saveActive = false;
    }
  }

  @action
  close() {
    this.inEditMode = false;
  }

  @action
  editFields() {
    this.router.transitionTo('form.fields');
  }

  @action
  editRules() {
    this.router.transitionTo('form.rules');
  }

  @action
  viewSubmissions() {
    this.router.transitionTo('form.submissions');
  }

  @action
  downloadSubmissions() {
    const formElement = document.getElementById(`ld-submissions-dl-${this.formId}`);

    if (!formElement) return;

    this.downloadInProgress = true;
    this.downloadFailed = false;

    formElement.addEventListener('handl:form-unlocked', () => {
      this.downloadInProgress = false;
    });

    formElement.submit();
  }
}
