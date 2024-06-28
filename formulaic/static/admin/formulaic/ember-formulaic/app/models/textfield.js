import {belongsTo} from '@ember-data/model';
import BaseFieldModel from './basefield';
import TextFieldValidator from '../validators/fields/textfield';

export default class TextFieldModel extends BaseFieldModel {
  @belongsTo('field', {async: false, inverse: 'textfield'}) field;

  constructor() {
    super(...arguments);
    this.validator = TextFieldValidator.create({field: this});
  }
}
