import DS from 'ember-data';
import validatorFactory from '../validators/factories';

export default DS.Model.extend({
    action: DS.attr('string'),
    field: DS.belongsTo('field', {async:true}),
    rule: DS.belongsTo('rule'),
    option_group: DS.belongsTo('optiongroup', {async:true}),

    init() {
        this._super(...arguments);
        this.validator = validatorFactory.createRuleValidator(this);
    }
});
