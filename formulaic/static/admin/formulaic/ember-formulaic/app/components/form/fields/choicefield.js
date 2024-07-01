//components/form/fields/choicefield.js

import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {once} from '@ember/runloop';
import BaseFieldComponent from './basefield';

export default class ChoiceFieldComponent extends BaseFieldComponent {
  @service store;
  @service('field-service') fieldService;

  @tracked optionlists = null;
  @tracked optiongroups = null;

  constructor() {
    super(...arguments);
    once(this, this.loadOptionLists);
    once(this, this.loadOptionGroups);
  }

  async loadOptionLists() {
    try {
      let option_lists = await this.store.query('optionlist', {});
      this.optionlists = option_lists.toArray();
    } catch (error) {
      console.error('Error loading option lists:', error);
    }
  }

  async loadOptionGroups() {
    if (this.model.option_list)
    {
      try {
        let option_groups = await this.store.query('optiongroup', {
          list: this.model.option_list.id
        });
        this.optiongroups = option_groups.toArray();
      } catch (error) {
        console.error('Error loading option groups:', error);
      }
    }
  }

  get hasOptionGroups() {
    return this.optiongroups && this.optiongroups.length > 0;
  }

  get modelOptions() {
    if (this.model.option_group?.options) {
      return this.model.option_group.options;
    } else if (this.model.option_list?.options) {
      return this.model.option_list.options
    }
    return null;
  }

  get defaultOption() {
    if (this.model.default_options.length > 0) {
      return this.model.default_options.firstObject;
    } else {
      return this.model.default_option;
    }
  }

  get defaultOptionList() {
    return this.model.default_options;
  }

  get optiongroupsReady() {
    return this.optiongroups != null; //&& this.model.option_group?.isFulfilled;
  }

  get optionlistsReady() {
    return this.optionlists != null;
  }

  async optionsReady() {
    return this.modelOptions != null; //&& this.model.default_options?.isFulfilled;
  }

  get supportsMultiValue() {
    return ["checkbox_select_multiple", "select_multiple"].includes(this.model.subtype);
  }

  @action
  async optionListChanged(event) {

    const selectedOptionListId = event.target.value;

    if (this.model.option_list?.id !== selectedOptionListId) {
      this.model.option_list = await this.store.findRecord('optionlist', selectedOptionListId);
      this.modelOptions;
      await this.loadOptionGroups();
    }
  }

  @action
  async optionGroupChanged(event) {
    const selectedOptionGroupId = event.target.value;

    if (selectedOptionGroupId) {
      this.model.option_group = await this.store.findRecord('optiongroup', selectedOptionGroupId);
    }
  }

  @action
  async defaultOptionChanged(event) {
    const selectedDefaultOptionId = event.target.value;

    if (selectedDefaultOptionId) {
      this.model.default_option = await this.store.findRecord('option', selectedDefaultOptionId);
    }
  }
}
