//components/sortable-fields.js

import BaseSortableComponent from './base-sortable';
import { action } from '@ember/object';

export default class SortableFieldsComponent extends BaseSortableComponent {

  @action
  editField(field) {
    this.args.onEditField(field);
  }

  @action
  deleteField(field) {
    this.args.onDeleteField(field);
  }

  @action
  triggerUpdateSortable() {
    this.args.onTriggerUpdateSortable();
  }
}
