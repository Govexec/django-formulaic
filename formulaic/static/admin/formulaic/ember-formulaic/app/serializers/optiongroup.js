import JSONSerializer from '@ember-data/serializer/json';

export default class OptionGroupSerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    let data, included;

    if (Array.isArray(payload)) {
      data = payload.map((item) => this._normalizeItem(item));
      included = this._extractIncluded(payload);
    } else {
      data = this._normalizeItem(payload);
      included = this._extractIncluded([payload]);
    }

    included.forEach(record => {
      store.push({ data: record });
    });

    return { data };
  }

  _normalizeItem(item) {
    let attributes = {
      name: item.name,
      position: item.position
    };

    let relationships = {
      options: item.options ? item.options.map(option => ({ data: { type: 'option', id: String(option.id) } })) : [],
      list: item.list ? { data: { type: 'optionlist', id: String(item.list) } } : null
    };

    return { id: String(item.id), type: 'optiongroup', attributes, relationships };
  }

  _extractIncluded(payload) {
    let included = [];
    let seenOptions = new Set();

    payload.forEach((item) => {
      if (item.options && item.options.length) {
        item.options.forEach(option => {
          if (!seenOptions.has(option.id)) {
            seenOptions.add(option.id);
            included.push(this._createIncludedRecord('option', option, item));
          }
        });
      }
    });

    return included;
  }

  _createIncludedRecord(type, item, parentItem) {
    let attributes = {
      name: item.name,
      value: item.value,
      position: item.position
    };

    let relationships = {
      group: { data: { type: 'optiongroup', id: String(parentItem.id) } },
      list: { data: { type: 'optionlist', id: String(item.list) } }
    };

    return {
      id: String(item.id),
      type: type,
      attributes,
      relationships
    };
  }
}
