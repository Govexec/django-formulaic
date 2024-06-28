//components/form.js

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FormComponent extends Component {
  @tracked isEditing = false;

}
