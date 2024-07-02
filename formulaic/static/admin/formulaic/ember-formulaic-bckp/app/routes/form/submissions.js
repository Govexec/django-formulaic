import Ember from "ember";

export default Ember.Route.extend({
    page_size: 25,
    page: null,
    source: null,

    queryParams: {
        page: {
            refreshModel: false
        },
        source: {
            refreshModel: false
        }
    },

    form: function() {
        return this.modelFor('form');
    }.property(),

    formId: function() {
        return this.get('form.id');
    }.property('form'),

    model: function(params) {
        var page = (params.page) ? params.page : 1;

        var requestParams = {
            form: this.get('formId'),
            page_size: this.page_size,
            page: page
        };

        if (params.source) {
            requestParams["source"] = params.source;
        }

        let promise = this.store.query(
            'submission', 
            requestParams
        );

        return promise;
    },

    setupController: function(controller, model) {
        this._super(controller, model);
        controller.setProperties({
            page_size: this.get('page_size'),
            formId: this.get('formId')
        });
    },
    gotoPage: function(page) {
        if (page == null) {
            page = 1;
        }

        this.transitionTo('form.submissions', {
            queryParams: {
                page: page
            }
        });
        this.refresh();
    },
    actions: {
        closeSubmissions: function() {
            this.transitionTo('form');
        },
        gotoNextPage: function(model) {
            var meta = model.get('meta');
            this.gotoPage(meta.next);
        },
        gotoPreviousPage: function(model) {
            var meta = model.get('meta');
            this.gotoPage(meta.previous);
        },
        changeSource: function(value) {
            var queryParams = {
                page: 1,
                source: value
            };

            this.transitionTo('form.submissions', {
                queryParams: queryParams
            });
            this.refresh();
        }
    }
});
