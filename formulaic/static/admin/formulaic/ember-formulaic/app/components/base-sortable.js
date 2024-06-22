//components/base-sortable.js

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Sortable from 'sortablejs';

export default class BaseSortableComponent extends Component {
  @tracked sortable;

  @action
  initializeSortable(element) {
    this.sortable = Sortable.create(element, {
      handle: '.handle',
      animation: 150,
      onEnd: this.updateSortable.bind(this),
    });
  }

  @action
  updateSortable() {
    const items = this.sortable.el.querySelectorAll('.item');
    items.forEach((item, index) => {
      const positionElement = item.querySelector('.position');
      positionElement.value = index;
      positionElement.dispatchEvent(new Event('change'));
    });

    this.sortable.sortable("refresh");
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.sortable) {
      this.sortable.destroy();
    }
  }
}
