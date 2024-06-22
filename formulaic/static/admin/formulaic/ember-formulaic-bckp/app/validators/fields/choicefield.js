import BaseField from './basefield';

export default BaseField.extend({
    isInvalid: function () {
        var invalid = this._super.apply(this);
        return (invalid || this.get('isOptionListInvalid'));
    }.property(
        'isDisplayNameInvalid',
        'isDataNameInvalid',
        'isSlugInvalid',
        'isOptionListInvalid'
    ),

    isOptionListInvalid: function () {
        return (this.get('field.option_list.content') == null);
    }.property('field.option_list.isLoaded', 'field.option_list')
});
