import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class FieldService extends Service {
  @service store;
  @service router;

  createBaseField(subtype, form) {
    const position = document.querySelectorAll('.field-sortable .item').length;
    return this.store.createRecord('field', {
      display_name: null,
      data_name: null,
      slug: null,
      required: false,
      help_text: null,
      model_class: 'textfield',
      position: position,
      css_class: null,
      subtype: subtype,
      form: form
    });
  }

  renderFieldSidebar(context, field) {
    const fieldType = field.textfield || field.choicefield || field.booleanfield || field.hiddenfield;
    if (!fieldType) {
      throw new Error("Formulaic: field type not implemented");
    }

    const templateName = `form/fields/${fieldType.modelName}`;
    const controllerName = `form/fields/${fieldType.modelName}`;

    context.render(templateName, {
      into: 'form.fields',
      outlet: 'sidebar',
      model: fieldType,
      controller: controllerName
    });
  }

  openEditField(context, field) {
    context.set('currentField', field);
    this.renderFieldSidebar(context, field);
  }

  closeEditField(context) {
    context.set('currentField', null);
    context.render('form.fields.index', {
      into: 'form.fields',
      outlet: 'sidebar'
    });
  }

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

    let field = this.createBaseField(subtype, form);
    let specificField;

    switch (type) {
      case 'text':
        specificField = this.store.createRecord('textfield', { ...field, subtype });
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
        specificField = this.store.createRecord('booleanfield', { ...field, subtype });
        break;
      case 'hidden':
        specificField = this.store.createRecord('hiddenfield', { ...field, subtype, value: "" });
        break;
    }

    field[type + 'field'] = specificField;
    return field;
  }
}
