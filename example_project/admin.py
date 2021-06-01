from functools import partial
from django import forms
from django.contrib import admin
import sys
from formulaic.admin import FormAdmin, OptionListAdmin, PrivacyPolicyAdmin
from formulaic.models import Form, OptionList, PrivacyPolicy

admin.site.register(Form, FormAdmin)
admin.site.register(OptionList, OptionListAdmin)
admin.site.register(PrivacyPolicy, PrivacyPolicyAdmin)