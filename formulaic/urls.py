from django.conf.urls import patterns, url, include
from rest_framework import routers

from formulaic import views

router = routers.SimpleRouter()
router.register(r'forms', views.FormViewset)
router.register(r'privacypolicies', views.PrivacyPolicyViewset)
router.register(r'fields', views.FieldViewset)
router.register(r'textfields', views.TextFieldViewset)
router.register(r'choicefields', views.ChoiceFieldViewset)
router.register(r'booleanfields', views.BooleanFieldViewset)
router.register(r'hiddenfields', views.HiddenFieldViewset)
router.register(r'optionlists', views.OptionListViewset)
router.register(r'optiongroups', views.OptionGroupViewset)
router.register(r'options', views.OptionViewset)
router.register(r'ruleconditions', views.RuleConditionViewset)
router.register(r'rules', views.RuleViewset)
router.register(r'ruleresults', views.RuleResultViewset)
router.register(r'submissions', views.SubmissionViewset)

urlpatterns = patterns(
    '',
    url(r'^api/submissionsources/$', views.SubmissionSourceView.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'^download/submissions/$', 'formulaic.views.download_submissions'),
)
