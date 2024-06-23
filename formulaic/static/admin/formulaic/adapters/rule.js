import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class RuleSerializer extends RESTSerializer.extend(EmbeddedRecordsMixin) {
  attrs = {
    conditions: { embedded: 'always' },
    results: { embedded: 'always' }
  };
}
