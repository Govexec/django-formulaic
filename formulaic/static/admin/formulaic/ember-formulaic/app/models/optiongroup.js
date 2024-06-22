import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class OptionGroupModel extends Model {
    @attr('string') name;
    @attr('number') position;
    @belongsTo('optionlist', { async: true, inverse: 'groups' }) list;
    @hasMany('option', { async: true, inverse: 'option_group' }) options;
}
