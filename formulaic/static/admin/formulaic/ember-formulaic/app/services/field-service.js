//services/field-service.js

import {tracked} from '@glimmer/tracking';
import Service from '@ember/service';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {A} from '@ember/array';

export default class FieldService extends Service {
  @service store;
  @service router;

  @tracked currentFormRules = A([]);
  @tracked currentFormFields = A([]);
  @tracked currentForm = null;
  @tracked currentField = null;
  @tracked validators = {};

  fieldTypes() {
    return {
      TEXTFIELD: 'textfield',
      CHOICEFIELD: 'choicefield',
      BOOLEANFIELD: 'booleanfield',
      HIDDENFIELD: 'hiddenfield'
    };
  }

  eq(a, b) {
    return a === b;
  }

  validatorFor(field) {
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

  openEditField(context, field) {
    this.currentField = field.get(field.model_class);
    console.warn("this.currentField : ", this.currentField);
  }

  closeEditField() {
    this.currentField = null;
  }

  createBaseField(subtype, model_class) {
    const position = document.querySelectorAll('.field-sortable .item').length;
    let field = this.store.createRecord('field', {
      display_name: null,
      data_name: null,
      slug: null,
      required: false,
      help_text: null,
      model_class: model_class,
      position: position + 1,
      css_class: null,
      subtype: subtype,
      form: this.currentForm,
    });

    return field;
  }

  // this will return generic FieldModel ::: not specific model
  createField(subtype, type) {
    const validSubtypes = {
      text: ["text", "textarea", "email", "phone_number", "integer", "full_name"],
      choice: ["select", "radio_select", "checkbox_select_multiple", "select_multiple"],
      boolean: ["checkbox"],
      hidden: ["hidden"]
    };

    if (!validSubtypes[type].includes(subtype)) {
      throw new Error(`Formulaic: ${type} field subtype \`${subtype}\` not implemented`);
    }

    let field = this.createBaseField(subtype, (type + "field"));

    const commonProperties = {
      display_name: field.display_name,
      data_name: field.data_name,
      slug: field.slug,
      required: field.required,
      help_text: field.help_text,
      model_class: field.model_class,
      position: field.position,
      css_class: field.css_class,
      subtype: field.subtype,
      form: field.form
    };

    let specificField;

    switch (type) {
      case 'text':
        specificField = this.store.createRecord('textfield', commonProperties);
        break;
      case 'choice':
        specificField = this.store.createRecord('choicefield', {
          ...commonProperties,
          minimum_selections: null,
          maximum_selections: null,
          option_list: null,
          default_option: null,
          default_options: []
        });
        break;
      case 'boolean':
        specificField = this.store.createRecord('booleanfield', commonProperties);
        break;
      case 'hidden':
        specificField = this.store.createRecord('hiddenfield', {...commonProperties, value: ""});
        break;
    }

    field[type + 'field'] = specificField;

    this.currentFormFields.pushObject(field);

    return field;
  }

  @action
  refreshCurrentRoute(currentRouteName) {
    let route = this.router._router._routerMicrolib.getRoute(currentRouteName);
    if (route) {
      route.refresh();
    }
  }

  clearFields() {
    this.currentFormFields.clear();
  }
}
