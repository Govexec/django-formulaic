import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class FieldSerializer extends RESTSerializer.extend(EmbeddedRecordsMixin) {
  attrs = {
    textfield: { embedded: 'always' },
    choicefield: { embedded: 'always' },
    booleanfield: { embedded: 'always' },
    hiddenfield: { embedded: 'always' }
  };
}
