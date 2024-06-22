import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';

const FIELD_TYPE_TEXTFIELD = 'textfield';
const FIELD_TYPE_CHOICEFIELD = 'choicefield';
const FIELD_TYPE_BOOLEANFIELD = 'booleanfield';

export default class RuleConditionComponent extends Component {
  @service store;

  @tracked condition;
  @tracked value;
  _previousFieldType = null;
  _fieldTypeInitialized = false;

  allOperators = [
    { value: "is", name: "is" },
    { value: "is_not", name: "is not" }
    // Other operators can be added here
  ];

  @computed('allOperators')
  get availableOperators() {
    return this.allOperators;
  }

  @computed('condition.field.content', 'condition.field.isFulfilled')
  get fieldType() {
    const field = this.condition.field;
    if (field.isFulfilled) {
      if (field.content.textfield) {
        return FIELD_TYPE_TEXTFIELD;
      } else if (field.content.choicefield) {
        return FIELD_TYPE_CHOICEFIELD;
      } else if (field.content.booleanfield) {
        return FIELD_TYPE_BOOLEANFIELD;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  @computed('allFields.length')
  get allFieldsReady() {
    return this.allFields.length;
  }

  @computed('condition.field.content')
  get fieldOptions() {
    return this.condition.field.content.choicefield.option_list.options;
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
  conditionFieldChanged(value) {
    this.condition.field = value;
  }

  @action
  conditionOperatorChanged(value) {
    this.condition.operator = value;
  }

  @action
  conditionSelectValueChanged(value) {
    this.condition.value = value;
  }

  @action
  clickedDeleteCondition(condition) {
    this.args.onDeleteClick(condition);
  }
}
