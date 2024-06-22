import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as controller } from '@ember/controller';
import { action, computed } from '@ember/object';

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

  get previewComponent() {
    return `preview-${this.field.subtype.replace('_', '-')}`;
  }

  get completeField() {
    const field = this.field;

    if (field.textfield) {
      return field.textfield;
    } else if (field.choicefield) {
      return field.choicefield;
    } else if (field.booleanfield) {
      return field.booleanfield;
    } else if (field.hiddenfield) {
      return field.hiddenfield;
    } else {
      throw new Error('Field type not implemented');
    }
  }

  @computed('currentField')
  get isEditing() {
    return this.currentField === this.field;
  }

  @computed('field.booleanfield')
  get showDisplayName() {
    return !this.field.booleanfield;
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
