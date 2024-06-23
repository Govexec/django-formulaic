// components/base-sortable.js
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class BaseSortableComponent extends Component {
  @action
  updateSortable(sortedItems) {
    sortedItems.forEach((item, index) => {
      item.position = index;
      item.save(); // or dispatch a change event if needed
    });
  }
}
