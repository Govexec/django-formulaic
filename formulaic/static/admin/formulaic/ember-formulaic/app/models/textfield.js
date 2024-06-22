import { belongsTo } from '@ember-data/model';
import BaseField from './basefield';
import TextFieldValidator from '../validators/fields/textfield';

export default class TextFieldModel extends BaseField {
    @belongsTo('field') field;

    constructor() {
        super(...arguments);
        this.validator = TextFieldValidator.create({ field: this });
    }
}
