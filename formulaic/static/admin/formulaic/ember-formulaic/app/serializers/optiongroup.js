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

    if (requestType === 'queryRecord' && Array.isArray(data) && data.length > 0) {
      data = data[0];
    }

    return { data, included };
  }

  _normalizeItem(item) {
    let attributes = {
      name: item.name,
      position: item.position,
    };

    let uniqueOptions = this._uniqueById(item.options || []);
    let relationships = {
      list: item.list ? { data: { type: 'optionlist', id: String(item.list) } } : null,
      options: {
        data: uniqueOptions.map((opt) => ({ type: 'option', id: String(opt.id) })),
      },
    };

    return { id: String(item.id), type: 'optiongroup', attributes, relationships };
  }

  _extractIncluded(payload) {
    let included = [];
    let seenOptions = new Set();

    payload.forEach((item) => {
      this._uniqueById(item.options || []).forEach((opt) => {
        if (!seenOptions.has(opt.id)) {
          seenOptions.add(opt.id);
          included.push({
            type: 'option',
            id: String(opt.id),
            attributes: {
              name: opt.name,
              value: opt.value,
              position: opt.position,
            },
            relationships: {
              list: { data: { type: 'optionlist', id: String(opt.list) } },
              option_group: { data: { type: 'optiongroup', id: String(item.id) } },
            },
          });
        }
      });
    });

    return included;
  }

  _uniqueById(array) {
    const seen = new Set();
    return array.filter(item => {
      const id = item.id;
      if (seen.has(id)) {
        return false;
      } else {
        seen.add(id);
        return true;
      }
    });
  }
}
