import json

from django.core.exceptions import ValidationError
from django.forms.fields import CharField, ChoiceField, HiddenInput, MultiValueField, Select
from django.forms.utils import ErrorList
from nameparser import HumanName
from six import iteritems, text_type

from formulaic.widgets import GroupedChoiceWidget


class FullNameField(CharField):
    def clean(self, value):
        cleaned_text = super(FullNameField, self).clean(value)

        parsed_name = HumanName(cleaned_text)

        return {
            None: parsed_name.full_name,
            "first": parsed_name.first,
            "last": parsed_name.last,
            "middle": parsed_name.middle,
            "suffix": parsed_name.suffix,
            "title": parsed_name.title,
        }


class GroupedChoiceField(MultiValueField):
    def __init__(self, groups={}, initial=None, field_class=ChoiceField, widget_class=Select, widget_attrs={}, *args, **kwargs):
        # create hidden_field for tracking selected field
        data_initial = initial if isinstance(initial, text_type) else json.dumps(initial)
        group_id_field = CharField(widget=HiddenInput(attrs={"data-initial": data_initial}), initial=None)

        fields = [group_id_field]
        widgets = [group_id_field.widget]
        initial_values = [group_id_field.initial]
        self.group_field_mapping = {}
        field_index = 1
        for key, options in iteritems(groups):
            attrs = {
                "data-group-id": json.dumps(key)
            }
            attrs.update(widget_attrs)

            field = field_class(
                choices=options,
                widget=widget_class(attrs=attrs)
            )
            fields.append(field)

            widgets.append(field.widget)
            initial_values.append(initial)

            self.group_field_mapping[key] = field_index
            field_index += 1

        multi_widget = GroupedChoiceWidget(widgets=widgets, widget_name=widget_class.__name__.lower())

        super(GroupedChoiceField, self).__init__(widget=multi_widget, initial=initial_values, fields=fields, *args, **kwargs)

    def compress(self, data_list):
        """
        Returns the value from the selected field and ignores the others
        """
        if data_list:
            group_id = data_list[0] or None
            if group_id is not None:
                group_id = int(group_id)
            field_index = self.group_field_mapping[group_id]

            return data_list[field_index]
        else:
            return None

    def clean(self, value):
        """
        Overriding default behavior.  Can safely ignore validation
        on all but one of the fields.
        1. Clean data received from all fields; invalid values cause
           validation to fail.
        2. If self.required, check that self.compress returns a value
        """

        clean_data = []
        errors = ErrorList()

        # ensure `value` is a list
        if value and not isinstance(value, (list, tuple)):
            raise ValidationError(self.error_messages['invalid'])

        # clean data
        for i, field in enumerate(self.fields):
            try:
                field_value = value[i]
            except IndexError:
                field_value = None

            try:
                clean_data.append(field.clean(field_value))
            except ValidationError as e:
                errors.extend(e.messages)

        """
        For now, fail validation if any field is invalid. We can
        limit to the selected field if there is a benefit.
        """
        if errors:
            raise ValidationError(errors)

        out = self.compress(clean_data)

        if self.required and not out:
            raise ValidationError(self.error_messages['required'])

        return out

