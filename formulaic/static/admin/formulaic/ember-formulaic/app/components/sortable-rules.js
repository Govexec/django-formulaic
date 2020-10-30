import BaseSortable from "./base-sortable";
import Ember from "ember";

export default BaseSortable.extend({
    templateName: 'sortable/rules',
    sortableSelector: '.rule-sortable',
    store: Ember.inject.service(),

    allFields: function() {
        return this.get('store').peekAll('field');
    }.property()
});
