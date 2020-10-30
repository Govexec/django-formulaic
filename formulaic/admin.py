import json

from django import forms
from django.conf.urls import patterns, url
from django.contrib import admin
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.db import models
from django.forms import HiddenInput
from django.http import Http404
from django.shortcuts import redirect, render_to_response
from django.template import RequestContext
from django.utils.encoding import force_unicode
from django.utils.translation import ugettext as _

from formulaic import models as formulaic_models
from handl import media as handl_media


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
        return "Archived"
    else:
        return "<strong>Active</strong>"


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
    return template.format(
        pk=form.pk
    )


form_submissions.short_description = u'Submissions'
form_submissions.allow_tags = True


def form_actions(form):
    """
    List Column: archive button for each form
    """
    if form.archived:
        url = reverse("admin:formulaic_form_unarchive", args=(form.pk,))
        return '<a href="{}">Un-archive</a>'.format(url)
    else:
        url = reverse("admin:formulaic_form_archive", args=(form.pk,))
        return '<a href="{}">Archive</a>'.format(url)


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

        return super_media + handl_media.HandlMedia + form_media

    def get_urls(self):
        url_patterns = super(FormAdmin, self).get_urls()

        return patterns(
            '',
            url(r'^([0-9]+)/archive/$', self.archive_view, name="formulaic_form_archive"),
            url(r'^([0-9]+)/unarchive/$', self.unarchive_view, name="formulaic_form_unarchive"),
            url(r'^([0-9]+)/.+$', self.change_view),
        ) + url_patterns

    def change_view(self, request, object_id, form_url='', extra_context=None):
        return self.ember_form_view(request, object_id=object_id)

    def changelist_view(self, request, extra_context=None):
        forms_data = [
            {
                'pk': obj.pk,
                'task_data': json.dumps({'form_pk': obj.pk}),
            }
            for obj in self.queryset(request)
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
            return redirect("admin:formulaic_form_changelist")

    def ember_form_view(self, request, object_id=None):
        try:
            form = formulaic_models.Form.objects.get(pk=object_id)
        except formulaic_models.Form.DoesNotExist:
            form = None

        if not self.has_change_permission(request, form):
            raise PermissionDenied

        if form is None:
            raise Http404("Form does not exist")

        context_variables = {
            "title": _('Change %s') % force_unicode(self.opts.verbose_name),
            "form_id": object_id,
            "opts": self.opts,
            "app_label": self.opts.app_label,
            "has_change_permission": self.has_change_permission(request, form),
            "original": form,
            "task_data": json.dumps({'form_pk': object_id}),
            "media": self.media,
        }

        return render_to_response(
            "admin/formulaic/form/index.html",
            context_variables,
            RequestContext(request)
        )

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
