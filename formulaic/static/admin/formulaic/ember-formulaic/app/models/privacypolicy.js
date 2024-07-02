import Model, { attr, hasMany } from '@ember-data/model';

export default class PrivacyPolicyModel extends Model {
    @attr('string') name;
    @attr('string') text;
    @hasMany('form', { async: false, inverse: 'privacy_policy' }) forms;
}
