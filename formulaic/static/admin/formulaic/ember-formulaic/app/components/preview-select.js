import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PreviewSelectComponent extends Component {
  @tracked field;

  get defaultOption() {
    if (this.field?.completeField?.default_option) {
      return this.field.completeField.default_option.name;
    } else if (this.field?.completeField?.default_text) {
      return this.field.completeField.default_text;
    } else {
      return '(Choose One)';
    }
  }
}
