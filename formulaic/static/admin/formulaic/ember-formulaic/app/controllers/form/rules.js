//controllers/form/rule.js

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import validatorFactory from '../../validators/factories';

export default class RulesController extends Controller {
  @service router; // Injecting the router service

  @tracked rulesPendingDeletion = [];
  @tracked saveActive = false;
  @tracked saveContinueActive = false;
  @tracked validators = {};

  get activeRules() {
    return this.model.filter(item => !item.isDeleted);
  }

  get controlsDisabled() {
    return this.saveActive || this.saveContinueActive;
  }

  validatorFor(obj) {
    let validatorKey = obj.toString();
    let validators = this.validators;

    if (!(validatorKey in validators)) {
      validators[validatorKey] = validatorFactory.createRuleValidator(obj, this);
    }

    return validators[validatorKey];
  }

  removeValidatorFor(obj) {
    let validatorKey = obj.toString();
    let validators = this.validators;

    if (validatorKey in validators) {
      validators[validatorKey].destroy();
      delete validators[validatorKey];
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
  addRule(rule) {
    this.addRuleToRoute(rule);
  }

  @action
  deleteRule(rule) {
    this.deleteRuleToRoute(rule);
  }

  @action
  addCondition(rule) {
    this.addConditionToRoute(rule);
  }

  @action
  deleteCondition(condition) {
    this.deleteConditionToRoute(condition);
  }

  @action
  addResult(rule) {
    this.addResultToRoute(rule);
  }

  @action
  deleteResult(result) {
    this.deleteResultToRoute(result);
  }

  @action
  saveRules(continueEditing) {
    this.saveActive = !continueEditing;
    this.saveContinueActive = continueEditing;
  }

  @action
  closeRules() {
    this.router.transitionTo('form'); // Using the injected router service
  }
}
