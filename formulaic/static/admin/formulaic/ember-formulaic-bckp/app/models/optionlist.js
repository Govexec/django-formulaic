import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    options: DS.hasMany('option', {async: true}),
    groups: DS.hasMany('optiongroup', {async: true}),
});