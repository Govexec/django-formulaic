//components/form/index.js

import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import { once } from '@ember/runloop';

export default class FormIndexComponent extends Component {
  @service store;
  @service toast;
  @service router;

  @tracked inEditMode = false;
  @tracked saveActive = false;
  @tracked downloadInProgress = false;
  @tracked downloadFailed = false;
  @tracked privacyPolicies = null;
  @tracked model = this.args.model;

  constructor() {
    super(...arguments);
    once(this, this.loadPrivacyPolicies);
  }

  get form() {
    return this.model;
  }

  get formId() {
    return this.model.id;
  }

  get privacyPoliciesReady() {
    return Array.isArray(this.privacyPolicies);
  }

  eq(a, b) {
    return a === b;
  }

  @action
  async loadPrivacyPolicies() {
    try {
      let policies = await this.store.query('privacypolicy', {});
      this.privacyPolicies = policies.toArray();
    } catch (error) {
      console.error('Error loading privacy policies:', error);
    }
  }

  @action
  privacyPolicyChanged(event) {
    let selectedPolicyId = event.target.value;
    this.model.privacy_policy = this.privacyPolicies.find(policy => policy.id === selectedPolicyId);
  }

  @action
  editForm() {
    this.inEditMode = true;
  }

  @action
  async saveForm() {
    this.saveActive = true;

    try {
      await this.model.save();
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
