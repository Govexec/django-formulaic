import Ember from 'ember';

export default Ember.Route.extend({
    model: function(params) {
        let formId = params.form_id;

        return this.store.find('form', formId);
    },
    actions: {
        
    }
});
