from django.test import TestCase

from formulaic import models
from formulaic.forms import CustomForm


class SubmissionTestCase(TestCase):
    def setUp(self):
        # create form
        form, created = models.Form.objects.get_or_create(
            name="My Test Form", slug="my-test-form"
        )
        self.form_id = form.id

        # add textfield
        models.TextField.objects.get_or_create(
            name="Text Field 1",
            slug="text-field-1",
            required=True,
            help_text=None,
            position=0,
            form_id=self.form_id,
            enabled=0,
            css_class=None,
            subtype=models.TextField.SUBTYPE_TEXT,
        )

        # add phone number
        models.TextField.objects.get_or_create(
            name="Phone Number 1",
            slug="phone-number-1",
            required=True,
            help_text=None,
            position=0,
            form_id=self.form_id,
            enabled=0,
            css_class=None,
            subtype=models.TextField.SUBTYPE_PHONE_NUMBER,
        )

    def test_submission_with_promo_source_saves_properly(self):
        post_data = {
            "text-field-1": "My Test Value",
            "phone-number-1": "(202) 555 1234",
            "phone-number-1_full": "+12025551234"
        }

        form = models.Form.objects.get(pk=self.form_id)
        custom_form = CustomForm(
            post_data,
            instance_id="primary_form",
            form=form,
            label_suffix="",
            request=None,
        )
        custom_form.is_valid()
        self.assertTrue(custom_form.is_valid(), "Form isn't valid.")

        obj = form.create_submission(
            custom_form.cleaned_data,
            source=custom_form.instance_id,
            promo_source="testing_promo_source",
        )

        submission = models.Submission.objects.get(pk=obj.pk)
        self.assertEqual(submission.promo_source, "testing_promo_source")
