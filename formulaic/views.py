from datetime import datetime

from django.contrib.auth.decorators import permission_required
from django.db.models import Count
from django.http import Http404
from django.views.decorators.cache import never_cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets, pagination, views as rf_views
from rest_framework.response import Response
from rest_framework.views import APIView

from formulaic import models, utils, serializers, settings
from formulaic.csv_export import export_submissions_to_file
from formulaic.models import AsyncResults
from formulaic.utils import download_submission_task


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


@permission_required("formulaic.change_submission")
@never_cache
def download_submissions(request):
    # TODO: auto-cleanup files

    form_id = request.GET.get('form', None)

    if not form_id:
        raise Http404()

    try:
        models.Form.objects.get(pk=form_id)
    except models.Form.DoesNotExist:
        raise Http404()

    task = download_submission_task.delay(form_id)

    return Response({'task': task.task_id}, status=202)


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


class PollAsyncResultsView(APIView):
    """
    API endpoint that returns whether an Async job is finished, and
    what to do with the job.
    Once a related Async task finishes, it saves a JSON blob to
    AsyncResults table. PollAsyncResultsView looks for a JSON blob
    associated with the given task id and returns 202 Accepted
    until it finds one.

    The JSON blob looks like the below
    { status_code: 200,
      location: download url,
      filename: download file name }
    or if there was an error processing the task,
    { status_code: 500, error_message: error message}
    """

    def get(self, request, *args, **kwargs):
        task_id = self.kwargs.get("task_id", None)
        # there should only be one async_result with the task_id, user
        # combination
        async_result = AsyncResults.objects.get(task_id=task_id,
                                                user=self.request.user)
        if async_result:
            load_body = json.loads(async_result.result)
            status_code = load_body.get("status_code", None)
            # if the task produced an error code
            if status_code == 500:
                return Response(
                    status=500)
            else:
                return Response(status=200, data=load_body)
        else:
            return Response(status=202)