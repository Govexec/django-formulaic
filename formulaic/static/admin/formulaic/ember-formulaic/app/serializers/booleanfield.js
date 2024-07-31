// serializers/text-field.js
import JSONSerializer from '@ember-data/serializer/json';

export default class BooleanFieldSerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    return super.normalizeResponse(store, primaryModelClass, payload, id, requestType);
  }
}
