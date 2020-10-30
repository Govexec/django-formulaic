import Ember from 'ember';

export default Ember.Object.extend({
    isInvalid: function () {
        return (this.get('isFieldInvalid'));
    }.property('isFieldInvalid'),

    isFieldInvalid: function () {
        var fieldHasNoValue = (this.get('ruleresult.field.content') == null);

        if (this.get('isChangeOptionGroupAction')) {
            // validation for change-option-group
            return (this.get('changeOptionGroupInvalid') || fieldHasNoValue);
        } else {
            return fieldHasNoValue;
        }
    }.property('ruleresult.field.content', 'isChangeOptionGroupAction', 'changeOptionGroupInvalid'),

    isChangeOptionGroupAction: function() {
        return (this.get('ruleresult.action') === 'change-option-group');
    }.property('ruleresult.action'),

    changeOptionGroupInvalid: function() {
        if (!this.get('fieldHasOptionGroups')) {
            return true;
        } else if (this.get('ruleresult.option_group.content') == null) {
            return true;
        }

        return false;
    }.property('fieldHasOptionGroups', 'ruleresult.option_group.content'),

    // TODO: dry violation
    fieldHasOptionGroups: function () {
        return (this.get('optionGroups.length') > 0);
    }.property('optionGroups'),

    // TODO: dry violation
    optionGroups: function () {
        return this.get('ruleresult.field.content.choicefield.option_list.content.groups.content');
    }.property(
        'ruleresult.action',
        'ruleresult.field.content',
        'ruleresult.field.content.choicefield.option_list.content',
        'ruleresult.field.content.choicefield.option_list.content.groups.content'
    )
});
