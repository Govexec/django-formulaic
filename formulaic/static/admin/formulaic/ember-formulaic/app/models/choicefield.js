import { belongsTo, attr, hasMany } from '@ember-data/model';
import BaseFieldModel from './basefield';
import ChoiceFieldValidator from '../validators/fields/choicefield';

export default class ChoiceFieldModel extends BaseFieldModel {
    @belongsTo('field', { async: false, inverse: 'choicefield' }) field;
    @attr('string') minimum_selections;
    @attr('string') maximum_selections;
    @belongsTo('optionlist', { async: false, inverse: 'choicefield' }) option_list;
    @belongsTo('optiongroup', { async: false, inverse: null }) option_group;
    @belongsTo('option', { async: false, inverse: null }) default_option;
    @hasMany('option', { async: false, inverse: null }) default_options;
    @attr('string') default_text;

    constructor() {
        super(...arguments);
        this.validator = ChoiceFieldValidator.create({ field: this });
    }
}
