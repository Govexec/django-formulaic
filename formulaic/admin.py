import json
from functools import update_wrapper

from django import forms
try:
    from django.urls import re_path
except ImportError:
    from django.conf.urls import url as re_path
from django.contrib import admin
from django.core.exceptions import PermissionDenied
try:
    # django < 1.10
    from django.core.urlresolvers import reverse
except Exception:
    # django >= 1.10
    from django.urls import reverse
from django.db import models
from django.forms import HiddenInput
from django.http import Http404
from django.shortcuts import redirect, render
from django.template import RequestContext
from django.template.response import TemplateResponse
from django.utils.safestring import mark_safe
try:
    # django < 1.11
    from django.utils.encoding import force_unicode
except Exception:
    # django >= 1.11
    from django.utils.encoding import force_text as force_unicode
from django.utils.translation import ugettext as _

from formulaic import models as formulaic_models
# from handl import media as handl_media


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
          class="handl-dl-start-task-btn"
          href="javascript:void(0);"
          onclick="$('#ld-submissions-dl-{pk}').submit();"
          data-for="ld-submissions-dl-{pk}"
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

        # return super_media + handl_media.HandlMedia + form_media
        return super_media + form_media

    def get_urls(self):
        def wrap(view):
            def wrapper(*args, **kwargs):
                return self.admin_site.admin_view(view)(*args, **kwargs)
            wrapper.model_admin = self
            return update_wrapper(wrapper, view)

        url_patterns = super(FormAdmin, self).get_urls()

        return [
            re_path(r'^([0-9]+)/archive/$', wrap(self.archive_view), name="formulaic_form_archive"),
            re_path(r'^([0-9]+)/unarchive/$', wrap(self.unarchive_view), name="formulaic_form_unarchive"),
            # re_path(r'^([0-9]+)/.+$', wrap(self.change_view)),
        ] + url_patterns

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        try:
            form = formulaic_models.Form.objects.get(pk=object_id)
        except formulaic_models.Form.DoesNotExist:
            form = None

        if not self.has_change_permission(request, form):
            raise PermissionDenied

        if form is None:
            raise Http404("Form does not exist")

        environment_config = {
            'modulePrefix': 'ember-formulaic',
            'environment': 'production',
            'rootURL': self.root_url,
            'locationType': 'auto',
            'tinyMCE': {
                'version': 4,  # default 4.4,
                'load': True
            },
            'EmberENV': {
                'FEATURES': {
                    # Here you can enable experimental features on an ember canary build
                    # e.g. 'with-controller': true
                },
                'EXTEND_PROTOTYPES': {
                    # Prevent Ember Data from overriding Date.parse.
                    'Date': False
                }
            },
            'APP': {
                # Here you can pass flags/options to your application instance
                # when it is created
                'API_HOST': '',
                'API_NAMESPACE': 'formulaic/api',
                "name": "ember-formulaic",
                "version": "0.0.0+a30ae212",
                "API_ADD_TRAILING_SLASHES": True,
            },
            "exportApplicationGlobal": True,
        }

        extra_context = extra_context or {}
        extra_context.update({
            "title": _('Change %s') % force_unicode(self.opts.verbose_name),
            "form_id": object_id,
            "opts": self.opts,
            "app_label": self.opts.app_label,
            "has_change_permission": self.has_change_permission(request, form),
            "original": form,
            "task_data": json.dumps({'form_pk': object_id}),
            "media": self.media,
            "environment_config": json.dumps(environment_config),
        })

        return super(FormAdmin, self).changeform_view(request, object_id=object_id, form_url=form_url, extra_context=extra_context)

    def get_right_queryset(self, request):
        if hasattr(self, 'get_queryset'):
            return self.get_queryset(request)
        else:
            # django < 1.6
            return self.queryset(request)

    def changelist_view(self, request, extra_context=None):
        forms_data = [
            {
                'pk': obj.pk,
                'task_data': json.dumps({'form_pk': obj.pk}),
            }
            for obj in self.get_right_queryset(request)
        ]
        context = {
            'handl_task_forms_data': forms_data
        }
        context.update(extra_context or {})
        return super(FormAdmin, self).changelist_view(request, extra_context=context)

    def archive_view(self, request, object_id):
        form = formulaic_models.Form.objects.get(pk=object_id)
        form.archived = True
        form.save()

        return self.return_to_changelist(request)

    def unarchive_view(self, request, object_id):
        form = formulaic_models.Form.objects.get(pk=object_id)
        form.archived = False
        form.save()

        return self.return_to_changelist(request)

    def return_to_changelist(self, request):
        # redirect back to referring page; default to changelist
        try:
            return redirect(request.META["HTTP_REFERER"])
        except KeyError:
            return redirect(self.root_url)

    @property
    def root_url(self):
        for admin_url in self.urls:
            if admin_url.name and admin_url.name.endswith('_changelist'):
                return reverse('admin:%s' % admin_url.name)
        raise Exception('Could not identify a root URL')

    def get_actions(self, request):
        actions = super(FormAdmin, self).get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    def has_delete_permission(self, request, obj=None):
        return False


class OptionInline(admin.TabularInline):
    model = formulaic_models.Option
    sortable_field_name = "position"
    formfield_overrides = {
        models.PositiveIntegerField: {
            "widget": HiddenInput,
            "label": "",
        }
    }
    prepopulated_fields = {'value': ('name',)}


class OptionGroupInline(admin.TabularInline):
    model = formulaic_models.OptionGroup
    sortable_field_name = "position"
    formfield_overrides = {
        models.PositiveIntegerField: {
            "widget": HiddenInput,
            "label": "",
        }
    }

    filter_horizontal = ('options',)

    def formfield_for_manytomany(self, db_field, request=None, **kwargs):
        """
        Filtering queryset to `options` from the correct list
        based on `formulaic_optionlist` object attached in
        `OptionListAdmin`
        """

        if db_field.name == "options":
            optionlist = request.formulaic_optionlist
            kwargs["queryset"] = formulaic_models.Option.objects.filter(list=optionlist)

        return super(OptionGroupInline, self).formfield_for_manytomany(db_field, request=request, **kwargs)


class OptionListAdmin(admin.ModelAdmin):
    model = formulaic_models.OptionList
    inlines = (
        OptionInline,
        OptionGroupInline,
    )
    search_fields = ('name',)

    def get_form(self, request, obj=None, **kwargs):
        """
        Attaching `optionlist` object to request for use in inlines
        """
        request.formulaic_optionlist = obj

        return super(OptionListAdmin, self).get_form(request, obj=obj, **kwargs)


class PrivacyPolicyAdmin(admin.ModelAdmin):
    model = formulaic_models.PrivacyPolicy

    fields = ('name', 'text',)

    search_fields = ('name',)


admin.site.register(formulaic_models.Form, FormAdmin)
admin.site.register(formulaic_models.OptionList, OptionListAdmin)
admin.site.register(formulaic_models.PrivacyPolicy, PrivacyPolicyAdmin)
