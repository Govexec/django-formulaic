import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class OptionGroupModel extends Model {
    @attr('string') name;
    @attr('number') position;
    @belongsTo('optionlist', { async: false, inverse: 'groups' }) list;
    @hasMany('option', { async: false, inverse: 'option_group' }) options;
}
