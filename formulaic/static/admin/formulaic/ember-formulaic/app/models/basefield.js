import Model, { attr, belongsTo } from '@ember-data/model';

export default class BaseFieldModel extends Model {
    @attr('string') name;
    @attr('string') display_name;
    @attr('string') data_name;
    @attr('string') slug;
    @attr('boolean') required;
    @attr('string') help_text;
    @attr('string') model_class;
    @attr('number') position;
    @attr('string') css_class;
    @belongsTo('form', { async: false, inverse: 'fields', as: 'field' }) form;
    @attr('boolean') enabled;
    @attr('string') subtype;
}
