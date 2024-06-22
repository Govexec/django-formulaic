import DS from 'ember-data';
import BaseField from './basefield';
import BooleanFieldValidator from '../validators/fields/booleanfield';

export default BaseField.extend({
    field: DS.belongsTo('field'),
    default_checked: DS.attr('boolean'),

    init() {
        this._super(...arguments);
        this.validator = BooleanFieldValidator.create({field: this});
    }
});
