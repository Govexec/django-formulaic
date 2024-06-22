import Model, { belongsTo, attr, hasMany } from '@ember-data/model';

export default class RuleModel extends Model {
    @belongsTo('form', { async: true, inverse: 'rules' }) form;
    @attr('string') operator;
    @attr('number') position;
    @hasMany('rulecondition', { async: true, inverse: 'rule' }) conditions;
    @hasMany('ruleresult', { async: true, inverse: 'rule' }) results;
}
