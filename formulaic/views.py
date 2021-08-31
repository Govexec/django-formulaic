import json

from django.conf import settings
from django.db.models import Count
from django.http import Http404, HttpResponse, HttpResponseForbidden
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets, pagination, views as rf_views
from rest_framework.response import Response
from rest_framework.views import APIView

from . import csv_export, models, serializers

class CustomDjangoModelPermissions(permissions.DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.change_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


class DownloadSubmissionView(APIView):

    def get(self, request):
        # TODO: auto-cleanup files

        form_id = request.GET.get('form', None)

        if not form_id:
            raise Http404()

        task = csv_export.download_submission_task.delay(form_id=form_id)
        response = {'task': task.id}

        return Response(response, status=202)


class PollAsyncResultsView(APIView):

    def get(self, request, *args, **kwargs):
        task_id = kwargs.get("task_id")
        filename = 'download.csv'
        result = csv_export.download_submission_task.AsyncResult(task_id)
        if result.ready():
            try:
                f = open('{}/{}'.format(settings.FORMULAIC_EXPORT_STORAGE_LOCATION, filename))
            except:
                return HttpResponse(status=204)
            else:
                response = HttpResponse(f, mimetype='text/csv')
                response['Content-Disposition'] = 'attachment; filename=%s' % filename
            return response
        else:
            return HttpResponse(status=204)


class SubmissionSourceView(rf_views.APIView):
    permission_classes = (CustomDjangoModelPermissions,)
    queryset = models.Submission.objects.none()  # Required for DjangoModelPermissions

    def get(self, request):
        """
        Return all unique submission sources for form
        """
        form_id = request.GET.get("form", None)

        if not form_id:
            raise Http404()

        data = (
            models.Submission.objects
            .values("source")
            .filter(form_id=form_id)
            .annotate(count=Count("source"))
            .order_by("source")
        )

        return Response(data)


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 1000


class SubmissionViewset(viewsets.ReadOnlyModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.Submission.objects
        .all()
        .order_by('-date_created')
        .prefetch_related('values')
    )

    serializer_class = serializers.SubmissionSerializer
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form', 'source',)


class RuleConditionViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (models.RuleCondition.objects.all())

    serializer_class = serializers.RuleConditionSerializer


class RuleViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (models.Rule.objects.all())

    serializer_class = serializers.RuleSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form', 'position',)  # todo:remove position


class RuleResultViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (models.RuleResult.objects.all())

    serializer_class = serializers.RuleResultSerializer


class FormViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (models.Form.objects.all())

    serializer_class = serializers.FormSerializer


class PrivacyPolicyViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (models.PrivacyPolicy.objects.all())

    serializer_class = serializers.PrivacyPolicySerializer


class FieldViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.Field.objects.all().select_related("textfield", "booleanfield", "choicefield", "content_type")
    )
    serializer_class = serializers.FieldSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form',)


class TextFieldViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.TextField.objects.all()
    )
    serializer_class = serializers.TextFieldSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form',)


class ChoiceFieldViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.ChoiceField.objects.all()
    )
    serializer_class = serializers.ChoiceFieldSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form',)


class BooleanFieldViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.BooleanField.objects.all()
    )
    serializer_class = serializers.BooleanFieldSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form',)


class HiddenFieldViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.HiddenField.objects.all()
    )
    serializer_class = serializers.HiddenFieldSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form',)


class OptionListViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.OptionList.objects.all()
    )
    serializer_class = serializers.OptionListSerializer


class OptionGroupViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.OptionGroup.objects.all()
    )
    serializer_class = serializers.OptionGroupSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('list',)


class OptionViewset(viewsets.ModelViewSet):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.Option.objects.all()
    )
    serializer_class = serializers.OptionSerializer



