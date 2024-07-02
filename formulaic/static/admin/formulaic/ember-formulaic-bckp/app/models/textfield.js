import DS from 'ember-data';
import BaseField from './basefield';
import TextFieldValidator from '../validators/fields/textfield';

export default BaseField.extend({
    field: DS.belongsTo('field'),

    init() {
        this._super(...arguments);
        this.validator = TextFieldValidator.create({field: this});
    }
});
