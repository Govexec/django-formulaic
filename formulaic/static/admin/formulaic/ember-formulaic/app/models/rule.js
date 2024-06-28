import Model, { belongsTo, attr, hasMany } from '@ember-data/model';

export default class RuleModel extends Model {
    @belongsTo('form', { async: false, inverse: 'rules' }) form;
    @attr('string') operator;
    @attr('number') position;
    @hasMany('rulecondition', { async: false, inverse: 'rule' }) conditions;
    @hasMany('ruleresult', { async: false, inverse: 'rule' }) results;
}
