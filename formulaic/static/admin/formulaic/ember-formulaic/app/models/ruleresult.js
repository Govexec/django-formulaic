import Model, { attr, belongsTo } from '@ember-data/model';
import validatorFactory from '../validators/factories';

export default class RuleResultModel extends Model {
    @attr('string') action;
    @belongsTo('field', { async: true, inverse: null }) field;
    @belongsTo('rule', { async: true, inverse: 'results' }) rule;
    @belongsTo('optiongroup', { async: true, inverse: null }) option_group;

    constructor() {
        super(...arguments);
        this.validator = validatorFactory.createRuleValidator(this);
    }
}
