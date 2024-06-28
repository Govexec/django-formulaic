//routes/form/field.js

import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default class FieldsRoute extends Route {
  @service store;
  @service('field-service') fieldService;

  get form() {
    return this.modelFor('form');
  }

  get formId() {
    return this.form.id;
  }

  async model() {
    try {
      let fieldRecords = await this.store.query('field', { form: this.formId });

      let updatedFieldRecords = await Promise.all(
        fieldRecords.map(async (field) => {
          if (field.model_class === 'choicefield') {
            // Ensure option_list is loaded
            await field.choicefield.option_list;

            // Update other relationships if needed
            await field.choicefield.default_option;
            await field.choicefield.option_group;
            await field.choicefield.default_options;
          }

          console.warn("field : ", field);

          return field;
        })
      );

      //console.warn("updatedFieldRecords : ", updatedFieldRecords);

      return updatedFieldRecords; // Return the updated field records
    } catch (error) {
    }
  }


  renderTemplate() {
    this.render('form.fields');
    //this.fieldService.renderDefaultSidebar(this.controller);
  }
}
