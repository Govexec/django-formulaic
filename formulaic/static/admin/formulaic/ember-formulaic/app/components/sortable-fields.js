//components/sortable-field.js

import BaseSortableComponent from './base-sortable';
import { action } from '@ember/object';

export default class SortableFieldsComponent extends BaseSortableComponent {
  templateName = 'sortable/fields';
  sortableSelector = '.field-sortable';

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
