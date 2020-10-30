import Ember from 'ember';

export default Ember.Object.extend({
    isInvalid: function () {
        return (this.get('areConditionsEmpty') || this.get('areResultsEmpty'));
    }.property('areConditionsEmpty', 'areResultsEmpty'),

    areConditionsEmpty: function () {
        return (this.get('rule.conditions').get('content').length < 1);
    }.property('rule.conditions.content.length'),

    areResultsEmpty: function () {
        return (this.get('rule.results').get('content').length < 1);
    }.property('rule.results.content.length'),

    isInvalidWithChildren: function () {
        return (this.get('isInvalid') || this.get('areConditionsInvalid') || this.get('areResultsInvalid'));
    }.property('isInvalid', 'areConditionsInvalid', 'areResultsInvalid'),

    areConditionsInvalid: function () {
        var conditionValidators = this.get('conditionValidators');
        for (var i = 0; i < conditionValidators.length; i++) {
            if (conditionValidators[i].get('isInvalid')) {
                return true;
            }
        }

        return false;
    }.property('conditionValidators.@each.isInvalid'),

    areResultsInvalid: function () {
        var resultValidators = this.get('resultValidators');
        for (var i = 0; i < resultValidators.length; i++) {
            if (resultValidators[i].get('isInvalid')) {
                return true;
            }
        }

        return false;
    }.property('resultValidators.@each.isInvalid'),

    conditionValidators: function() {
        let conditions = this.get('rule.conditions.content').toArray();
        let validators = [];
        for (var i = 0; i < conditions.length; i++) {
            validators.push(conditions[i].validator);
        }

        return validators;
    }.property('rule.conditions.content.@each'),

    resultValidators: function () {
        let results = this.get('rule.results.content').toArray();
        let validators = [];
        for (var i = 0; i < results.length; i++) {
            validators.push(results[i].validator);
        }

        return validators;
    }.property('rule.results.content.@each')
});
