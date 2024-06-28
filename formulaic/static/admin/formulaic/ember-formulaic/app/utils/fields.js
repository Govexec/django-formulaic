import FieldModel from '../models/field';

export function getActualField(initialField) {
  /**
   * Gets specific instance of provided field from
   * generic instance.
   *
   * @initialField generic version of field
   */

  if (initialField instanceof FieldModel) {
    console.warn("initialField :", initialField);
    if (initialField.get('textfield')) {
      console.warn("stopped at : textfield");
      return initialField.get('textfield');
    } else if (initialField.get('choicefield')) {
      console.warn("stopped at : choicefield");
      return initialField.get('choicefield');
    } else if (initialField.get('booleanfield')) {
      console.warn("stopped at : booleanfield");
      return initialField.get('booleanfield');
    } else if (initialField.get('hiddenfield')) {
      console.warn("stopped at : hiddenfield");
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
