from datetime import datetime

from django.contrib.auth.decorators import permission_required
from django.db.models import Count
from django.db import transaction
from django.http import Http404
from django.views.decorators.cache import never_cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, viewsets, pagination, views as rf_views
from rest_framework.response import Response

from formulaic import models, utils, serializers, settings
from formulaic.csv_export import export_submissions_to_file


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
        form = models.Form.objects.get(pk=form_id)
    except models.Form.DoesNotExist:
        raise Http404()

    datetime_slug = datetime.now().strftime("%Y%m%d-%H:%M:%S-%f")
    filename = '{}-submissions-{}.csv'.format(form.slug, datetime_slug)
    full_path = '{}/{}'.format(settings.FORMULAIC_EXPORT_STORAGE_LOCATION, filename)

    with open(full_path, 'w') as csvfile:
        export_submissions_to_file(form, csvfile)

    return utils.send_file(request, filename, full_path)


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

    def destroy(self, request, *args, **kwargs):
        """Clean up any rules that may be associated with the object.

        # todo
        This is intended to only be a temporary change to help alleviate
        frustrations around not being able to delete fields. The ideal solution
        would be to display to the user why they cannot delete a particular field.
        At that point we can confirm the blanket delete (what this function is doing)
        or help guide the user to carefully remove the ruleresults and ruleconditions.

        If a Rule does not have a rule condition or rule result, then it is invalid. If
        a field is associated with the last rule condition or rule result, we'll also
        delete the rule.
        """
        instance = self.get_object()

        rule_ids_to_be_deleted = set()
        rule_result_ids_to_be_delete = set()
        rule_conditions_ids_to_be_delete = set()

        # Gathering rule result related deletes.
        related_rule_results = instance.ruleresult_set.all().select_related("rule").prefetch_related("rule__results")
        for rule_result in related_rule_results:

            if rule_result.rule.results.all().count() == 1:
                rule_ids_to_be_deleted.add(rule_result.rule_id)

            rule_result_ids_to_be_delete.add(rule_result.id)

        # Gathering rule condition related deletes.
        related_ruleconditions = instance.rulecondition_set.all().select_related("rule").prefetch_related("rule__conditions")
        for rule_condition in related_ruleconditions:
            if rule_condition.rule.conditions.all().count() == 1:
                rule_ids_to_be_deleted.add(rule_condition.rule_id)

            rule_conditions_ids_to_be_delete.add(rule_condition.id)

        # Actually perform the deletes. Perform it in an atomic block to help revert
        with transaction.atomic():
            models.Rule.objects.filter(id__in=rule_ids_to_be_deleted).delete()
            models.RuleResult.objects.filter(id__in=rule_result_ids_to_be_delete).delete()
            models.RuleCondition.objects.filter(id__in=rule_conditions_ids_to_be_delete).delete()
            return super().destroy(request, *args, **kwargs)


class TextFieldViewset(FieldViewset):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.TextField.objects.all()
    )
    serializer_class = serializers.TextFieldSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form',)


class ChoiceFieldViewset(FieldViewset):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.ChoiceField.objects.all()
    )
    serializer_class = serializers.ChoiceFieldSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form',)


class BooleanFieldViewset(FieldViewset):
    permission_classes = (
        CustomDjangoModelPermissions,
    )

    queryset = (
        models.BooleanField.objects.all()
    )
    serializer_class = serializers.BooleanFieldSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('form',)


class HiddenFieldViewset(FieldViewset):
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
