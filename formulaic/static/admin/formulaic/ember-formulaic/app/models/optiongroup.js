import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class OptionGroupModel extends Model {
    @attr('string') name;
    @attr('number') position;
    @belongsTo('optionlist') list;
    @hasMany('option') options;
}
