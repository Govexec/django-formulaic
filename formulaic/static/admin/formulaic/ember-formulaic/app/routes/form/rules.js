/* global toastr */

import Ember from "ember";

export default Ember.Route.extend({
    form: function() {
        return this.modelFor('form');
    }.property(),

    formId: function() {
        return this.get('form.id');
    }.property('form'),

    model: function() {
        let formId = this.get('formId');

        // Pre-fetch rules
        this.store.query('rule', {
            form: formId
        });

        // Fetch fields
        this.store.query('field', {
            form: formId
        });

        return this.store.peekAll('rule');

        // return this.store.filter('rule', {
        //     form: this.get('formId')
        // }, function(rule) {
        //     return rule;
        // });
    },

    setupController: function (controller, model) {
        this._super(controller, model);

        // re-enable buttons; necessary after save
        controller.set('saveActive', false);
        controller.set('saveContinueActive', false);
    },

    _createCondition: function(rule) {
        var condition = this.store.createRecord('rulecondition', {
            position: rule.get('conditions').content.length,
            rule: rule,
            field: null,
            operator: null
        });
        rule.get('conditions').pushObject(condition);

        return condition;
    },

    _createResult: function(rule) {
        var result = this.store.createRecord('ruleresult', {
            action: null,
            field: null,
            rule: rule
        });
        rule.get('results').pushObject(result);

        return result;
    },

    actions: {
        addRuleToRoute: function() {
            var rule = this.store.createRecord('rule', {
                form: this.get('form'),
                operator: 'and',
                position: this.controller.get('model').content.length
            });

            this._createCondition(rule);

            this._createResult(rule);
        },

        deleteRuleToRoute: function(rule) {
            this.controller.removeValidatorFor(rule);
            rule.deleteRecord();

            var rulesPendingDeletion = this.controller.get('rulesPendingDeletion');
            rulesPendingDeletion.push(rule);
        },

        saveRules: function(continueEditing) {
            var i = 0;
            var thisRoute = this;
            var promises = [];

            // Set loading/saving state
            if (continueEditing) {
                this.controller.set('saveContinueActive', true);
            } else {
                this.controller.set('saveActive', true);
            }

            // Validate data
            var validationErrors = [];
            var rules = this.controller.get('model').toArray();
            for (i = 0; i < rules.length; i++) {
                var validator = this.controller.validatorFor(rules[i]);
                if (validator.get('isInvalidWithChildren')) {
                    validationErrors.push('Rule is incomplete');
                }
            }

            if (validationErrors.length > 0) {
                // Cancel 'Save'; output error messages
                toastr.options.positionClass = "toast-bottom-center";
                toastr.warning('Unable to save because of these issues: <br>' + validationErrors.join('<br>'));

                // Reset loading/saving state
                thisRoute.controller.set('saveContinueActive', false);
                thisRoute.controller.set('saveActive', false);
            } else {
                // Delete rules marked for deletion
                var rulesPendingDeletion = this.controller.get('rulesPendingDeletion');
                for (i = 0; i < rulesPendingDeletion.length; i++) {
                    promises.push(rulesPendingDeletion[i].save());
                }

                // Save Rule objects
                promises.push(this.controller.get('model').save());

                // Handle all save completions together
                Ember.RSVP.allSettled(promises).then(function (results) {
                    var saveErrors = [];
                    for (i = 0; i < results.length; i++) {
                        if (results[i].state === "rejected") {
                            saveErrors.push(results[i]);
                        }
                    }

                    // Reset loading/saving state
                    thisRoute.controller.set('saveContinueActive', false);
                    thisRoute.controller.set('saveActive', false);

                    if (saveErrors.length > 0) {
                        // Notify user of failure
                        toastr.options.positionClass = "toast-bottom-center";
                        toastr.error('Save failed.  Contact administrator.');
                    } else {
                        // Reload from store (obscures bug causing duplicate rules)
                        thisRoute.store.unloadAll('rule');
                        thisRoute.store.unloadAll('ruleresult');
                        thisRoute.store.unloadAll('rulecondition');
                        thisRoute.refresh();

                        // Notify user of success
                        toastr.options.positionClass = "toast-bottom-center";
                        toastr.success('Rules saved.');

                        // Redirect to form page if appropriate
                        if (!continueEditing) {
                            thisRoute.transitionTo('form');
                        }
                    }
                }, function (error) {
                    Ember.Logger.error(error);
                });
            }
        },

        closeRules: function() {
            this.transitionTo('form');
        },

        addConditionToRoute: function(rule) {
            this._createCondition(rule);
        },

        deleteConditionToRoute: function(condition) {
            this.controller.removeValidatorFor(condition);
            condition.deleteRecord();
        },

        addResultToRoute: function(rule) {
            this._createResult(rule);
        },

        deleteResultToRoute: function(result) {
            this.controller.removeValidatorFor(result);
            result.deleteRecord();
        }
    }
});
