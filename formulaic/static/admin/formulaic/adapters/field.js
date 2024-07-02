import RESTSerializer, { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class FieldSerializer extends RESTSerializer.extend(EmbeddedRecordsMixin) {
  attrs = {
    textfield: { embedded: 'always' },
    choicefield: { embedded: 'always' },
    booleanfield: { embedded: 'always' },
    hiddenfield: { embedded: 'always' }
  };

  normalize(modelClass, resourceHash) {
    // Check if relationships are null and set them to an empty object if they are
    resourceHash.textfield = resourceHash.textfield || {};
    resourceHash.choicefield = resourceHash.choicefield || {};
    resourceHash.booleanfield = resourceHash.booleanfield || {};
    resourceHash.hiddenfield = resourceHash.hiddenfield || {};

    return super.normalize(modelClass, resourceHash);
  }
}
