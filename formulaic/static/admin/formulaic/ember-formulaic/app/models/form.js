import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class FormModel extends Model {
    @attr('string') name;
    @attr('string') slug;
    @attr('string') success_message;
    @belongsTo('privacypolicy', { async: true, inverse: 'forms' }) privacy_policy;
    @hasMany('field', { async: false, polymorphic: true, inverse: 'form'}) fields;
    @hasMany('rule', { async: false, inverse: 'form' }) rules;
}
