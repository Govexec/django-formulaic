import JSONSerializer from '@ember-data/serializer/json';

export default class OptionListSerializer extends JSONSerializer {
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
      name: item.name
    };

    let relationships = {
      options: item.options ? item.options.map(option => ({ data: { type: 'option', id: String(option.id) } })) : [],
      groups: item.groups ? item.groups.map(group => ({ data: { type: 'optiongroup', id: String(group.id) } })) : []
    };

    return { id: String(item.id), type: 'optionlist', attributes, relationships };
  }

  _extractIncluded(payload) {
    let included = [];
    let seenOptions = new Set();
    let seenOptionGroups = new Set();

    payload.forEach((item) => {
      if (item.options && item.options.length) {
        item.options.forEach(option => {
          if (!seenOptions.has(option.id)) {
            seenOptions.add(option.id);
            included.push(this._createIncludedRecord('option', option, item));
          }
        });
      }

      if (item.groups && item.groups.length) {
        item.groups.forEach(group => {
          if (!seenOptionGroups.has(group.id)) {
            seenOptionGroups.add(group.id);
            included.push(this._createIncludedRecord('optiongroup', group, item));
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
      position: item.position,
      list: item.list
    };

    let relationships = {
      list: { data: { type: 'optionlist', id: String(parentItem.id) } }
    };

    return {
      id: String(item.id),
      type: type,
      attributes,
      relationships
    };
  }
}
