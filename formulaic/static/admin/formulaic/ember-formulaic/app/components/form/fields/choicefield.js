//components/form/fields/choicefield.js

import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {once} from '@ember/runloop';
import BaseFieldComponent from './basefield';

export default class ChoiceFieldComponent extends BaseFieldComponent {
  @service store;

  @tracked optionlists = null;
  @tracked optiongroups = null;
  @tracked resolvedOptionList = null;
  @tracked resolvedOptionGroup = null;
  @tracked resolvedDefaultOption = null;

  constructor() {
    super(...arguments);
    once(this, this.loadOptionLists);
    once(this, this.loadOptionGroups);

    this.resolvedOptionList = this.model.option_list;

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
    if (this.model.option_list) {
      try {
        let option_groups = await this.store.query('optiongroup', {
          list: this.model.option_list.id
        });
        this.optiongroups = option_groups.toArray();

        // let option_list = await this.model.option_list;
        // console.warn("option list : ", option_list);
      } catch (error) {
        console.error('Error loading option groups:', error);
      }
    }
  }


  get hasOptionGroups() {
    return this.optiongroups && this.optiongroups.length > 0;
  }

  get modelOptions() {
    // if (this.model.option_group?.content) {
    //   return this.model.option_group.options;
    // } else if (this.model.option_list?.content) {
    //   return this.model.option_list.options;
    // }

    return this.optionlists;
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
    return this.optiongroups != null; //&& this.model.option_group?.isFulfilled;
  }

  get optionlistsReady() {
    return this.optionlists != null;
  }

  async optionsReady() {
    return this.options != null; //&& this.model.default_options?.isFulfilled;
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
