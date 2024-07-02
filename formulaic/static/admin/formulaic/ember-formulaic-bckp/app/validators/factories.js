import BooleanFieldModel from '../models/booleanfield';
import BooleanFieldValidator from './fields/booleanfield';
import ChoiceFieldModel from '../models/choicefield';
import ChoiceFieldValidator from './fields/choicefield';
import HiddenFieldModel from '../models/hiddenfield';
import HiddenFieldValidator from './fields/hiddenfield';
import RuleConditionModel from '../models/rulecondition';
import RuleConditionValidator from './rules/rulecondition';
import RuleResultModel from '../models/ruleresult';
import RuleResultValidator from './rules/ruleresult';
import RuleModel from '../models/rule';
import RuleValidator from './rules/rule';
import TextFieldModel from '../models/textfield';
import TextFieldValidator from './fields/textfield';



export function createFieldValidator(field) {
    /**
     * Creates a validator appropriate for the provided
     * field
     *
     * @field field to be validated.  Must be the full
     * field, not the generic version
     */

    if (field instanceof TextFieldModel) {
        return TextFieldValidator.create({field: field});
    } else if (field instanceof ChoiceFieldModel) {
        return ChoiceFieldValidator.create({field: field});
    } else if (field instanceof BooleanFieldModel) {
        return BooleanFieldValidator.create({field: field});
    } else if (field instanceof HiddenFieldModel) {
        return HiddenFieldValidator.create({field: field});
    } else {
        // Raise exception
        throw new Error("Validator for this field type not implemented");
    }
}

export function createRuleValidator(obj) {
    /**
     * Creates validators for all objects related to
     * Rule validation.  These are not derived from
     * the same base model, but it was convenient
     * to handle them in a generic way.
     *
     * @obj object to be validated
     */

    if (obj instanceof RuleModel) {
        return RuleValidator.create({rule: obj});
    } else if (obj instanceof RuleConditionModel) {
        return RuleConditionValidator.create({rulecondition: obj});
    } else if (obj instanceof RuleResultModel) {
        return RuleResultValidator.create({ruleresult: obj});
    } else {
        // Raise exception
        throw new Error("Validator for this object type not implemented");
    }
}

export default {
    createFieldValidator: createFieldValidator,
    createRuleValidator: createRuleValidator
};
