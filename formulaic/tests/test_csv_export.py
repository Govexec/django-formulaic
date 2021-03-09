from datetime import date
import uuid
import os

from django.test import TestCase

from formulaic import models
from formulaic import csv_export
from formulaic.forms import CustomForm



class CsvExportTestCase(TestCase):
    def setUp(self):
        # Create Form
        form, created = models.Form.objects.get_or_create(name="My Test Form", slug="my-test-form")
        self.form_id = form.id

        # Add TextField
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

    def test_csv_export(self):
        # Test with 10000, 1000, 100
        number_of_submissions = 5
        file_name = "/tmp/test_formulaic_csv_export_test"
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

        # Create Submissions
        for n in range(number_of_submissions):
            form.create_submission(custom_form.cleaned_data, source=custom_form.instance_id)

        # Write CSV
        with open(file_name, "w") as outfile:
            csv_exporter = csv_export.export_submissions_to_file(form, outfile)

        # Read CSV
        with open(file_name, "r") as outfile:
            # CSV Header
            outfile.readline()
            for row in outfile:
                array = row.split(",")
                self.assertTrue(array[1], "primary_form")