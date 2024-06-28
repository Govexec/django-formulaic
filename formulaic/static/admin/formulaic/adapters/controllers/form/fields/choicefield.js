//controllers/form/fields/choicefield.js

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import BaseFieldController from './basefield';

export default class ChoiceFieldController extends BaseFieldController {
  @service store;

  @tracked optionlists;
  @tracked optiongroups;

  constructor() {
    super(...arguments);
    this.loadOptionLists();
    this.loadOptionGroups();
  }

  async loadOptionLists() {
    try {
      this.optionlists = await this.store.queryRecord('optionlist', {});
    } catch (error) {
      console.error('Error loading option lists:', error);
    }
  }

  async loadOptionGroups() {
    if (this.model.option_list) {
      try {
        this.optiongroups = await this.store.queryRecord('optiongroup', {
          list: this.model.option_list.id
        });
      } catch (error) {
        console.error('Error loading option groups:', error);
      }
    }
  }

  get hasOptionGroups() {
    return this.optiongroups && this.optiongroups.length > 0;
  }

  get options() {
    if (this.model.option_group?.content) {
      return this.model.option_group.options;
    } else if (this.model.option_list?.content) {
      return this.model.option_list.options;
    }
    return null;
  }

  get defaultOption() {
    if (this.model.default_options.length > 0) {
      return this.model.default_options.firstObject;
    } else {
      return null;
    }
  }

  get defaultOptionList() {
    return this.model.default_options;
  }

  get optiongroupsReady() {
    return this.optiongroups?.isFulfilled && this.model.option_group?.isFulfilled;
  }

  get optionlistsReady() {
    return (
      this.optionlists?.isFulfilled &&
      this.model.option_list?.isFulfilled &&
      this.optiongroups?.isFulfilled &&
      this.model.option_group?.isFulfilled
    );
  }

  get optionsReady() {
    return this.options != null && this.model.default_options?.isFulfilled;
  }

  get supportsMultiValue() {
    return ["checkbox_select_multiple", "select_multiple"].includes(this.model.subtype);
  }

  @action
  optionListChanged(value) {
    if (this.model.option_list.content !== value) {
      this.model.option_list = value;
      this.loadOptionGroups(); // Reload option groups when the option list changes
    }
  }

  @action
  optionGroupChanged(value) {
    this.model.option_group = value;
  }

  @action
  defaultOptionChanged(value) {
    this.model.default_option = value;
  }
}
