//services/field-service.js

import {tracked} from '@glimmer/tracking';
import Service from '@ember/service';
import {inject as service} from '@ember/service';

export default class FieldService extends Service {
  @service store;
  @service router;
  @tracked currentField = null;
  @tracked validators = {};

  eq(a, b) {
    return a === b;
  }

  async validatorFor(field) {
    let validatorKey = field.toString();
    if (!this.validators[validatorKey]) {
      this.validators[validatorKey] = field.validator;
    }
    return this.validators[validatorKey];
  }

  removeValidatorFor(field) {
    let validatorKey = field.toString();
    if (this.validators[validatorKey]) {
      this.validators[validatorKey].destroy();
      delete this.validators[validatorKey];
    }
  }

  createBaseField(subtype, form, model_class) {
    const position = document.querySelectorAll('.field-sortable .item').length;
    let field = this.store.createRecord('field', {
      display_name: null,
      data_name: null,
      slug: null,
      required: false,
      help_text: null,
      model_class: model_class,
      position: position,
      css_class: null,
      subtype: subtype,
      form: form
    });

    return field;
  }

  openEditField(context, field) {
    this.currentField = field.get(field.model_class);
    console.warn("this.currentField : ", this.currentField);
  }

  closeEditField() {
    this.currentField = null;
  }

  // this will return generic FieldModel ::: not specific model
  createField(subtype, form, type) {
    const validSubtypes = {
      text: ["text", "textarea", "email", "phone_number", "integer", "full_name"],
      choice: ["select", "radio_select", "checkbox_select_multiple", "select_multiple"],
      boolean: ["checkbox"],
      hidden: ["hidden"]
    };

    if (!validSubtypes[type].includes(subtype)) {
      throw new Error(`Formulaic: ${type} field subtype \`${subtype}\` not implemented`);
    }

    let field = this.createBaseField(subtype, form, (type + "field"));
    let specificField;

    switch (type) {
      case 'text':
        specificField = this.store.createRecord('textfield', {...field, subtype});
        break;
      case 'choice':
        specificField = this.store.createRecord('choicefield', {
          ...field,
          subtype,
          minimum_selections: null,
          maximum_selections: null,
          option_list: null,
          default_option: null
        });
        break;
      case 'boolean':
        specificField = this.store.createRecord('booleanfield', {...field, subtype});
        break;
      case 'hidden':
        specificField = this.store.createRecord('hiddenfield', {...field, subtype, value: ""});
        break;
    }

    field[type + 'field'] = specificField;
    return field;
  }
}
