import Ember from 'ember';

export default Ember.Component.extend({
    templateName: 'sortable',
    sortableSelector: '.sortable',

    didInsertElement: function() {
        let thisView = this;

        this.sortable = this.$(this.sortableSelector).sortable({
            update: function() {
                thisView.updateSortable(this);
            },
            containment: 'parent',
            tolerance: 'pointer',
            cursor: 'move'
        });

        // Listen to controller
        // this.get('controller').on('orderInvalidated', this, this.updateSortable);
    },
    updateSortable: function() {
        let $ = Ember.$;

        this.sortable.find('.item').each(function(index) {
            let positionElement = $(this).find('.position');
            positionElement.val(index);
            positionElement.trigger('change');
        });

        this.sortable.sortable("refresh");
    },
    willDestroy: function() {
        // Un-register listener
        // this.get('controller').off('orderInvalidated', this, this.updateSortable);
    },
    actions: {
        triggerUpdateSortable: function() {
            this.updateSortable();
        }
    }
});

