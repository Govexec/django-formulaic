import Ember from 'ember';

export default Ember.Route.extend({
    form: function() {
        return this.modelFor('form');
    }.property(),

    formId: function() {
        return this.get('form.id');
    }.property('form'),

    actions: {
        editForm: function() {
            // go into edit mode
            this.controller.set('inEditMode', true);
        },

        saveForm: function() {
            var thisRoute = this;
            var promises = [];

            // Set loading/saving state
            this.controller.set('saveActive', true);

            promises.push(this.modelFor('form').save());

            // Handle all save completions together
            Ember.RSVP.allSettled(promises).then(function () {
                // Reset loading/saving state
                thisRoute.controller.set('saveActive', false);

                // Notify user of success
                // thisRoute.toast.options.positionClass = "toast-bottom-center";
                thisRoute.toast.success('Form saved.');

                // exit edit mode
                thisRoute.controller.set('inEditMode', false);
            }, function () {
                // console.error(error);
            });
        },

        close: function() {
            // exit edit mode
            this.controller.set('inEditMode', false);
        },

        editFields: function() {
            this.transitionTo('form.fields');
        },

        editRules: function() {
            this.transitionTo('form.rules');
        },

        viewSubmissions: function() {
            this.transitionTo('form.submissions');
        },

        downloadSubmissions: function() {
            let $ = Ember.$;
            let thisRoute = this;
            let $form = $('#ld-submissions-dl-' + this.get('form.id'));

            this.controller.set('downloadInProgress', true);
            this.controller.set('downloadFailed', false);

            $form.on('handl:form-unlocked', function() {
                thisRoute.controller.set('downloadInProgress', false);
            });

            $form.submit();
        }
    }
});
