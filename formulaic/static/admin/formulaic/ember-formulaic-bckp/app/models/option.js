import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    value: DS.attr('string'),
    position: DS.attr('number'),
    list: DS.belongsTo('optionlist')
});