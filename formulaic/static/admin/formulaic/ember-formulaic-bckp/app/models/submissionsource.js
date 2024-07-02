import DS from 'ember-data';

// Note: `source` name is the primary key; see serializer

export default DS.Model.extend({
    count: DS.attr('number')
});
