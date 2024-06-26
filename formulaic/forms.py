from __future__ import unicode_literals

import json

from django import forms
from django.template.context_processors import csrf
from django.template.loader import render_to_string
from django.utils.functional import cached_property
from django.utils.safestring import mark_safe
from six import python_2_unicode_compatible

from formulaic.rules import RuleAssessor


@python_2_unicode_compatible
class CustomForm(forms.Form):
    required_css_class = "required"

    def __init__(self, data=None, *args, **kwargs):
        self.instance_id = kwargs.pop("instance_id")
        self.template = kwargs.pop("template", "formulaic/bootstrap-form.html")

        self.request = kwargs.pop("request")
        form = kwargs.pop("form")
        widget_attrs = kwargs.pop("widget_attrs", {})

        fields = form.field_set.all().select_related(
                "textfield",
                "hiddenfield",
                "booleanfield",
                "choicefield__option_list",
                "choicefield__option_group__list"
            ).prefetch_related(
                "choicefield__option_list__groups__options",
                "choicefield__option_group__options",
                "choicefield__option_list__option_set"
            )

        self.field_slugs_by_id = {}
        self.privacy_policy = form.privacy_policy

        super(CustomForm, self).__init__(data, *args, **kwargs)

        # Add fields to form
        for field in fields:

            for field_type in ("hiddenfield", "textfield", "booleanfield", "choicefield"):
                if hasattr(field, field_type):
                    specific_field = getattr(field, field_type)
                    break
            else:
                specific_field = field.get_specific_field()

            field_widget_attrs = widget_attrs.copy()

            self.fields[field.slug] = specific_field.get_implementation(
                widget_attrs=field_widget_attrs
            )

            # Assign an attribute on to the field to allow for access to the model fields css_class
            self.fields[field.slug].wrapper_class = field.css_class
            self.field_slugs_by_id[field.id] = field.slug

        # Add rules to form
        self._rules = form.rule_set.all().prefetch_related("conditions", "results")

    def _clean_fields(self):
        super(CustomForm, self)._clean_fields()

        rule_assessor = RuleAssessor(self.rules_data, self.fields, self.cleaned_data)

        for invisible_field in rule_assessor.invisible_fields:
            if invisible_field in self._errors:
                del self._errors[invisible_field]

            if invisible_field in self.cleaned_data:
                del self.cleaned_data[invisible_field]

    @cached_property
    def rules_data(self):
        rules_list = []

        for rule in self._rules:
            # convert rule's conditions
            conditions_list = []
            for condition in rule.conditions.all():
                conditions_list.append({
                    "field_id": condition.field_id,
                    "field_slug": self.field_slugs_by_id[condition.field_id],
                    "operator": condition.operator,
                    "value": condition.value,
                })

            # convert rule's results
            results_list = []
            for result in rule.results.all():
                results_list.append({
                    "field_id": result.field_id,
                    "field_slug": self.field_slugs_by_id[result.field_id],
                    "action": result.action,
                    "option_group_id": result.option_group_id,
                })

            # convert rule
            rules_list.append({
                "operator": rule.operator,
                "conditions": conditions_list,
                "results": results_list,
            })

        return rules_list

    @property
    def rules_json(self):
        return json.dumps(self.rules_data)

    def render(self):
        c = {"form": self}
        c.update(csrf(self.request))

        return mark_safe(render_to_string(self.template, c))

    def __str__(self):
        return self.render()

    class Media:
        # TODO: handle caching; can't currently use querystring because of
        # django internals
        js = ("formulaic/js/custom_form.js", )
        css = {
            "all": ("formulaic/css/custom_form.css", ),
        }
