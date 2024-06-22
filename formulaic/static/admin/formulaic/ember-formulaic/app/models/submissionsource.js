import Model, { attr } from '@ember-data/model';

// Note: `source` name is the primary key; see serializer

export default class SubmissionSourceModel extends Model {
    @attr('number') count;
}
