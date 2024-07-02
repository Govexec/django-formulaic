import DS from 'ember-data';

export default DS.Model.extend({
    date_created: DS.attr('string'),
    source: DS.attr('string'),
    promo_source: DS.attr('string'),
    form: DS.belongsTo('form', { async:true }),
    custom_data: DS.attr('json')
});
