//components/form/fields/hiddenfield.js

import BaseFieldComponent from './basefield';

export default class HiddenFieldComponent extends BaseFieldComponent {

  get dataNameChanged() {
    // auto-populate `display_name`; doesn't display anywhere
    if (this.model && this.model.data_name) {
      this.model.display_name = this.model.data_name;
    }
    return this.model.data_name;
  }

  constructor() {
    super(...arguments);
    this.dataNameChanged; // Initialize the data name change logic
  }
}
