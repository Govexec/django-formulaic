import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class IndexFieldsController extends Controller {
  @service router;
  @service store;
  @service('field-service') fieldService;

  @action
  createTextField(subtype) {
    let field = this.fieldService.createField(subtype, this.model, 'text');
    this.fieldService.openEditField(this, field);
  }

  @action
  createChoiceField(subtype) {
    let field = this.fieldService.createField(subtype, this.model, 'choice');
    this.fieldService.openEditField(this, field);
  }

  @action
  createBooleanField(subtype) {
    let field = this.fieldService.createField(subtype, this.model, 'boolean');
    this.fieldService.openEditField(this, field);
  }

  @action
  createHiddenField(subtype) {
    let field = this.fieldService.createField(subtype, this.model, 'hidden');
    this.fieldService.openEditField(this, field);
  }
}
