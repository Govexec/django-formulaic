import Model, { attr } from '@ember-data/model';

export default class PrivacyPolicyModel extends Model {
    @attr('string') name;
    @attr('string') text;
}
