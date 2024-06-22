import Model, { attr, belongsTo } from '@ember-data/model';
import validatorFactory from '../validators/factories';

export default class RuleConditionModel extends Model {
    @attr('number') position;
    @belongsTo('rule') rule;
    @belongsTo('field', { async: true }) field;
    @attr('string') operator;
    @attr('json') value;

    constructor() {
        super(...arguments);
        this.validator = validatorFactory.createRuleValidator(this);
    }
}
