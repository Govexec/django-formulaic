//components/sortable-field.js

import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as controller} from '@ember/controller';
import {action, computed} from '@ember/object';

const FIELD_TYPES = {
  TEXTFIELD: 'textfield',
  CHOICEFIELD: 'choicefield',
  BOOLEANFIELD: 'booleanfield',
  HIDDENFIELD: 'hiddenfield'
};

export default class SortableFieldComponent extends Component {
  @controller fields;

  @tracked display_name;
  @tracked data_name;
  @tracked slug;
  @tracked field;

  constructor() {
    super(...arguments);
    this.field = this.args.field;
    //this.completeField();
  }

  get previewComponent() {
    if (this.field && this.field.subtype) {
      return  `preview-${this.field.subtype.replace('_', '-')}`;
    } else {
      return '';
    }
  }

  get completeField() {
    if (!this.field) {
      return null;
    }

    return this.field.get(this.field.model_class);
  }

  @computed('currentField')
  get isEditing() {
    return this.currentField === this.field;
  }

  @computed('field.hiddenfield')
  get showDisplayName() {
    return this.field.model_class !== FIELD_TYPES.HIDDENFIELD
  }

  @action
  invalidateOrder() {
    this.fields.invalidateOrder();
  }

  @action
  handleDisplayNameChange() {
    this.display_name = this.completeField.display_name;
  }

  @action
  handleDataNameChange() {
    this.data_name = this.completeField.data_name;
  }

  @action
  handleSlugChange() {
    this.slug = this.completeField.slug;
  }

  @action
  handlePositionChange() {
    this.completeField.position = this.field.position;
  }

  @action
  handleEditClick() {
    this.args.onEditClick(this.field);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.args.onOrderInvalidated();
  }

  @action
  clickedDeleteField(field, completeField) {
    this.args.onDeleteClick(field, completeField);
  }
}
