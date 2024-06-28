//components/sortable-fields.js

import BaseSortableComponent from './base-sortable';
import {action} from '@ember/object';

export default class SortableFieldsComponent extends BaseSortableComponent {
  @action
  triggerUpdateSortable() {
    this.args.onOrderInvalidated();
  }
}
