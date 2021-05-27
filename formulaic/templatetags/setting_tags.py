from django import template
from django.conf import settings

register = template.Library()


@register.simple_tag(name='formulaic_tinymce_key')
def formulaic_tinymce_key():
    return settings.FORMULAIC_TINYMCE_KEY

