//components/form/fields/basefield.js

import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import slug from '../../../utils/slug';

export default class BaseFieldComponent extends Component {
  @service('field-service') fieldService;

  @tracked isDisplayNameWYSIWYGEnabled = false;

  editorOptions = {
    height: 120,
    force_br_newlines: false,
    forced_root_block: '',
    menubar: false,
    plugins: ['link'],
    toolbar: 'bold italic | link'
  };

  constructor() {
    super(...arguments);
    this.setupModelObserver();
  }

  setupModelObserver() {
    if (this.fieldService.currentField) {
      this.isDisplayNameWYSIWYGEnabled = this.displayNameHasHtml;
    }
  }

  get displayNameHasHtml() {
    return (
      this.fieldService.currentField.display_name &&
      this.fieldService.currentField.display_name.match(/<([A-Z][A-Z0-9]*)\b[^>]*>/i)
    );
  }

  get subtypeName() {
    return this.fieldService.currentField.subtype.replace('_', ' ');
  }

  get autoSlug() {

    if(this.fieldService.currentField.model_class === this.fieldService.fieldTypes().HIDDENFIELD)
    {
      this.fieldService.currentField.display_name = this.fieldService.currentField.data_name;
    }

    if (this.fieldService.currentField.slug)
    {
      return this.fieldService.currentField.slug;
    }
    return slug.generateSlug(this.fieldService.currentField.data_name);
  }

  set autoSlug(value) {
    this.fieldService.currentField.slug = value;
    return value;
  }

  get validator() {
    return this.fieldService.validatorFor(this.fieldService.currentField);
  }

  @action
  toggleDisplayNameWYSIWYG() {
    this.isDisplayNameWYSIWYGEnabled = !this.isDisplayNameWYSIWYGEnabled;
  }

  @action
  updateDisplayName(newValue) {
    this.fieldService.currentField.display_name = newValue;
  }

  @action
  doneEditingField() {
    this.fieldService.closeEditField(this);
  }
}
