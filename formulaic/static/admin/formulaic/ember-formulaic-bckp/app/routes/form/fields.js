import Ember from "ember";

export default Ember.Route.extend({
    needs: 'fields',

    form: function() {
        return this.modelFor('form');
    }.property(),

    formId: function() {
        return this.get('form.id');
    }.property('form'),

    model: function() {
        let formId = this.get('formId');

        // Fetch fields for store
        this.store.query('field', {
            form: formId
        });

        return this.store.peekAll('field');
    },

    setupController: function(controller, model) {
        this._super(controller, model);

        // re-enable buttons; necessary after save
        controller.set('saveActive', false);
        controller.set('saveContinueActive', false);
    },

    renderTemplate: function() {
        this.render('form.fields');
        this.renderDefaultSidebar();
    },

    renderDefaultSidebar: function() {
        this.render('form.fields.index', {
            into: 'form.fields',
            outlet: 'sidebar'
        });
    },

    renderFieldSidebar: function(field) {
        if (field.get("textfield")) {
            // render TextField edit template
            this.render('form/fields/textfield', {
                into: 'form.fields',
                outlet: 'sidebar',
                model: field.get('textfield'),
                controller: 'form/fields/textfield'
            });
        } else if (field.get("choicefield")) {
            // render ChoiceField edit template
            this.render('form/fields/choicefield', {
                into: 'form.fields',
                outlet: 'sidebar',
                model: field.get('choicefield'),
                controller: 'form/fields/choicefield'
            });
        } else if (field.get("booleanfield")) {
            // render BooleanField edit template
            this.render('form/fields/booleanfield', {
                into: 'form.fields',
                outlet: 'sidebar',
                model: field.get('booleanfield'),
                controller: 'form/fields/booleanfield'
            });
        } else if (field.get("hiddenfield")) {
            // render BooleanField edit template
            this.render('form/fields/hiddenfield', {
                into: 'form.fields',
                outlet: 'sidebar',
                model: field.get('hiddenfield'),
                controller: 'form/fields/hiddenfield'
            });
        } else {
            // Raise exception: field type not implemented
            throw new Error("Formulaic: field type not implemented");
        }
    },

    _createBaseField: function(subtype) {
        let $ = Ember.$;

        // Create the new Field model
        let field = this.store.createRecord('field', {
            display_name: null,
            data_name: null,
            slug: null,
            required: false,
            help_text: null,
            model_class: 'textfield',
            position: $('.field-sortable').find('.item').length, // TODO: get highest position
            css_class: null,
            subtype: subtype,
            form: this.get('form')
        });

        $('.field-sortable').sortable('refresh');

        return field;
    },

    openEditField: function(field) {
        this.controller.set('currentField', field);
        this.renderFieldSidebar(field);
    },

    closeEditField: function() {
        this.controller.set('currentField', null);
        this.renderDefaultSidebar();
    },

    invalidateOrder: function() {
        this.controller.invalidateOrder();
    },

    actions: {
        editFieldToRoute: function(field) {
            this.openEditField(field);
        },

        deleteFieldToRoute: function(field, completeField) {
            /**
             * Delete both partial and complete field.  Deleting completeField
             * via fieldsPendingDeletion is necessary because sometimes it is
             * the only one that has an ID.
             */

            this.controller.removeValidatorFor(field);
            field.deleteRecord();

            var fieldsPendingDeletion = this.controller.get('fieldsPendingDeletion');
            fieldsPendingDeletion.push(completeField);

            this.invalidateOrder();

            if (this.controller.get('currentField', null) === field) {
                this.closeEditField();
            }
        },

        doneEditingField: function() {
            this.closeEditField();
        },

        createTextField: function(subtype) {
            if (["text", "textarea", "email", "phone_number", "integer", "full_name"].indexOf(subtype) === -1) {
                // Raise exception: field subtype not implemented
                throw new Error("Formulaic: text field subtype `" + subtype + "` not implemented");
            }

            let field = this._createBaseField(subtype);

            let textfield = this.store.createRecord('textfield', {
                display_name: field.get('display_name'),
                data_name: field.get('data_name'),
                slug: field.get('slug'),
                required: field.get('required'),
                help_text: field.get('help_text'),
                model_class: field.get('model_class'),
                position: field.get('position'),
                css_class: field.get('css_class'),
                form: field.get('form'),
                subtype: subtype
            });

            field.set('textfield', textfield);

            this.openEditField(field);
        },

        createChoiceField: function(subtype) {
            if (["select", "radio_select", "checkbox_select_multiple", "select_multiple"].indexOf(subtype) === -1) {
                // Raise exception: field subtype not implemented
                throw new Error("Formulaic: choice field subtype `" + subtype + "` not implemented");
            }

            let field = this._createBaseField(subtype);

            let choicefield = this.store.createRecord('choicefield', {
                display_name: field.get('display_name'),
                data_name: field.get('data_name'),
                slug: field.get('slug'),
                required: field.get('required'),
                help_text: field.get('help_text'),
                model_class: field.get('model_class'),
                position: field.get('position'),
                css_class: field.get('css_class'),
                form: field.get('form'),
                subtype: subtype,
                minimum_selections: null,
                maximum_selections: null,
                option_list: null,
                default_option: null
            });

            field.set('choicefield', choicefield);

            this.openEditField(field);
        },

        createBooleanField: function(subtype) {
            if (subtype !== "checkbox") {
                // Raise exception: field subtype not implemented
                throw new Error("Formulaic: boolean field subtype `" + subtype + "` not implemented");
            }

            let field = this._createBaseField(subtype);

            let booleanfield = this.store.createRecord('booleanfield', {
                display_name: field.get('display_name'),
                data_name: field.get('data_name'),
                slug: field.get('slug'),
                required: field.get('required'),
                help_text: field.get('help_text'),
                model_class: field.get('model_class'),
                position: field.get('position'),
                css_class: field.get('css_class'),
                form: field.get('form'),
                subtype: subtype
            });

            field.set('booleanfield', booleanfield);

            this.openEditField(field);
        },

        createHiddenField: function (subtype) {
            if (subtype !== "hidden") {
                // Raise exception: field subtype not implemented
                throw new Error("Formulaic: hidden field subtype `" + subtype + "` not implemented");
            }

            let field = this._createBaseField(subtype);

            let hiddenfield = this.store.createRecord('hiddenfield', {
                display_name: field.get('display_name'),
                data_name: field.get('data_name'),
                slug: field.get('slug'),
                required: field.get('required'),
                help_text: field.get('help_text'),
                model_class: field.get('model_class'),
                position: field.get('position'),
                css_class: field.get('css_class'),
                form: field.get('form'),
                subtype: subtype,
                value: ""
            });

            field.set('hiddenfield', hiddenfield);

            this.openEditField(field);
        },

        reloadFields: function() {
            /**
             * Unloads all fields and refreshes the route, triggering a
             * new API request.
             */
            this.store.unloadAll('field');
            this.refresh();
        }
    }
});
