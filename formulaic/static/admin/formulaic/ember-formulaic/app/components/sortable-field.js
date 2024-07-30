//components/sortable-field.js

import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {action, computed} from '@ember/object';

const FIELD_TYPES = {
  TEXTFIELD: 'textfield',
  CHOICEFIELD: 'choicefield',
  BOOLEANFIELD: 'booleanfield',
  HIDDENFIELD: 'hiddenfield'
};

export default class SortableFieldComponent extends Component {

  @service('field-service') fieldService;

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

  @computed('fieldService.currentField.field')
  get isEditing() {
    return this.fieldService.currentField?.field === this.field;
  }

  @computed('field.hiddenfield')
  get showDisplayName() {
    return this.field.model_class !== FIELD_TYPES.HIDDENFIELD
  }

  get isHiddenField() {
    return this.field.model_class === FIELD_TYPES.HIDDENFIELD
  }

  @action
  handleDisplayNameChange() {
    this.display_name = this.completeField.display_name;
  }

  @action
  handleDataNameChange() {
    this.data_name = this.completeField.data_name;

    if(this.completeField.model_class === FIELD_TYPES.HIDDENFIELD)
    {
      this.display_name = this.completeField.data_name;
    }
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
  handleEditClick(event) {
    this.args.onEditClick(this.field);
  }

  willDestroy() {
    super.willDestroy(...arguments);
  }

  @action
  clickedDeleteField(field, completeField) {
    this.args.onDeleteClick(field, completeField);
  }
}
