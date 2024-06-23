// app/serializers/field.js
import JSONSerializer from '@ember-data/serializer/json';

export default class FieldSerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    // Check if payload is an array
    if (Array.isArray(payload)) {
      // Wrap the array in a 'data' key
      return {
        data: payload.map((item) => this.normalize(primaryModelClass, item)),
      };
    } else {
      // Wrap the object in a 'data' key
      return {
        data: this.normalize(primaryModelClass, payload),
      };
    }
  }

  normalize(primaryModelClass, payload) {
    if (Array.isArray(payload)) {
      return payload.map((item) => this.normalizeItem(item));
    } else {
      return this.normalizeItem(payload);
    }
  }

  normalizeItem(item) {
    let attributes = {
      display_name: item.display_name,
      data_name: item.data_name,
      slug: item.slug,
      required: item.required,
      help_text: item.help_text,
      model_class: item.model_class,
      position: item.position,
      css_class: item.css_class,
      form: item.form,
      subtype: item.subtype,
    };
    let relationships = {
      textfield: { data: { embedded: 'always', type: 'textfield', id: String(item.id) } },
      booleanfield: { data: {embedded: 'always', type: 'booleanfield', id: String(item.id) } },
      choicefield: { data: {embedded: 'always', type: 'choicefield', id: String(item.id) } },
      hiddenfield: { data: {embedded: 'always', type: 'hiddenfield', id: String(item.id) } },
    };
    return { id: String(item.id), type: 'field', attributes, relationships };
  }
}
