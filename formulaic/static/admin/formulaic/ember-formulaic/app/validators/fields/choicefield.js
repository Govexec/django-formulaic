import { computed } from '@ember/object';
import BaseFieldValidator from './basefield';

export default class ChoiceFieldValidator extends BaseFieldValidator {
  @computed(
    'isDisplayNameInvalid',
    'isDataNameInvalid',
    'isSlugInvalid',
    'isOptionListInvalid'
  )
  get isInvalid() {
    return super.isInvalid || this.isOptionListInvalid;
  }

  @computed('field.option_list.isLoaded', 'field.option_list')
  get isOptionListInvalid() {
    return this.field.option_list?.id == null;
  }
}
