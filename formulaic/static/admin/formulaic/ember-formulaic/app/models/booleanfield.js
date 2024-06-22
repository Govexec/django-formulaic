import { belongsTo, attr } from '@ember-data/model';
import BaseFieldModel from './basefield';
import BooleanFieldValidator from '../validators/fields/booleanfield';

export default class BooleanFieldModel extends BaseFieldModel {
    @belongsTo('field') field;
    @attr('boolean') default_checked;

    constructor() {
        super(...arguments);
        this.validator = BooleanFieldValidator.create({ field: this });
    }
}
