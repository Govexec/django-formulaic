import BaseField from './basefield';
import DS from 'ember-data';
import HiddenFieldValidator from '../validators/fields/hiddenfield';

export default BaseField.extend({
    field: DS.belongsTo('field'),
    value: DS.attr('string'),

    init() {
        this._super(...arguments);
        this.validator = HiddenFieldValidator.create({field: this});
    }
});
