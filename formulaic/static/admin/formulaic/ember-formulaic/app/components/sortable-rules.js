import BaseSortableComponent from './base-sortable';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';

export default class SortableRulesComponent extends BaseSortableComponent {
  @service store;

  sortableSelector = '.rule-sortable';

  @computed
  get allFields() {
    return this.store.findAll('field');
  }
}
