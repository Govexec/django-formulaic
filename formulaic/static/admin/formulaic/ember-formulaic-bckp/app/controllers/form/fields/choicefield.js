import BaseField from './basefield';
import Ember from 'ember';

export default BaseField.extend({
    optionlists: function() {
        return this.store.query('optionlist', {});
    }.property(),

    optiongroups: Ember.computed(
        'model.option_list',
        {
            get() {
                return this.store.query('optiongroup', {
                    list: this.get('model.option_list.id')
                });
            }
        }
    ),

    hasOptionGroups: function() {
        return (this.get('optiongroups.content.length') > 0);
    }.property('optiongroups.content.length'),

    options: function() {
        if (this.get('model.option_group.content')) {
            return this.get('model.option_group.options');
        } else if (this.get('model.option_list.content')) {
            return this.get('model.option_list.options');
        }
        return null;
    }.property('model.option_list', 'model.option_group.id'),

    defaultOption: function() {
        // reduces default_options to single value
        if (this.get('model.default_options').get('length') > 0) {
            return this.get('model.default_options').get('firstObject');
        } else {
            return null;
        }
    }.property('model.default_options'),

    defaultOptionList: function() {
        return this.get('model.default_options');
    }.property('model.default_options'),

    optiongroupsReady: function() {
        return (this.get('optiongroups.isFulfilled') && this.get('model.option_group.isFulfilled'));
    }.property('optiongroups.isFulfilled', 'model.option_group.isFulfilled'),

    optionlistsReady: function() {
        return (this.get('optionlists.isFulfilled') &&
            this.get('model.option_list.isFulfilled') &&
            this.get('optiongroups.isFulfilled') &&
            this.get('model.option_group.isFulfilled'));
    }.property(
        'optionlists.isFulfilled',
        'model.option_list.isFulfilled',
        'optiongroups.isFulfilled',
        'model.option_group.isFulfilled'
    ),

    optionsReady: function() {
        return (this.get('options') != null && this.get('model.default_options').get('isFulfilled'));
    }.property('options', 'model.default_options.isFulfilled'),

    supportsMultiValue: function() {
        return (["checkbox_select_multiple", "select_multiple"].indexOf(this.get('model.subtype')) !== -1);
    }.property('model.subtype'),

    actions: {
        optionListChanged: function(value) {
            if (this.get('model.option_list.content') !== value) {
                this.set('model.option_list', value);
            }
        },
        optionGroupChanged: function(value) {
            this.set('model.option_group', value);
        },
        defaultOptionChanged: function(value) {
            this.set('model.default_option', value);
        }
    }
});

