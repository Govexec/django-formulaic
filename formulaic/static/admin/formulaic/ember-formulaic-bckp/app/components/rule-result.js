import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    allActions: [
        { value: 'show', name: 'Show' },
        { value: 'hide', name: 'Hide' },
        { value: 'change-option-group', name: 'Change Option Group'}
        // , TODO: cut from initial scope
        // { value: "require", name: "Require (Override)" },
        // { value: "optional", name: "Optional (Override)" }
    ],

    choiceFieldActions: [
        'change-option-group'
    ],

    availableActions: function() {
        return this.allActions;
    }.property(),

    availableFields: function() {
        // TODO: observing `allFields.length` doesn't handle "no fields" situation

        if (this.get('choiceFieldActions').indexOf(this.get('result.action')) !== -1) {
            // Action only applies to Choice Fields
            return this.get('allFields').filter(function (field) {
                return (field.get('choicefield'));
            });
        } else {
            // Action applies to any field
            return this.get('allFields');
        }
    }.property('allFields.length', 'result.action'),


    allFieldsReady: function() {
        return (this.get('allFields.length'));
    }.property('allFields.length'),

    showOptionGroups: function() {
        if (this.get('result.action') === 'change-option-group') {
            if (this.get('result.field.content.choicefield')) {
                return true;
            }
        }

        return false;
    }.property(
        'result.action',
        'optionGroups',
        'result.field.content',
        'result.field.content.choicefield.option_list.content',
        'result.field.content.choicefield.option_list.content.groups.content'
    ),

    fieldHasOptionGroups: function() {
        return (this.get('optionGroups.length') > 0);
    }.property('optionGroups'),

    optionGroups: function() {
        return this.get('result.field.content.choicefield.option_list.content.groups.content');
    }.property(
        'result.action',
        'result.field.content',
        'result.field.content.choicefield.option_list.content',
        'result.field.content.choicefield.option_list.content.groups.content'
    ),

    actions: {
        resultActionChanged: function(value) {
            this.set('result.action', value);
        },
        resultFieldChanged: function(value) {
            this.set('result.field', value);

            // Clear option group when affected field changes
            this.set('result.option_group', null);
        },
        resultOptionGroupChanged: function(value) {
            this.set('result.option_group', value);
        },
        clickedDeleteResult: function(result) {
            this.sendAction('onDeleteClick', result);
        }
    }
});
