//components/form/rule.js

import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {A} from '@ember/array';
import {allSettled} from 'rsvp';
import validatorFactory from '../../validators/factories';

export default class RulesComponent extends Component {
  @service store;
  @service router;
  @service('field-service') fieldService;

  @tracked ruleModel = this.fieldService.currentFormRules;

  @tracked rulesPendingDeletion = [];
  @tracked conditionsPendingDeletion = [];
  @tracked resultsPendingDeletion = [];
  @tracked saveActive = false;
  @tracked saveContinueActive = false;
  @tracked validators = {};

  get activeRules() {
    return this.ruleModel.filter(item => !item.isDeleted);
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

  _createCondition(rule) {

    const lastCondition = rule.conditions.lastObject;
    const nextPosition = (lastCondition?.position + 1) || rule.conditions.length;

    let condition = this.store.createRecord('rulecondition', {
      position: nextPosition,
      rule: rule,
      field: null,
      operator: null
    });
    rule.conditions.pushObject(condition);

    return condition;
  }

  _createResult(rule) {
    let result = this.store.createRecord('ruleresult', {
      action: null,
      field: null,
      rule: rule
    });
    rule.results.pushObject(result);

    return result;
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
  addRule() {

    const lastRule = this.ruleModel.lastObject;
    const nextPosition = (lastRule?.position + 1) || this.ruleModel.length;


    let rule = this.store.createRecord('rule', {
      form: this.fieldService.currentForm,
      operator: 'and',
      position: nextPosition
    });

    this._createCondition(rule);
    this._createResult(rule);

    this.ruleModel.pushObject(rule);
  }

  @action
  deleteRule(rule) {
    this.removeValidatorFor(rule);
    rule.deleteRecord();
    this.rulesPendingDeletion.push(rule);
  }

  @action
  addCondition(rule) {
    this._createCondition(rule);
  }

  @action
  deleteCondition(condition) {
    this.removeValidatorFor(condition);
    condition.deleteRecord();
    this.conditionsPendingDeletion.push(condition);
  }

  @action
  addResult(rule) {
    this._createResult(rule);
  }

  @action
  deleteResult(result) {
    this.removeValidatorFor(result);
    result.deleteRecord();
    this.resultsPendingDeletion.push(result);
  }

  @action
  async saveRules(continueEditing) {
    let promises = [];
    const thisComponent = this;

    // Set loading/saving state
    if (continueEditing) {
      this.saveContinueActive = true;
    } else {
      this.saveActive = true;
    }

    // Validate data
    const validationErrors = [];
    const rules = this.ruleModel;
    for (let rule of rules) {
      const validator = this.validatorFor(rule);

      if (validator.isInvalidWithChildren) {
        validationErrors.push(`Rule ${rule.position} is incomplete`);
      }
    }

    if (validationErrors.length > 0) {

      // Cancel 'Save'; output error messages
      toastr.options.positionClass = "toast-top-center";
      toastr.warning(`Unable to save because of these issues: <br> ${validationErrors.join('<br>')}`);

      // Reset loading/saving state
      thisComponent.saveContinueActive = false;
      thisComponent.saveActive = false;
    } else {
      // Delete rules marked for deletion

      for (let deletedRule of this.rulesPendingDeletion) {
        deletedRule.deleteRecord();
        promises.push(deletedRule.save());
      }

      for (let deletedCondition of this.conditionsPendingDeletion) {
        deletedCondition.deleteRecord();
        promises.push(deletedCondition.save());
      }

      for (let deletedResult of this.resultsPendingDeletion) {
        deletedResult.deleteRecord();
        promises.push(deletedResult.save());
      }

      console.warn("this.ruleMode : ", this.ruleModel);

      for (let [index,actualRule] of this.ruleModel.entries()) {
        if (!actualRule.isDeleted) {

          actualRule.setConditions(actualRule.conditions.toArray());
          actualRule.setResults(actualRule.results.toArray());
          actualRule.setPosition(index);

          promises.push(actualRule.save());
        }
      }

      // Handle all save completions together
      try {

        const results = await allSettled(promises);

        const saveErrors = results.filter(result => result.state === 'rejected');

        // Reset loading/saving state
        thisComponent.saveContinueActive = false;
        thisComponent.saveActive = false;

        if (saveErrors.length > 0) {
          // Notify user of failure
          console.warn("validationErrors : ", saveErrors);
          toastr.options.positionClass = "toast-top-center";
          toastr.error('Save failed. Contact administrator.');
        } else {
          this.store.unloadAll('rulecondition');
          this.store.unloadAll('ruleresult');
          this.fieldService.refreshCurrentRoute(this.router.currentRouteName);
          toastr.options.positionClass = "toast-top-center";
          toastr.success('Rules saved.');

          // Redirect to form page if appropriate
          if (!continueEditing) {
            this.router.transitionTo('form');
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  @action
  closeRules() {
    this.router.transitionTo('form');
  }
}


