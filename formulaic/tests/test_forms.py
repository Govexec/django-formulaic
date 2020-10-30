from django.forms import fields, widgets
from django.test import TestCase

from formulaic import models
from formulaic.forms import CustomForm


class CustomFormTests(TestCase):

    def setUp(self):
        # create form
        form, created = models.Form.objects.get_or_create(name="My Test Form", slug="my-test-form")
        self.form_id = form.id

        # add textfield
        models.TextField.objects.get_or_create(
            name="Text Field 1",
            slug="text-field-1",
            required=True,
            help_text=None,
            # model_class="",
            # content_type=None,
            position=0,
            form_id=self.form_id,
            enabled=0, # todo: not implemented?
            css_class=None,
            subtype=models.TextField.SUBTYPE_TEXT,
        )

    def test_generation(self):
        """
        Test CustomForm init, fields, etc
        """
        field_count = 1

        form = models.Form.objects.get(pk=self.form_id)
        formulaic_form = CustomForm(instance_id="primary_form", form=form, label_suffix="", request=None)

        self.assertTrue(
            len(formulaic_form.fields) == field_count,
            "Form's field count is incorrect: {} instead of {}".format(
                len(formulaic_form.fields),
                field_count
            )
        )

        for field in formulaic_form:
            # TODO: this needs to be modified for different field types
            self.assertIsInstance(
                field.field,
                fields.CharField,
                "CustomForm generated wrong Django field type: {} instead of {}".format(
                    field.field.__class__,
                    fields.CharField
                )
            )
            self.assertIsInstance(
                field.field.widget,
                widgets.TextInput,
                "CustomForm generated wrong widget type: {} instead of {}".format(
                    field.field.widget.__class__,
                    widgets.TextInput
                )
            )

    def test_submission(self):
        """
        Test CustomForm submission
        """
        field_count = 1

        post_data = {
            "text-field-1": "My Test Value"
        }

        form = models.Form.objects.get(pk=self.form_id)
        custom_form = CustomForm(
            post_data,
            instance_id="primary_form",
            form=form,
            label_suffix="",
            request=None
        )

        self.assertTrue(custom_form.is_valid(), "Form isn't valid.")

        if custom_form.is_valid():
            obj = form.create_submission(custom_form.cleaned_data, source=custom_form.instance_id)

            submission = models.Submission.objects.get(pk=obj.pk)

            self.assertEqual(submission.form_id, self.form_id)
            self.assertIsNotNone(submission.date_created)
            self.assertEqual(submission.source, "primary_form")
            self.assertEqual(len(submission.custom_data.keys()), field_count)
            self.assertEqual(submission.custom_data["text-field-1"], "My Test Value")

    def test_state_and_city_auto_populated_from_zip(self):
        # create form
        zip_form, created = models.Form.objects.get_or_create(name="My Zip Form", slug="my-zip-form")
        post_data = {
            "Zipcode": "21043",
            "City": "",
            "State": ""
        }

        # add textfield
        models.TextField.objects.get_or_create(
            name="Zipcode",
            slug="Zipcode",
            required=True,
            help_text=None,
            position=0,
            form_id=zip_form.id,
            enabled=0,
            css_class=None,
            subtype=models.TextField.SUBTYPE_TEXT,
        )

        models.HiddenField.objects.get_or_create(
            name="City",
            slug="City",
            required=True,
            help_text=None,
            position=0,
            form_id=zip_form.id,
            enabled=0,
            css_class=None,
            subtype=models.Field.TYPE_HIDDEN
        )

        models.HiddenField.objects.get_or_create(
            name="State",
            slug="State",
            required=True,
            help_text=None,
            position=0,
            form_id=zip_form.id,
            enabled=0,
            css_class=None,
            subtype=models.Field.TYPE_HIDDEN
        )

        custom_form = CustomForm(
            post_data,
            instance_id="primary_form",
            form=zip_form,
            label_suffix="",
            request=None
        )

        self.assertTrue(custom_form.is_valid(), "Zip form isn't valid.")

        if custom_form.is_valid():
            obj = zip_form.create_submission(custom_form.cleaned_data, source=custom_form.instance_id)

            submission = models.Submission.objects.get(pk=obj.pk)

            self.assertEqual(submission.custom_data["State"], "Maryland")
            self.assertEqual(submission.custom_data["City"], "Ellicott City")
