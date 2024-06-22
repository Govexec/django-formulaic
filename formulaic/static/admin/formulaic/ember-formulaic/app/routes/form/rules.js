//routes/form/rules.js

import { action, computed } from '@ember/object';
import { allSettled } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RulesRoute extends Route {
  @service store;
  @service toast;

  get form() {
    return this.modelFor('form');
  }

  get formId() {
    return this.form.id;
  }

  async model() {
    try {
      await this.store.query('rule', { form: this.formId });
      await this.store.query('field', { form: this.formId });
      return this.store.findAll('rule');
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    controller.setProperties({
      saveActive: false,
      saveContinueActive: false
    });
  }

  _createCondition(rule) {
    let condition = this.store.createRecord('rulecondition', {
      position: rule.conditions.length,
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
  addRuleToRoute() {
    let rule = this.store.createRecord('rule', {
      form: this.form,
      operator: 'and',
      position: this.controller.model.length
    });

    this._createCondition(rule);
    this._createResult(rule);
  }

  @action
  deleteRuleToRoute(rule) {
    this.controller.removeValidatorFor(rule);
    rule.deleteRecord();

    let rulesPendingDeletion = this.controller.rulesPendingDeletion;
    rulesPendingDeletion.push(rule);
  }

  @action
  async saveRules(continueEditing) {
    const promises = [];
    const thisRoute = this;

    // Set loading/saving state
    if (continueEditing) {
      this.controller.setProperties({saveContinueActive: true});
    } else {
      this.controller.setProperties({saveActive: true});
    }

    // Validate data
    const validationErrors = [];
    const rules = this.controller.model.toArray();
    for (let rule of rules) {
      const validator = this.controller.validatorFor(rule);
      if (validator.isInvalidWithChildren) {
        validationErrors.push('Rule is incomplete');
      }
    }

    if (validationErrors.length > 0) {
      // Cancel 'Save'; output error messages
      this.toast.options.positionClass = "toast-bottom-center";
      this.toast.warning(`Unable to save because of these issues: <br> ${validationErrors.join('<br>')}`);

      // Reset loading/saving state
      thisRoute.controller.setProperties({saveContinueActive: false});
      thisRoute.controller.setProperties({saveActive: false});
    } else {
      // Delete rules marked for deletion
      const rulesPendingDeletion = this.controller.rulesPendingDeletion;
      for (let rule of rulesPendingDeletion) {
        promises.push(rule.save());
      }

      // Save Rule objects
      promises.push(this.controller.model.save());

      // Handle all save completions together
      try {
        const results = await allSettled(promises);
        const saveErrors = results.filter(result => result.state === 'rejected');

        // Reset loading/saving state
        thisRoute.controller.setProperties({saveContinueActive: false});
        thisRoute.controller.setProperties({saveActive: false});

        if (saveErrors.length > 0) {
          // Notify user of failure
          this.toast.options.positionClass = "toast-bottom-center";
          this.toast.error('Save failed. Contact administrator.');
        } else {
          // Reload from store (obscures bug causing duplicate rules)
          thisRoute.store.unloadAll('rule');
          thisRoute.store.unloadAll('ruleresult');
          thisRoute.store.unloadAll('rulecondition');
          thisRoute.refresh();

          // Notify user of success
          this.toast.options.positionClass = "toast-bottom-center";
          this.toast.success('Rules saved.');

          // Redirect to form page if appropriate
          if (!continueEditing) {
            thisRoute.transitionTo('form');
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  @action
  closeRules() {
    this.transitionTo('form');
  }

  @action
  addConditionToRoute(rule) {
    this._createCondition(rule);
  }

  @action
  deleteConditionToRoute(condition) {
    this.controller.removeValidatorFor(condition);
    condition.deleteRecord();
  }

  @action
  addResultToRoute(rule) {
    this._createResult(rule);
  }

  @action
  deleteResultToRoute(result) {
    this.controller.removeValidatorFor(result);
    result.deleteRecord();
  }
}
