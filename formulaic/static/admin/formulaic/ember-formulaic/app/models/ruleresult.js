import Model, { attr, belongsTo } from '@ember-data/model';
import validatorFactory from '../validators/factories';

export default class RuleResultModel extends Model {
    @attr('string') action;
    @belongsTo('field', { async: true }) field;
    @belongsTo('rule') rule;
    @belongsTo('optiongroup', { async: true }) option_group;

    constructor() {
        super(...arguments);
        this.validator = validatorFactory.createRuleValidator(this);
    }
}
