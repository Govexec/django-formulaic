import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: [
        'page',
        'source'
    ],
    formId: null,
    source: null,
    page: 1,

    fields: function() {
        return this.store.query('field', {form: this.get('formId')});
    }.property(),

    columnHeaders: function() {
        // base column headers
        var headers = ['Date/Time', 'Source'];

        if (this.get('fields.isFulfilled')) {
            this.get('fields').forEach(function(field) {
                headers.push(field.get('data_name'));
            });
        }

        return headers;
    }.property('fields.isFulfilled'),

    customColumnSlugs: function() {
        var slugs = [];

        if (this.get('fields.isFulfilled')) {
            this.get('fields').forEach(function(field) {
                slugs.push(field.get('slug'));
            });
        }

        return slugs;
    }.property('fields.isFulfilled'),

    submissionDataList: function() {
        var rows = [];
        var slugs = this.get('customColumnSlugs');

        var submissions = this.get('model');

        submissions.forEach(function(submission) {
            let row = [
                submission.get('date_created'),
                submission.get('source')
            ];
            for (var j = 0; j < slugs.length; j++) {
                var slug = slugs[j];
                row.push(submission.get('custom_data')[slug]);
            }
            rows.push(row);
        });

        return rows;
    }.property('page', 'model.isFulfilled', 'customColumnSlugs', 'source'),

    hasSubmissions: function() {
        return this.get('submissionDataList').length > 0;
    }.property('submissionDataList'),

    metaData: Ember.computed('model', function() {
        var meta = this.get('model.meta');
        return meta;
    }),

    count: function() {
        if (this.get('metaData')) {
            return this.get('metaData').count;
        } else {
            return null;
        }
    }.property('metaData'),

    currentPage: function() {
        return this.getWithDefault('page', 1);
    }.property('metaData'),

    nextPage: function() {
        return this.get('metaData').next;
    }.property('metaData'),

    previousPage: function() {
        var previous_page = this.get('page') - 1;
        return (previous_page > 0) ? previous_page : null;
    }.property('metaData'),

    pageCount: function() {
        return Math.ceil(this.get('count') / this.get('page_size'));
    }.property('count', 'page_size'),

    sources: function() {
        var source_objs = this.store.query('submissionsource', {
            form: this.get('formId')
        });
        return source_objs;
    }.property(),

    selectedSource: function(key, value, previousValue) {
        if (value !== previousValue) {
            this.send('changeSource', value);
        }

        return this.get('source');
    }.property('source'),

    actions: {}
});
