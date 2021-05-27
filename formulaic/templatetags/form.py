from django import template
from django.conf import settings

register = template.Library()


def autocomplete_attribute(name):
    attributes = {
        "email": "email",
        "full_name": "name",
        "full-name": "name",
        "custom_companyname": "organization",
        "job-title": "organization-title",
        "phone": "tel",
        "phone-number": "tel",
        "zip-code": "postal-code",
        "country_other": "country-name",
    }

    return attributes[name] if name in attributes else "on"


def widget_type(field):
    """
    (stolen from django-widget-tweaks) Returns field widget class name (in lower case).
    """
    if hasattr(field, 'field') and hasattr(field.field, 'widget') and field.field.widget:
        widget_name = field.field.widget.__class__.__name__.lower()

        if widget_name == "groupedchoicewidget":
            widget_name = field.field.widget.widget_name

        return widget_name
    return ''


def add_attributes_to_field(field):
    """ Adds extra attributes to the form widget """
    if field.field.required:
        field.field.widget.attrs["data-required"] = "true"

    if widget_type(field) == "textinput" and field.name:
        field.field.widget.attrs.update({
            "autocomplete": autocomplete_attribute(field.name)
        })

    return field


def add_classes_to_field(field, extra_classes):
    """ Adds extra CSS classes to the form widget """
    classes = field.field.widget.attrs.get("class", "").split()
    classes.extend(extra_classes.split())
    field.field.widget.attrs["class"] = " ".join(sorted(set(classes)))
    return field


def formulaic_field_classes(widget):
    classes = []

    # type of widget
    widget_name = widget.__class__.__name__.lower()

    if widget_name == "groupedchoicewidget":
        widget_name = widget.widget_name
    classes.append(widget_name)

    # hide/show
    readonly = widget.attrs.get("readonly", False)
    disabled = widget.attrs.get("disabled", False)
    if readonly or disabled:
        classes.append("disabled")

    return " ".join(classes)


@register.filter(is_safe=True)
def formulaic_tinymce_key():
    return settings.FORMULAIC_TINYMCE_KEY



register.filter('formulaic_extra_attributes', add_attributes_to_field)
register.filter('formulaic_extra_widget_classes', add_classes_to_field)
register.filter('formulaic_field_classes', formulaic_field_classes)
register.filter('widget_type', widget_type)
