import Model, { attr, belongsTo } from '@ember-data/model';

export default class SubmissionModel extends Model {
    @attr('string') date_created;
    @attr('string') source;
    @attr('string') promo_source;
    @belongsTo('form', { async: true, inverse: 'submission' }) form;
    @attr('json') custom_data;
}
