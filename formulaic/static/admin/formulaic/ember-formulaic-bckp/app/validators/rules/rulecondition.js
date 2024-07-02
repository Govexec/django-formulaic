import Ember from 'ember';

export default Ember.Object.extend({
    isInvalid: function () {
        return (this.get('isFieldInvalid') || this.get('isValueInvalid'));
    }.property('isFieldInvalid', 'isValueInvalid'),

    isFieldInvalid: function() {
        return (this.get('rulecondition.field.content') == null);
    }.property('rulecondition.field.content'),

    isValueInvalid: function () {
        var isBooleanField = (this.get('rulecondition.field.content.booleanfield') != null);
        return (Ember.isBlank(this.get('rulecondition.value')) && !isBooleanField);
    }.property('rulecondition.value')
});
