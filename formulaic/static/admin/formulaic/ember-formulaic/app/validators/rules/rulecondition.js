import EmberObject, { computed } from '@ember/object';
import { isBlank } from '@ember/utils';

export default class RuleConditionValidator extends EmberObject {
  @computed('isFieldInvalid', 'isValueInvalid')
  get isInvalid() {
    return this.isFieldInvalid || this.isValueInvalid;
  }

  @computed('rulecondition.field.content')
  get isFieldInvalid() {
    return this.rulecondition.field?.content == null;
  }

  @computed('rulecondition.value')
  get isValueInvalid() {
    const isBooleanField = this.rulecondition.field?.content?.booleanfield != null;
    return isBlank(this.rulecondition.value) && !isBooleanField;
  }
}
