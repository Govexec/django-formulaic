import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class OptionListSerializer extends RESTSerializer.extend(EmbeddedRecordsMixin) {
  attrs = {
    options: { embedded: 'always' }
  };
}
