import { belongsTo, attr } from '@ember-data/model';
import BaseFieldModel from './basefield';
import HiddenFieldValidator from '../validators/fields/hiddenfield';

export default class HiddenFieldModel extends BaseFieldModel {
    @belongsTo('field', { async: false, inverse: 'hiddenfield' }) field;
    @attr('string') value;

    constructor() {
        super(...arguments);
        this.validator = HiddenFieldValidator.create({ field: this });
    }
}
