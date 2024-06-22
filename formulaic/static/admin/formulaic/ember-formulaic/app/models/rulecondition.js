import Model, { attr, belongsTo } from '@ember-data/model';
import validatorFactory from '../validators/factories';

export default class RuleConditionModel extends Model {
    @attr('number') position;
    @belongsTo('rule', { async: true, inverse: 'conditions' }) rule;
    @belongsTo('field', { async: true, inverse: null }) field;
    @attr('string') operator;
    @attr('json') value;

    constructor() {
        super(...arguments);
        this.validator = validatorFactory.createRuleValidator(this);
    }
}
