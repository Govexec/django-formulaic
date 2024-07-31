import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {tracked} from "@glimmer/tracking";

export default class IndexFieldsComponent extends Component {
  @service router;
  @service store;
  @service('field-service') fieldService;

  @action
  createTextField(subtype) {
    let field = this.fieldService.createField(subtype, 'text');
    this.fieldService.openEditField(this, field);
  }

  @action
  createChoiceField(subtype) {
    let field = this.fieldService.createField(subtype, 'choice');
    this.fieldService.openEditField(this, field);
  }

  @action
  createBooleanField(subtype) {
    let field = this.fieldService.createField(subtype, 'boolean');
    this.fieldService.openEditField(this, field);
  }

  @action
  createHiddenField(subtype) {
    let field = this.fieldService.createField(subtype, 'hidden');
    this.fieldService.openEditField(this, field);
  }

  @action
  reloadFields() {
    this.store.unloadAll('field');
    this.refresh();
  }
}
