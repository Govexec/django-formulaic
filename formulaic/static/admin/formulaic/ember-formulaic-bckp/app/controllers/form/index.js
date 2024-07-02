import Ember from 'ember';

export default Ember.Controller.extend({
    privacyPolicies: function() {
        return this.store.query('privacypolicy', {});
    }.property(),

    privacyPoliciesReady: function() {
        return (
            this.get('privacyPolicies.isFulfilled') &&
            this.get('model.privacy_policy.isFulfilled')
        );
    }.property(
        'privacyPolicies.isFulfilled',
        'model.privacy_policy.isFulfilled'
    ),

    actions: {
        privacyPolicyChanged: function(value) {
            this.set('model.privacy_policy', value);
        }
    }
});
