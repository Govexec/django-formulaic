import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PreviewHiddenComponent extends Component {
  @tracked field;
  @tracked disabled;

  get placeholderValue() {
    return this.field?.completeField?.value || '';
  }

  get isDisabled() {
    return this.disabled ?? false;
  }
}
