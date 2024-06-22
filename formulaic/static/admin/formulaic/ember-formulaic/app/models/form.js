import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class FormModel extends Model {
    @attr('string') name;
    @attr('string') slug;
    @attr('string') success_message;
    @belongsTo('privacypolicy', { async: true, inverse: 'forms' }) privacy_policy;
    @hasMany('field', { async: true, inverse: 'form' }) fields;
    @hasMany('rule', { async: true, inverse: 'form' }) rules;
}
