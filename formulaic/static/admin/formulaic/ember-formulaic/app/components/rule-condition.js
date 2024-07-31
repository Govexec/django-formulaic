import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {action, computed} from '@ember/object';
import {once} from '@ember/runloop';

const FIELD_TYPE_TEXTFIELD = 'textfield';
const FIELD_TYPE_CHOICEFIELD = 'choicefield';
const FIELD_TYPE_BOOLEANFIELD = 'booleanfield';

export default class RuleConditionComponent extends Component {
  @service store;
  @service('field-service') fieldService;

  @tracked condition = this.args.condition;
  @tracked allFields = this.fieldService.currentFormFields;
  @tracked value;
  _previousFieldType = null;
  _fieldTypeInitialized = false;

  allOperators = [
    {value: "is", name: "is"},
    {value: "is_not", name: "is not"}
    // Other operators can be added here
  ];

  @computed('allOperators')
  get availableOperators() {
    return this.allOperators;
  }

  @computed('condition.field')
  get fieldType() {
    const field = this.condition.field;
    if (field.content?.textfield) {
      return FIELD_TYPE_TEXTFIELD;
    } else if (field.content?.choicefield) {
      return FIELD_TYPE_CHOICEFIELD;
    } else if (field.content?.booleanfield) {
      return FIELD_TYPE_BOOLEANFIELD;
    } else {
      return null;
    }
  }

  @computed('allFields.length')
  get allFieldsReady() {
    return this.allFields?.length;
  }

  get fieldOptions() {
    return this.condition.field.content?.choicefield?.option_list?.options.toArray() || [];
  }

  @computed('fieldType')
  get useTextWidget() {
    return this.fieldType === FIELD_TYPE_TEXTFIELD;
  }

  @computed('fieldType')
  get useSelectWidget() {
    return this.fieldType === FIELD_TYPE_CHOICEFIELD;
  }

  @computed('fieldType')
  get useNoWidget() {
    return this.fieldType === FIELD_TYPE_BOOLEANFIELD;
  }

  @computed('fieldOptions', 'condition.value')
  get selectValue() {
    return this.condition.value;
  }

  @action
  watchFieldChanges() {
    if (this.fieldType && !this._fieldTypeInitialized) {
      this._previousFieldType = this.fieldType;
      this._fieldTypeInitialized = true;
    } else if (this._previousFieldType !== this.fieldType) {
      this._previousFieldType = this.fieldType;
      this.value = null;
    }
  }

  @action
  async conditionFieldChanged(event) {
    const selectedOptionId = event.target.value;

    if (this.condition.field.content?.id !== selectedOptionId) {
      this.condition.field = await this.store.peekRecord('field', selectedOptionId);
    }
  }

  @action
  async conditionOperatorChanged(event) {
    this.condition.operator = event.target.value;
  }

  @action
  conditionSelectValueChanged(event) {
    this.condition.value = event.target.value;
  }

  @action
  conditionInputValueChanged(event) {
    this.condition.value = event.target.value;
  }

  @action
  clickedDeleteCondition(condition) {
    this.args.onDeleteClick(condition);
  }
}
