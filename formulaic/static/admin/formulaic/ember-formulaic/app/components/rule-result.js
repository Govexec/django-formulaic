import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';

export default class RuleResultComponent extends Component {
  @service store;

  @tracked result;
  @tracked allFields = [];

  allActions = [
    { value: 'show', name: 'Show' },
    { value: 'hide', name: 'Hide' },
    { value: 'change-option-group', name: 'Change Option Group' }
  ];

  choiceFieldActions = [
    'change-option-group'
  ];

  @computed('allActions')
  get availableActions() {
    return this.allActions;
  }

  @computed('allFields.length', 'result.action')
  get availableFields() {
    if (this.choiceFieldActions.includes(this.result.action)) {
      return this.allFields.filter(field => field.choicefield);
    } else {
      return this.allFields;
    }
  }

  @computed('allFields.length')
  get allFieldsReady() {
    return this.allFields.length;
  }

  @computed(
    'result.action',
    'result.field.content.choicefield.option_list.content.groups.content'
  )
  get showOptionGroups() {
    return (
      this.result.action === 'change-option-group' &&
      this.result.field.content.choicefield
    );
  }

  @computed('optionGroups')
  get fieldHasOptionGroups() {
    return this.optionGroups.length > 0;
  }

  @computed(
    'result.field.content.choicefield.option_list.content.groups.content'
  )
  get optionGroups() {
    return this.result.field.content.choicefield.option_list.content.groups.content;
  }

  @action
  resultActionChanged(value) {
    this.result.action = value;
  }

  @action
  resultFieldChanged(value) {
    this.result.field = value;
    this.result.option_group = null;
  }

  @action
  resultOptionGroupChanged(value) {
    this.result.option_group = value;
  }

  @action
  clickedDeleteResult(result) {
    this.args.onDeleteClick(result);
  }
}
