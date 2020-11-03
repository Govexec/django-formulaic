from six import iteritems

from formulaic import exceptions


class RuleAssessor(object):
    """
    Mimics the Rule implementation found in JavaScript to toggle
    validation on and off for fields depending on if they're
    supposed to be visible to the user.
    """

    def __init__(self, rules_data, form_fields, submission_data={}):
        self.fields = {}
        for slug, form_field in form_fields.items():
            value = submission_data.get(slug, None)

            self.fields[slug] = Field(slug, form_field, value)

        self.rules = []
        for rule_data in rules_data:
            self.rules.append(Rule(self, rule_data))

        self.visible_fields = []
        self.invisible_fields = []
        for slug, field in iteritems(self.fields):
            field.evaluate_observed_rules()

            if field.visible:
                self.visible_fields.append(slug)
            else:
                self.invisible_fields.append(slug)

    def is_field_visible(self, slug):
        return slug in self.visible_fields


class FieldStatus(object):
    def __init__(self):
        self.visible = True


class Field(object):
    def __init__(self, slug, form_field, value):
        self.slug = slug
        self.form_field = form_field
        self.value = value
        self.observed_rules = []

        self._visible = None

    def add_observed_rule(self, rule):
        self.observed_rules.append(rule)

    def evaluate_observed_rules(self):
        new_field_status = FieldStatus()

        for rule in self.observed_rules:
            rule.evaluate(self, new_field_status)

        # apply field status
        self._visible = new_field_status.visible

    def has_value(self, value):
        from django.forms import CheckboxInput
        if type(self.form_field) is CheckboxInput:
            return self.value
        elif type(self.value) is list:
            return value in self.value
        else:
            return self.value == value

    @property
    def visible(self):
        if self._visible is None:
            raise exceptions.NotSetException("Field hasn't been set active/inactive, yet")
        else:
            return self._visible


class Rule(object):
    OPERATOR_AND = "and"
    OPERATOR_OR = "or"

    def __init__(self, assessor, rule_data):
        self.assessor = assessor
        self.operator = rule_data["operator"]

        self.conditions = []
        for condition_data in rule_data["conditions"]:
            self.conditions.append(RuleCondition(self, condition_data))

        self.results = []
        for result_data in rule_data["results"]:
            self.results.append(RuleResult(self, result_data))

    def conditions_met(self):
        require_all = self.operator == Rule.OPERATOR_AND
        all_true = True
        any_true = False

        for condition in self.conditions:
            if condition.is_met():
                any_true = True
            else:
                all_true = False

        if all_true:
            return True
        elif not require_all and any_true:
            return True
        else:
            return False

    def evaluate(self, field, display_status):
        if self.conditions_met():
            for result in self.results:
                result.update_result(field, display_status)


class RuleCondition(object):
    def __init__(self, rule, condition_data):
        self.rule = rule

        self.field = self.rule.assessor.fields[condition_data["field_slug"]]
        self.operator = condition_data["operator"]
        self.value = condition_data["value"]

    def is_met(self):
        if self.operator == "is":
            return self.field.has_value(self.value)
        else:
            return not self.field.has_value(self.value)


class RuleResult(object):
    ACTION_SHOW = "show"
    ACTION_HIDE = "hide"
    ACTION_CHANGE_OPTION_GROUP = "change-option-group"

    def __init__(self, rule, result_data):
        self.rule = rule

        self.action = result_data["action"]
        self.field = self.rule.assessor.fields[result_data["field_slug"]]

        self.field.add_observed_rule(self.rule)

    def update_result(self, field, display_status):
        if self.field == field:
            if self.action == RuleResult.ACTION_SHOW:
                display_status.visible = True
            elif self.action == RuleResult.ACTION_HIDE:
                display_status.visible = False
            elif self.action == RuleResult.ACTION_CHANGE_OPTION_GROUP:
                pass
            else:
                raise exceptions.InvalidParamException("Invalid RuleResult action: {}".format(self.action))
