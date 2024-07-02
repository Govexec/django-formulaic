import JSONSerializer from '@ember-data/serializer/json';

export default class OptionSerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    let data, included;

    if (Array.isArray(payload)) {
      data = payload.map((item) => this._normalizeItem(item));
    } else {
      data = this._normalizeItem(payload);
    }

    return { data };
  }

  _normalizeItem(item) {
    let attributes = {
      name: item.name,
      value: item.value,
      position: item.position
    };

    let relationships = {
      list: item.list ? { data: { type: 'optionlist', id: String(item.list) } } : null
    };

    return { id: String(item.id), type: 'option', attributes, relationships };
  }
}
