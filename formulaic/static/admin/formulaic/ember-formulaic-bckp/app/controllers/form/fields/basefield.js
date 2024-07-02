import Ember from 'ember';
import slug from '../../../utils/slug';

export default Ember.Controller.extend({
    fieldsController: Ember.inject.controller('form.fields'),

    modelChanged: Ember.observer('model', function() {
        if (this.get('model')) {
            this.set('isDisplayNameWYSIWYGEnabled', this.get('displayNameHasHtml'));
        }
    }),

    editorOptions: {
        height: 120,
        force_br_newlines : false,
        force_p_newlines : false,
        forced_root_block : '',
        menubar: false,
        plugins: ['link'],
        toolbar: 'bold italic | link'
    },

    displayNameHasHtml: Ember.computed('model.display_name', {
        get() {
            return (
                this.get('model.display_name') &&
                this.get('model.display_name').match(/<([A-Z][A-Z0-9]*)\b[^>]*>/i)
            );
        }
    }),

    subtypeName: function () {
        return this.get('model.subtype').replace('_', ' ');
    }.property('model.subtype'),

    autoSlug: Ember.computed('model.data_name', 'model.slug', {
        get() {
            // if slug is set, return it
            if (this.get('model.slug')) {
                return this.get('model.slug');
            }

            // if not, display the generated slug
            return slug.generateSlug(this.get('model.data_name'));
        },
        set(key, value) {
            this.set('model.slug', value);
            return value;
        }
    }),

    validator: function() {
        return this.get('fieldsController').validatorFor(this.get('model'));
    }.property('fieldsController', 'model'),

    actions: {
        toggleDisplayNameWYSIWYG: function() {
            this.set(
                'isDisplayNameWYSIWYGEnabled',
                !this.get('isDisplayNameWYSIWYGEnabled')
            );
        }
    }
});
