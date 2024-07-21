import Model, {belongsTo, attr, hasMany} from '@ember-data/model';

import {tracked} from '@glimmer/tracking';

export default class RuleModel extends Model {
  @belongsTo('form', {async: false, inverse: 'rules'}) form;
  @attr('string') operator;
  @attr('number') position;
  @hasMany('rulecondition', {async: false, inverse: 'rule'}) conditions;
  @hasMany('ruleresult', {async: false, inverse: 'rule'}) results;

  @tracked conditionsArray = [];
  @tracked resultsArray = [];
  @tracked ruleForm = null

  setForm(form) {
    this.ruleForm = form;
  }

  setConditions(conditions) {
    this.conditionsArray = [...conditions];
  }

  setResults(results) {
    this.resultsArray = [...results];
  }
}
