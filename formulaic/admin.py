import json
from functools import update_wrapper

from admin_ordering.admin import OrderableAdmin
from django import forms
from django.urls import re_path
from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django.urls import reverse
from django.http import Http404
from django.shortcuts import redirect
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from formulaic import models as formulaic_models


def archive_forms(modeladmin, request, queryset):
    """
    Action: archive all selected forms
    """
    queryset.update(archived=True)


archive_forms.short_description = "Archive selected forms"


def form_status(form):
    """
    List Column: display static, currently Active/Archived
    """
    if form.archived:
        return mark_safe("Archived")
    else:
        return mark_safe("<strong>Active</strong>")


form_status.short_description = "Status"
form_status.allow_tags = True


def form_submissions(form):
    template = """
      <div style="line-height: 20px;">
        <a
          href="/formulaic/download/submissions/?form={pk}"
        >
            Download Submissions CSV
        </a>
      </div>
    """
    return mark_safe(template.format(
        pk=form.pk
    ))


form_submissions.short_description = u'Submissions'
form_submissions.allow_tags = True


def form_actions(form):
    """
    List Column: archive button for each form
    """
    if form.archived:
        url = reverse("admin:formulaic_form_unarchive", args=(form.pk,))
        return mark_safe('<a href="{}">Un-archive</a>'.format(url))
    else:
        url = reverse("admin:formulaic_form_archive", args=(form.pk,))
        return mark_safe('<a href="{}">Archive</a>'.format(url))


form_actions.short_description = ""
form_actions.allow_tags = True


class FormAdmin(admin.ModelAdmin):
    prepopulated_fields = {
        "slug": ("name",),
    }

    list_display = (
        "name",
        form_submissions,
        form_status,
        form_actions,
    )

    list_filter = (
        "archived",
    )

    search_fields = ('name',)

    actions = [archive_forms]

    @property
    def media(self):
        super_media = super(FormAdmin, self).media
        form_media = forms.Media(
            css={
                'all': (
                    '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css',
                    'admin/formulaic/css/form.css',
                )
            },
            js=(
                '//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js',
                'admin/formulaic/js/form.js',
            )
        )

        return super_media + form_media

    def get_urls(self):
        def wrap(view):
            def wrapper(*args, **kwargs):
                return self.admin_site.admin_view(view)(*args, **kwargs)

            wrapper.model_admin = self
            return update_wrapper(wrapper, view)

        url_patterns = super().get_urls()

        return [
            re_path(r'^([0-9]+)/archive/$', wrap(self.archive_view),
                    name="formulaic_form_archive"),
            re_path(r'^([0-9]+)/unarchive/$', wrap(self.unarchive_view),
                    name="formulaic_form_unarchive"),
            # pattern eats remaining URL path used by `ember-formulaic`
            re_path(r'^([0-9]+)/.+$', wrap(self.changeform_view)),
        ] + url_patterns


