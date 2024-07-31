import BaseFieldValidator from './basefield';

export default class HiddenFieldValidator extends BaseFieldValidator {
  get isDisplayNameInvalid() {
    return false;
  }
}
