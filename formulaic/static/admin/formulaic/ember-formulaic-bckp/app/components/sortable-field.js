import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: [
        'field-preview',
        'single-line-text',
        'form-group',
        'col-xs-12',
        'item'
    ],
    classNameBindings: [
        'isEditing:editing',
        'completeField.validator.isInvalid:warning'
    ],

    needs: 'fields',

    previewComponent: function() {
        let viewName = 'preview-' + this.get('field.subtype').replace("_", "-");
        return viewName;
    }.property(),

    completeField: function() {
        let field = this.get('field');

        if (field.get('textfield')) {
            return field.get('textfield');
        } else if (field.get('choicefield')) {
            return field.get('choicefield');
        } else if (field.get('booleanfield')) {
            return field.get('booleanfield');
        } else if (field.get('hiddenfield')) {
            return field.get('hiddenfield');
        } else {
            // Raise exception
            throw new Error("Field type not implemented");
        }
    }.property(),

    invalidateOrder: function () {
        this.get('controllers.fields').invalidateOrder();
    },

    displayNameChanged: Ember.observer('completeField.display_name', function() {
        this.set('display_name', this.get('completeField.display_name'));
    }),

    dataNameChanged: Ember.observer('completeField.data_name', function() {
        this.set('data_name', this.get('completeField.data_name'));
    }),

    slugChanged: Ember.observer('completeField.slug', function() {
        this.set('slug', this.get('completeField.slug'));
    }),

    positionChanged: Ember.observer('field.position', function() {
        this.set('completeField.position', this.get('field.position'));
    }),

    isEditing: function() {
        return (this.get('currentField') === this.get('field'));
    }.property('currentField'),

    showDisplayName: function() {
        return !(this.get('field.booleanfield'));
    }.property('field.booleanfield'),

    click() {
        this.sendAction('onClick', this.get('field'));
    },

    destroy: function () {
        /**
         * Invalidate order after destroy
         */

        this._super(...arguments);

        this.sendAction('onOrderInvalidated');
    },

    actions: {
        clickedDeleteField: function(field, completeField) {
            this.sendAction('onDeleteClick', field, completeField);
        }
    }
});
