import Model, { attr, hasMany } from '@ember-data/model';

export default class OptionListModel extends Model {
    @attr('string') name;
    @hasMany('option', { async: true, inverse: 'list' }) options;
    @hasMany('optiongroup', { async: true, inverse: 'list' }) groups;
}
