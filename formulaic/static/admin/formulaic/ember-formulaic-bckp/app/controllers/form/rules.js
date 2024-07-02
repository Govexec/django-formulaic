import Ember from 'ember';
import validatorFactory from '../../validators/factories';

export default Ember.Controller.extend(Ember.Evented, {
    rulesPendingDeletion: [],
    saveActive: false,
    saveContinueActive: false,
    validators: {},

    activeRules: Ember.computed('model', 'model.@each.isDeleted', {
        get() {
            return this.get('model').filter(function(item) {
                return !item.get('isDeleted');
            });
        }
    }),

    controlsDisabled: function () {
        return (this.saveActive || this.saveContinueActive);
    }.property('saveActive', 'saveContinueActive'),

    invalidateOrder: function () {
        if (!this.get('controlsDisabled')) {
            this.trigger('orderInvalidated');
        }
    },

    validatorFor: function(obj) {
        var validatorKey = obj.toString();
        var validators = this.get('validators');

        if (!(validatorKey in validators)) {
            validators[validatorKey] = validatorFactory.createRuleValidator(obj, this);
        }

        return validators[validatorKey];
    },

    removeValidatorFor: function(obj) {
        var validatorKey = obj.toString();
        var validators = this.get('validators');

        if (validatorKey in validators) {
            validators[validatorKey].destroy();
            delete validators[validatorKey];
        }
    },

    actions: {
        addRule: function(rule) {
            this.send('addRuleToRoute', rule);
        },
        deleteRule: function(rule) {
            this.send('deleteRuleToRoute', rule);
        },
        addCondition: function(rule) {
            this.send('addConditionToRoute', rule);
        },
        deleteCondition: function(condition) {
            this.send('deleteConditionToRoute', condition);
        },
        addResult: function(rule) {
            this.send('addResultToRoute', rule);
        },
        deleteResult: function(result) {
            this.send('deleteResultToRoute', result);
        }
    }
});
