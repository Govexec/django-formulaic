/* global toastr */

import Ember from 'ember';
import FieldHelpers from '../../utils/fields';
import slug from '../../utils/slug';

export default Ember.Controller.extend(Ember.Evented, {
    sortProperties: ['position'],
    saveActive: false,
    saveContinueActive: false,
    validators: {},
    fieldsPendingDeletion: [],
    currentField: null,

    activeFields: Ember.computed('model', 'model.@each.isDeleted', {
        get() {
            return this.get('model').filter(function(item) {
                return !item.get('isDeleted');
            });
        }
    }),

    validatorFor: function(field) {
        // I moved validators to models (for better or worse)
        // TODO: simplify how validators are accessed based on that change
        let actualField = FieldHelpers.getActualField(field);
        let validatorKey = actualField.toString();

        let validators = this.get('validators');

        if (!(validatorKey in validators)) {
            validators[validatorKey] = actualField.validator;
        }

        return validators[validatorKey];
    },

    removeValidatorFor: function (field) {
        let actualField = FieldHelpers.getActualField(field);
        let validatorKey = actualField.toString();

        let validators = this.get('validators');

        if (validatorKey in validators) {
            validators[validatorKey].destroy();
            delete validators[validatorKey];
        }
    },

    invalidateOrder: function() {
        if (!this.get('controlsDisabled')) {
            this.trigger('orderInvalidated');
        }
    },

    controlsDisabled: function() {
        return (this.saveActive || this.saveContinueActive);
    }.property('saveActive', 'saveContinueActive'),

    actions: {
        saveFields: function(continueEditing) {
            let thisController = this;
            let promises = [];
            let i;

            // Set loading/saving state
            if (continueEditing) {
                this.set('saveContinueActive', true);
            } else {
                this.set('saveActive', true);
            }

            // Save current fields
            let validationErrors = [];
            let actualFields = [];
            let fields = this.get('model').toArray();
            for (i = 0; i < fields.length; i++) {
                if (!fields[i].get('isDeleted')) {
                    // fields array contains partials; get full fields
                    let actualField = FieldHelpers.getActualField(fields[i]);

                    // Set slug if not set explicitly
                    if (!actualField.get('slug')) {
                        let newSlug = slug.generateSlug(actualField.get('data_name'));
                        actualField.set('slug', newSlug);
                    }

                    // Validate data
                    let validator = this.validatorFor(actualField);
                    if (validator.get('isInvalid')) {
                        validationErrors.push('Field "' + actualField.get('data_name') + '" is incomplete');
                    }

                    actualFields.push(actualField);
                }
            }

            if (validationErrors.length > 0) {
                // Cancel 'Save'; output error messages
                toastr.options.positionClass = "toast-bottom-center";
                toastr.warning('Unable to save because of these issues: <br>' + validationErrors.join('<br>'));

                // Reset loading/saving state
                thisController.set('saveContinueActive', false);
                thisController.set('saveActive', false);
            } else {
                // Delete fields marked for deletion
                for (i = 0; i < this.fieldsPendingDeletion.length; i++) {
                    this.fieldsPendingDeletion[i].deleteRecord();
                    promises.push(this.fieldsPendingDeletion[i].save());
                }
                // Clear array
                this.fieldsPendingDeletion.length = 0;

                // Begin save
                for (i = 0; i < actualFields.length; i++) {
                    promises.push(actualFields[i].save());
                }

                // Handle all save completions together
                Ember.RSVP.allSettled(promises).then(function (results) {
                    let saveErrors = [];
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].state === "rejected") {
                            saveErrors.push(results[i]);
                        }
                    }

                    // Reset loading/saving state
                    thisController.set('saveContinueActive', false);
                    thisController.set('saveActive', false);

                    if (saveErrors.length > 0) {
                        // Notify user of success
                        toastr.options.positionClass = "toast-bottom-center";
                        toastr.error('Save failed.  Contact administrator.');
                    } else {
                        // Reload fields from store
                        thisController.send('reloadFields');

                        // Notify user of success
                        toastr.options.positionClass = "toast-bottom-center";
                        toastr.success('Fields saved.');

                        // Redirect to form page if appropriate
                        if (!continueEditing) {
                            thisController.transitionToRoute('form');
                        }
                    }
                }, function (error) {
                    Ember.Logger.error(error);
                });
            }
        },

        close: function() {
            this.transitionToRoute('form');
        },

        editField: function(field) {
            this.send('editFieldToRoute', field);
        },
        deleteField: function(field, completeField) {
            this.send('deleteFieldToRoute', field, completeField);
        }
    }
});
