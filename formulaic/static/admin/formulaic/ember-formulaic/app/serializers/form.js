// serializers/form.js
import JSONSerializer from '@ember-data/serializer/json';

export default class FormSerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    return super.normalizeResponse(store, primaryModelClass, payload, id, requestType);
  }
}
