from coffin import template as coffin_template
from django import template

from websites.base.templatetags.base_filters import (
    add_attributes_to_field,
    add_classes_to_field,
    widget_type,
)

register = template.Library()
register_coffin = coffin_template.Library()


@register_coffin.inclusion_tag("formulaic/form.html")
def show_formulaic_form(form):
    fields = form.field_set.all()
    return {"form": form}


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


register.filter('formulaic_extra_attributes', add_attributes_to_field)
register.filter('formulaic_extra_widget_classes', add_classes_to_field)
register.filter('formulaic_field_classes', formulaic_field_classes)
register.filter('widget_type', widget_type)

register_coffin.filter('formulaic_extra_attributes', add_attributes_to_field)
register_coffin.filter('formulaic_extra_widget_classes', add_classes_to_field)
register_coffin.filter('formulaic_field_classes', formulaic_field_classes)
register_coffin.filter('widget_type', widget_type)
