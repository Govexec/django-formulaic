import EmberObject, { computed } from '@ember/object';

export default class RuleResultValidator extends EmberObject {
  @computed('isFieldInvalid')
  get isInvalid() {
    return this.isFieldInvalid;
  }

  @computed(
    'ruleresult.action',
    'ruleresult.field.content',
    'isChangeOptionGroupAction',
    'changeOptionGroupInvalid'
  )
  get isFieldInvalid() {
    const fieldHasNoValue = this.ruleresult.action == null || this.ruleresult.field.content == null;

    if (this.isChangeOptionGroupAction) {
      // validation for change-option-group
      return this.changeOptionGroupInvalid || fieldHasNoValue;
    } else {
      return fieldHasNoValue;
    }
  }

  @computed('ruleresult.action')
  get isChangeOptionGroupAction() {
    return this.ruleresult.action === 'change-option-group';
  }

  @computed('fieldHasOptionGroups', 'ruleresult.option_group')
  get changeOptionGroupInvalid() {
    if (!this.fieldHasOptionGroups) {
      return true;
    } else if (this.ruleresult.option_group == null) {
      return true;
    }

    return false;
  }

  // TODO: dry violation
  @computed('optionGroups')
  get fieldHasOptionGroups() {
    return this.optionGroups.length > 0;
  }

  // TODO: dry violation
  @computed(
    'ruleresult.action',
    'ruleresult.field',
    'ruleresult.field.choicefield.option_list',
    'ruleresult.field.choicefield.option_list.groups'
  )
  get optionGroups() {
    return   this.ruleresult.field?.get('choicefield')?.option_list?.groups.toArray() || [];
  }
}
