import Ember from 'ember';

const DATA_NAME_LENGTH = 200;

export default Ember.Object.extend({
    isInvalid: function() {
        return (
            this.get('isSlugInvalid') ||
            this.get('isDisplayNameInvalid') || this.get('isDataNameInvalid')
        );
    }.property(
        'isSlugInvalid',
        'isDisplayNameInvalid',
        'isDataNameInvalid'
    ),

    isDisplayNameInvalid: function() {
        let displayName = this.get('field.display_name');
        return !displayName;
    }.property('field.display_name'),

    isDataNameInvalid: function() {
        let dataName = this.get('field.data_name');
        return !dataName || dataName.length > DATA_NAME_LENGTH;
    }.property('field.data_name'),

    isSlugInvalid: function () {
        /**
         * Slug may still be valid if not set.  If slug is blank, it's
         * auto-generated based on the `name` field.
         */

        return (!(this.get('field.slug')) && this.get('isDataNameInvalid'));
    }.property('field.slug', 'isDataNameInvalid')
});
