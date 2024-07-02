import Ember from "ember";

export default Ember.Component.extend({
    store: Ember.inject.service(),

    tagName: 'div',
    classNames: [
        'field-preview', 
        'single-line-text', 
        'form-group',
        'col-xs-12',
        'item'
    ],
    classNameBindings: [
        'rule.validator.isInvalid:warning'
    ],

    activeConditions: Ember.computed('rule.conditions.@each.isDeleted', {
        get() {
            return this.get('rule.conditions').filter(function(item) {
                return !item.get('isDeleted');
            });
        }
    }),

    activeResults: Ember.computed('rule.results.@each.isDeleted', {
        get() {
            return this.get('rule.results').filter(function(item) {
                return !item.get('isDeleted');
            });
        }
    }),

    destroy() {
        /**
         * Invalidate order after destroy
         */

        this._super(...arguments);

        this.sendAction('onOrderInvalidated');
    },

    actions: {
        clickedDeleteRule: function(rule) {
            this.sendAction('onDeleteClick', rule);
        },
        clickedAddCondition: function(rule) {
            this.sendAction('onAddConditionClick', rule);
        },
        clickedAddResult: function(rule) {
            this.sendAction('onAddResultClick', rule);
        }
    }
});
