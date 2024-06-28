//controllers/form/fields/basefield.js

import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import slug from '../../../utils/slug';

export default class BaseFieldController extends Controller {
  @controller('form.fields') fieldsController;

  @tracked isDisplayNameWYSIWYGEnabled = false;

  editorOptions = {
    height: 120,
    force_br_newlines: false,
    force_p_newlines: false,
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
    if (this.model) {
      this.isDisplayNameWYSIWYGEnabled = this.displayNameHasHtml;
    }
  }

  get displayNameHasHtml() {
    return (
      this.model.display_name &&
      this.model.display_name.match(/<([A-Z][A-Z0-9]*)\b[^>]*>/i)
    );
  }

  get subtypeName() {
    return this.model.subtype.replace('_', ' ');
  }

  get autoSlug() {
    if (this.model.slug) {
      return this.model.slug;
    }
    return slug.generateSlug(this.model.data_name);
  }

  set autoSlug(value) {
    this.model.slug = value;
    return value;
  }

  get validator() {
    return this.fieldsController.validatorFor(this.model);
  }

  @action
  toggleDisplayNameWYSIWYG() {
    this.isDisplayNameWYSIWYGEnabled = !this.isDisplayNameWYSIWYGEnabled;
  }
}
