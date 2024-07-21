import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {action, computed} from '@ember/object';

export default class RuleResultComponent extends Component {
  @service store;
  @service('field-service') fieldService;

  @tracked result = this.args.result;
  @tracked allFields = this.fieldService.currentFormFields;

  allActions = [
    {value: 'show', name: 'Show'},
    {value: 'hide', name: 'Hide'},
    {value: 'change-option-group', name: 'Change Option Group'}
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


  get showOptionGroups() {
    return (
      this.result.action === 'change-option-group' &&
      this.result.field.content?.choicefield
    );
  }

  @computed('optionGroups')
  get fieldHasOptionGroups() {
    return this.optionGroups.length > 0;
  }

  @computed('result.field')
  get optionGroups() {
    return this.result.field.content?.choicefield?.option_list?.groups.toArray() || [];
  }

  @action
  resultActionChanged(event) {
    this.result.action = event.target.value;
  }

  @action
  async resultFieldChanged(event) {

    const selectedOptionId = event.target.value;

    if (this.result.field?.content?.id !== selectedOptionId) {
      this.result.field = await this.store.peekRecord('field', selectedOptionId);
    }
  }

  @action
  async resultOptionGroupChanged(event) {
    const selectedOptionId = event.target.value;

    if (this.result.option_group?.id !== selectedOptionId) {
      this.result.option_group = await this.store.peekRecord('optiongroup', selectedOptionId);
    }
  }

  @action
  clickedDeleteResult(result) {
    this.args.onDeleteClick(result);
  }
}
