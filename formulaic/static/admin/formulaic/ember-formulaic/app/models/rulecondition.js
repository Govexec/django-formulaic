import DS from 'ember-data';
import validatorFactory from '../validators/factories';

export default DS.Model.extend({
    position: DS.attr('number'),
    rule: DS.belongsTo('rule'),
    field: DS.belongsTo('field', {async:true}),
    operator: DS.attr('string'),
    //value_type: DS.attr('string'),
    value: DS.attr('json'),

    init() {
        this._super(...arguments);
        this.validator = validatorFactory.createRuleValidator(this);
    }
});
