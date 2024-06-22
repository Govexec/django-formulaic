import Model, { belongsTo, attr, hasMany } from '@ember-data/model';

export default class RuleModel extends Model {
    @belongsTo('form', { async: true }) form;
    @attr('string') operator;
    @attr('number') position;
    @hasMany('rulecondition', { async: true }) conditions;
    @hasMany('ruleresult', { async: true }) results;
}
