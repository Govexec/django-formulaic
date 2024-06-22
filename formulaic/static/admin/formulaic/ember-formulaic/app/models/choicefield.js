import { belongsTo, attr, hasMany } from '@ember-data/model';
import BaseFieldModel from './basefield';
import ChoiceFieldValidator from '../validators/fields/choicefield';

export default class ChoiceFieldModel extends BaseFieldModel {
    @belongsTo('field', { async: false }) field;
    @attr('string') minimum_selections;
    @attr('string') maximum_selections;
    @belongsTo('optionlist', { async: true }) option_list;
    @belongsTo('optiongroup', { async: true }) option_group;
    @belongsTo('option', { async: true }) default_option;
    @hasMany('option', { async: true }) default_options;
    @attr('string') default_text;

    constructor() {
        super(...arguments);
        this.validator = ChoiceFieldValidator.create({ field: this });
    }
}
