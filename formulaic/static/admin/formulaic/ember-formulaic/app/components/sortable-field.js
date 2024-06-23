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
  }

  get previewComponent() {
    if (this.field && this.field.subtype) {
      return `preview-${this.field.subtype.replace('_', '-')}`;
    } else {
      return '';
    }
  }

  get completeField() {
    console.warn("field details : ", this.field);

    if (!this.field) {
      return null;
    }

    return this.field;

    // switch (this.field.model_class) {
    //   case FIELD_TYPES.TEXTFIELD:
    //     return this.field.textfield.data;
    //   case FIELD_TYPES.CHOICEFIELD:
    //     return this.field.choicefield.data;
    //   case FIELD_TYPES.BOOLEANFIELD:
    //     return this.field.booleanfield.data;
    //   case FIELD_TYPES.HIDDENFIELD:
    //     return this.field.hiddenfield.data;
    //   default:
    //     throw new Error('Field type not implemented');
    // }
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
  handleClick() {
    this.args.onClick(this.field);
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
