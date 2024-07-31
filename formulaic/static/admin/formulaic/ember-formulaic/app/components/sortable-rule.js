import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';

export default class SortableRuleComponent extends Component {
  @service store;

  tagName = 'div';
  classNames = [
    'field-preview',
    'single-line-text',
    'form-group',
    'col-xs-12',
    'item'
  ];

  @tracked rule = this.args.rule;

  get classNameBindings() {
    return {
      'warning': this.rule.validator.isInvalid
    };
  }

  @computed('rule.conditions.@each.isDeleted')
  get activeConditions() {
    return this.rule.conditions.filter(item => !item.isDeleted);
  }

  @computed('rule.results.@each.isDeleted')
  get activeResults() {
    return this.rule.results.filter(item => !item.isDeleted);
  }

  get hasActiveConditions()
  {
    return this.activeConditions.length > 0
  }

  willDestroy() {
    super.willDestroy(...arguments);
  }

  @action
  clickedDeleteRule(rule) {
    this.args.onDeleteRuleClick(rule);
  }

  @action
  setOperator(operator) {
    this.rule.operator = operator;
  }

  @action
  clickedAddCondition(rule) {
    this.args.onAddConditionClick(rule);
  }

  @action
  deleteCondition(condition) {
    this.args.onDeleteConditionClick(condition);
  }

  @action
  clickedAddResult(rule) {
    this.args.onAddResultClick(rule);
  }

  @action
  deleteResult(result) {
    this.args.onDeleteResultClick(result);
  }
}
