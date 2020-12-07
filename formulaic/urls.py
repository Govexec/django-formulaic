try:
    # django 3+
    from django.urls import include, re_path
except ImportError:
    # django 1 and 2
    from django.conf.urls import include, url as re_path

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

urlpatterns = [
    re_path(r'^api/submissionsources/$', views.SubmissionSourceView.as_view()),
    re_path(r'^api/', include(router.urls)),
    re_path(r'^download/submissions/$', views.download_submissions),
]
