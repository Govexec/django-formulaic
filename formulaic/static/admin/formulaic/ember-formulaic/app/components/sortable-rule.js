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

  @tracked rule;

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

  willDestroy() {
    super.willDestroy(...arguments);
    this.args.onOrderInvalidated();
  }

  @action
  clickedDeleteRule(rule) {
    this.args.onDeleteClick(rule);
  }

  @action
  clickedAddCondition(rule) {
    this.args.onAddConditionClick(rule);
  }

  @action
  clickedAddResult(rule) {
    this.args.onAddResultClick(rule);
  }

  @action
  setOperator(operator) {
    this.rule.operator = operator;
  }

  @action
  deleteCondition(condition) {
    this.args.onDeleteCondition(condition);
  }

  @action
  deleteResult(result) {
    this.args.onDeleteResult(result);
  }
}
