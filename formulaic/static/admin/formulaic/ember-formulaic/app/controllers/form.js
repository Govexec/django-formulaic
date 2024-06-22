//controllers/form.js

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class FormController extends Controller {
  @tracked isEditing = false;

}
