import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PreviewRadioSelectComponent extends Component {
  @tracked field;

  get defaultRadioLabel() {
    if (this.field?.completeField?.default_option) {
      return this.field.completeField.default_option.name;
    } else if (this.field?.completeField?.default_text) {
      return this.field.completeField.default_text;
    } else {
      return 'Lorem ipsum dolor sit amet, leo in, in vivamus.';
    }
  }
}
