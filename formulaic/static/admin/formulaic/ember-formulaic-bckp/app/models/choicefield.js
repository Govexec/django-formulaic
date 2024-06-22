import DS from 'ember-data';
import BaseField from './basefield';
import ChoiceFieldValidator from '../validators/fields/choicefield';

export default BaseField.extend({
    field: DS.belongsTo('field', { async: false }),
    minimum_selections: DS.attr('string'),
    maximum_selections: DS.attr('string'),
    option_list: DS.belongsTo('optionlist', { async: true }),
    option_group: DS.belongsTo('optiongroup', { async: true }),
    default_option: DS.belongsTo('option', {async: true }),
    default_options: DS.hasMany('option', { async: true }),
    default_text: DS.attr('string'),

    init() {
        this._super(...arguments);
        this.validator = ChoiceFieldValidator.create({field: this});
    }
});
