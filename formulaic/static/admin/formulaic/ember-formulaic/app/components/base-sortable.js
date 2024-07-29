// components/base-sortable.js
import Component from '@glimmer/component';
import {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from "@ember/object";

export default class BaseSortableComponent extends Component {

  @service store;
  @service('field-service') fieldService;

  @tracked items = this.fieldService.currentFormRules;

  @tracked draggedItem = null;
  @tracked draggedIndex = null;
  @tracked placeholderIndex = null;

  @action
  dragStart(index, event) {
    this.draggedItem = this.items[index];
    this.draggedIndex = index;
    this.placeholderIndex = index;
  }


  @action
  dragOver(event) {
    event.preventDefault();
  }


  @action
  dragDrop(index) {
    const items = [...this.items];
    const draggedItem = this.draggedItem;

    items.splice(this.draggedIndex, 1);
    items.splice(index, 0, draggedItem);

    this.fieldService.currentFormRules = items;
    this.items = items;

    this.draggedItem = null;
    this.draggedIndex = null;
    this.placeholderIndex = null;
  }

}
