import RESTSerializer from '@ember-data/serializer/rest';

export default class SubmissionSourceSerializer extends RESTSerializer {
  primaryKey = 'source';
}
