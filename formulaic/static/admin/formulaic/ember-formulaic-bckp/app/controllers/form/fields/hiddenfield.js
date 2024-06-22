import BaseField from './basefield';
import Ember from 'ember';

export default BaseField.extend({
    dataNameChanged: Ember.observer('model.data_name', function() {
        // auto-populate `display_name`; doesn't display anywhere
        this.set('model.display_name', this.get('model.data_name'));
    })
});
