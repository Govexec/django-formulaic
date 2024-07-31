import FieldModel from '../models/field';

export function getActualField(initialField) {
  /**
   * Gets specific instance of provided field from
   * generic instance.
   *
   * @initialField generic version of field
   */

  if (initialField instanceof FieldModel) {
    if (initialField.get('textfield')) {
      return initialField.get('textfield');
    } else if (initialField.get('choicefield')) {
      return initialField.get('choicefield');
    } else if (initialField.get('booleanfield')) {
      return initialField.get('booleanfield');
    } else if (initialField.get('hiddenfield')) {
      return initialField.get('hiddenfield');
    } else {
      // Raise exception
      throw new Error("Field type not implemented");
    }
  } else {
    return initialField;
  }
}

export default {
  getActualField: getActualField
};
