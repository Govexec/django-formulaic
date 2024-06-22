import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    display_name: DS.attr('string'),
    data_name: DS.attr('string'),
    slug: DS.attr('string'),
    required: DS.attr('boolean'),
    help_text: DS.attr('string'),
    model_class: DS.attr('string'),
    position: DS.attr('number'),
    css_class: DS.attr('string'),
    form: DS.belongsTo('form'),
    enabled: DS.attr('boolean'),
    subtype: DS.attr('string')
});
