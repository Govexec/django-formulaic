import JSONSerializer from '@ember-data/serializer/json';

export default class OptionlistSerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    let data;

    if (Array.isArray(payload)) {
      data = payload.map((item) => this._normalizeItem(item));
    } else {
      data = this._normalizeItem(payload);
    }

    if (requestType === 'queryRecord' && Array.isArray(data) && data.length > 0) {
      data = data[0];
    }

    return { data };
  }

  _normalizeItem(item) {
    let attributes = {
      name: item.name,
    };

    let relationships = {
      options: {
        data: (item.options || []).map((opt) => ({ type: 'option', id: String(opt.id) })),
      },
      groups: {
        data: this._uniqueById(item.groups || []).map((grp) => ({ type: 'optiongroup', id: String(grp.id) })),
      },
      choice_fields: {
        data: (item.choice_fields || []).map((cf) => ({ type: 'choicefield', id: String(cf.id) })),
      },
    };

    return { id: String(item.id), type: 'optionlist', attributes, relationships };
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
