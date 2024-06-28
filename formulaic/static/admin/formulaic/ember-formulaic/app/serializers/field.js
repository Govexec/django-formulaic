import JSONSerializer from '@ember-data/serializer/json';

export default class FieldSerializer extends JSONSerializer {
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
      display_name: item.display_name,
      data_name: item.data_name,
      slug: item.slug,
      required: item.required,
      model_class: item.model_class,
      position: item.position,
      form: item.form,
      subtype: item.subtype,
      enabled: item.enabled,
      content_type: item.content_type
    };

    let relationships = {
      textfield: item.textfield ? { data: { type: 'textfield', id: String(item.textfield.id) } } : null,
      booleanfield: item.booleanfield ? { data: { type: 'booleanfield', id: String(item.booleanfield.id) } } : null,
      choicefield: item.choicefield ? { data: { type: 'choicefield', id: String(item.choicefield.id) } } : null,
      hiddenfield: item.hiddenfield ? { data: { type: 'hiddenfield', id: String(item.hiddenfield.id) } } : null,
      form: item.form ? { data: { type: 'form', id: String(item.form) } } : null,
    };

    return { id: String(item.id), type: 'field', attributes, relationships };
  }

  _extractIncluded(payload) {
    let included = [];
    let seenTextfields = new Set();
    let seenBooleanfields = new Set();
    let seenChoicefields = new Set();
    let seenHiddenfields = new Set();
    let seenOptionLists = new Set();
    let seenOptionGroups = new Set();
    let seenOptions = new Set();

    payload.forEach((item) => {
      if (item.textfield && !seenTextfields.has(item.textfield.id)) {
        seenTextfields.add(item.textfield.id);
        included.push(this._createIncludedRecord('textfield', item.textfield, item));
      }

      if (item.booleanfield && !seenBooleanfields.has(item.booleanfield.id)) {
        seenBooleanfields.add(item.booleanfield.id);
        included.push(this._createIncludedRecord('booleanfield', item.booleanfield, item));
      }

      if (item.choicefield && !seenChoicefields.has(item.choicefield.id)) {
        seenChoicefields.add(item.choicefield.id);
        included.push(this._createIncludedRecord('choicefield', item.choicefield, item));

        if (item.choicefield.option_list && !seenOptionLists.has(item.choicefield.option_list)) {
          seenOptionLists.add(item.choicefield.option_list);
          included.push(this._createIncludedRecord('optionlist', { id: item.choicefield.option_list }, item.choicefield));
        }

        if (item.choicefield.option_group && !seenOptionGroups.has(item.choicefield.option_group)) {
          seenOptionGroups.add(item.choicefield.option_group);
          included.push(this._createIncludedRecord('optiongroup', { id: item.choicefield.option_group }, item.choicefield));
        }

        if (item.choicefield.default_option && !seenOptions.has(item.choicefield.default_option)) {
          seenOptions.add(item.choicefield.default_option);
          included.push(this._createIncludedRecord('option', { id: item.choicefield.default_option }, item.choicefield));
        }

        if (item.choicefield.default_options && item.choicefield.default_options.length) {
          item.choicefield.default_options.forEach(option => {
            if (!seenOptions.has(option.id)) {
              seenOptions.add(option.id);
              included.push(this._createIncludedRecord('option', option, item.choicefield));
            }
          });
        }
      }

      if (item.hiddenfield && !seenHiddenfields.has(item.hiddenfield.id)) {
        seenHiddenfields.add(item.hiddenfield.id);
        included.push(this._createIncludedRecord('hiddenfield', item.hiddenfield, item));
      }

    });

    return included;
  }

  _createIncludedRecord(type, item, parentItem) {
    let attributes = item;

    let relationships = {
      field: { data: { type: 'field', id: String(parentItem.id) } },
      form: { data: { type: 'form', id: String(item.form) } }
    };

    if (type === 'choicefield') {
      relationships.option_list = item.option_list ? { data: { type: 'optionlist', id: String(item.option_list) } } : null;
      relationships.option_group = item.option_group ? { data: { type: 'optiongroup', id: String(item.option_group) } } : null;
      relationships.default_option = item.default_option ? { data: { type: 'option', id: String(item.default_option) } } : null;
      relationships.default_options = item.default_options ? item.default_options.map(option => ({ data: { type: 'option', id: String(option) } })) : [];
    }

    return {
      id: String(item.id),
      type: type,
      attributes,
      relationships
    };
  }
}
