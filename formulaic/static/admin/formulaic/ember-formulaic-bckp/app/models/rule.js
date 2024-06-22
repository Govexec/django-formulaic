import DS from 'ember-data';

export default DS.Model.extend({
    form: DS.belongsTo('form', { async:true }),
    operator: DS.attr('string'),
    position: DS.attr('number'),
    conditions: DS.hasMany('rulecondition'),
    results: DS.hasMany('ruleresult')
});