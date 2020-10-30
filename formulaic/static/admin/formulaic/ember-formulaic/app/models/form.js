import DS from 'ember-data';

export default DS.Model.extend({
    name: DS.attr('string'),
    slug: DS.attr('string'),
    success_message: DS.attr('string'),
    privacy_policy: DS.belongsTo('privacypolicy', {async:true})
});
