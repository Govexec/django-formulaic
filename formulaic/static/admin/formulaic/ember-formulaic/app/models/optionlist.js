import Model, { attr, hasMany } from '@ember-data/model';

export default class OptionListModel extends Model {
    @attr('string') name;
    @hasMany('option', { async: false, inverse: 'list' }) options;
    @hasMany('optiongroup', { async: false, inverse: 'list' }) groups;
    @hasMany('choicefield', { async: false, inverse: 'option_list' }) choicefield;
}
