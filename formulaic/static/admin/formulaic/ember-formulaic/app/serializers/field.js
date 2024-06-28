import JSONSerializer from '@ember-data/serializer/json';

export default class FieldSerializer extends JSONSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    let data, included;

    // Normalize each item in the payload and extract included records
    if (Array.isArray(payload)) {
      data = payload.map((item) => this._normalizeItem(item));
      included = this._extractIncluded(payload);
    } else {
      data = this._normalizeItem(payload);
      included = this._extractIncluded([payload]);
    }

    // Push included records into the store before the main data
    included.forEach(record => {
      store.push({ data: record });
    });

    // Return the main data
    return { data };
  }

  _normalizeItem(item) {
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

        if (item.choicefield.option_list && !seenOptionLists.has(item.choicefield.option_list.id)) {
          seenOptionLists.add(item.choicefield.option_list.id);
          included.push(this._createIncludedRecord('optionlist', item.choicefield.option_list, item.choicefield));
        }

        if (item.choicefield.option_group && !seenOptionGroups.has(item.choicefield.option_group.id)) {
          seenOptionGroups.add(item.choicefield.option_group.id);
          included.push(this._createIncludedRecord('optiongroup', item.choicefield.option_group, item.choicefield));
        }

        if (item.choicefield.default_option && !seenOptions.has(item.choicefield.default_option.id)) {
          seenOptions.add(item.choicefield.default_option.id);
          included.push(this._createIncludedRecord('option', item.choicefield.default_option, item.choicefield));
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

      if (item.option_list && !seenOptionLists.has(item.option_list)) {
        seenOptionLists.add(item.option_list);
        included.push(this._createIncludedRecord('optionlist', { id: item.option_list }, item));
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

    return {
      id: String(item.id),
      type: type,
      attributes,
      relationships
    };
  }
}
