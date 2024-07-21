import BaseSortableComponent from './base-sortable';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';

export default class SortableRulesComponent extends BaseSortableComponent {
  @service store;
   @service('field-service') fieldService;

  sortableSelector = '.rule-sortable';
}
