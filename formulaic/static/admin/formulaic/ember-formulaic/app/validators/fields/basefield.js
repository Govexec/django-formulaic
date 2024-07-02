import EmberObject, { computed } from '@ember/object';

const DATA_NAME_LENGTH = 200;

export default class BaseFieldValidator extends EmberObject {
  @computed('isSlugInvalid', 'isDisplayNameInvalid', 'isDataNameInvalid')
  get isInvalid() {
    return this.isSlugInvalid || this.isDisplayNameInvalid || this.isDataNameInvalid;
  }

  @computed('field.display_name')
  get isDisplayNameInvalid() {
    let displayName = this.field.display_name;
    return !displayName;
  }

  @computed('field.data_name')
  get isDataNameInvalid() {
    let dataName = this.field.data_name;
    return !dataName || dataName.length > DATA_NAME_LENGTH;
  }

  @computed('field.slug', 'isDataNameInvalid')
  get isSlugInvalid() {
    /**
     * Slug may still be valid if not set.  If slug is blank, it's
     * auto-generated based on the `name` field.
     */
    return !this.field.slug && this.isDataNameInvalid;
  }
}
