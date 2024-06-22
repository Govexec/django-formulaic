import Model, { attr, belongsTo } from '@ember-data/model';

export default class OptionModel extends Model {
    @attr('string') name;
    @attr('string') value;
    @attr('number') position;
    @belongsTo('optionlist') list;
}
