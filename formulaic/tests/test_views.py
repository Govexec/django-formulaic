from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from formulaic import models


class FieldViewsetTestCase(TestCase):

    def setUp(self):
        """Construct a collection of objects that will frequently get used.

        self.field_1 relates to a field that is associated with a RuleCondition
        of a Rule. self.field_2 relates to a RuleResult of the same Rule.
        """
        User = get_user_model()
        self.superuser = User.objects.create_superuser('superuser', 'superuser@test.com', "password")
        self.client = APIClient()

        # create form
        self.form = models.Form.objects.create(name="My Test Form", slug="my-test-form")

        # add textfield
        self.field_1 = models.TextField.objects.create(
            name="Text Field 1",
            slug="text-field-1",
            required=True,
            data_name="text_field_1",
            position=0,
            form=self.form,
            subtype=models.TextField.SUBTYPE_TEXT,
        )

        self.field_2 = models.TextField.objects.create(
            name="Text Field 2",
            slug="text-field-2",
            required=True,
            data_name="text_field_2",
            position=1,
            form=self.form,
            subtype=models.TextField.SUBTYPE_TEXT,
        )

        self.rule = models.Rule.objects.create(
            form=self.form,
            position=1,
            operator=models.Rule.OPERATOR_AND
        )
        self.condition = models.RuleCondition.objects.create(
            rule=self.rule,
            field=self.field_1,
            position=1,
            operator=models.RuleCondition.OPERATOR_CONTAINS,
            value_string="testing"
        )

        self.result = models.RuleResult.objects.create(
            rule=self.rule,
            field=self.field_2,
            action=models.RuleResult.ACTION_SHOW
        )

    def test_destroy_last_condition(self):
        """
        Confirm that if you delete a field that is the linked to the
        last condition for a given Rule, the Field, RuleCondition, RuleResult
        and Rule are all deleted.
        """
        # Make the request to destroy.
        url = reverse('textfield-detail', kwargs={'pk': self.field_1.pk})
        self.client.force_authenticate(user=self.superuser)
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, 204)

        # Confirm that field_1, rule, condition, result are all deleted.
        self.assertFalse(models.TextField.objects.filter(pk=self.field_1.pk).exists())
        self.assertFalse(models.Rule.objects.filter(pk=self.rule.pk).exists())
        self.assertFalse(models.RuleCondition.objects.filter(pk=self.condition.pk).exists())
        self.assertFalse(models.RuleResult.objects.filter(pk=self.result.pk).exists())

        # Confirm that field_2 still exists.
        self.assertTrue(models.TextField.objects.filter(pk=self.field_2.pk).exists())

    def test_destroy_not_last_condition(self):
        """
        Confirm that if you delete a field that is the linked to the
        condition of a Rule, but it is not the only condition.

        In this scenario we expect the Condition related to the field to be
        deleted, but the Rule and RuleResult should remain.
        """

        # Setup extra condition so that self.condition is not the last condition.
        field_3 = models.TextField.objects.create(
            name="Text Field 3",
            slug="text-field-3",
            required=True,
            data_name="text_field_3",
            position=1,
            form=self.form,
            subtype=models.TextField.SUBTYPE_TEXT,
        )

        extra_condition = models.RuleCondition.objects.create(
            rule=self.rule,
            field=field_3,
            position=2,
            operator=models.RuleCondition.OPERATOR_CONTAINS,
            value_string="testing"
        )

        # Make the request to destroy.
        url = reverse('textfield-detail', kwargs={'pk': self.field_1.pk})
        self.client.force_authenticate(user=self.superuser)
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, 204)

        # Confirm that only field_1 and the related condition is deleted.
        self.assertFalse(models.TextField.objects.filter(pk=self.field_1.pk).exists())
        self.assertFalse(models.RuleCondition.objects.filter(pk=self.condition.pk).exists())

        # Confirm that field_2, the new condition and result still exist.
        self.assertTrue(models.TextField.objects.filter(pk=self.field_2.pk).exists())
        self.assertTrue(models.Rule.objects.filter(pk=self.rule.pk).exists())
        self.assertTrue(models.RuleCondition.objects.filter(pk=extra_condition.pk).exists())
        self.assertTrue(models.RuleResult.objects.filter(pk=self.result.pk).exists())

    def test_destroy_last_result(self):
        """
        Confirm that if you delete a field that is the linked to the
        last condition for a given Rule, the Field, RuleCondition, RuleResult
        and Rule are all deleted.
        """
        # Make the request to destroy.
        url = reverse('textfield-detail', kwargs={'pk': self.field_2.pk})
        self.client.force_authenticate(user=self.superuser)
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, 204)

        # Confirm that field_2, rule, condition, result are all deleted.
        self.assertFalse(models.TextField.objects.filter(pk=self.field_2.pk).exists())
        self.assertFalse(models.Rule.objects.filter(pk=self.rule.pk).exists())
        self.assertFalse(models.RuleCondition.objects.filter(pk=self.condition.pk).exists())
        self.assertFalse(models.RuleResult.objects.filter(pk=self.result.pk).exists())

        # Confirm that field_1 still exists.
        self.assertTrue(models.TextField.objects.filter(pk=self.field_1.pk).exists())

    def test_destroy_not_last_result(self):
        """
        Confirm that if you delete a field that is the linked to the
        result of a Rule, but it is not the only rule.

        In this scenario we expect the Rule related to the field to be
        deleted, but the Rule and Condition should remain.
        """

        # Setup extra condition so that self.condition is not the last condition.
        field_3 = models.TextField.objects.create(
            name="Text Field 3",
            slug="text-field-3",
            required=True,
            data_name="text_field_3",
            position=1,
            form=self.form,
            subtype=models.TextField.SUBTYPE_TEXT,
        )

        extra_result = models.RuleResult.objects.create(
            rule=self.rule,
            field=field_3,
            action=models.RuleResult.ACTION_SHOW
        )

        # Make the request to destroy.
        url = reverse('textfield-detail', kwargs={'pk': self.field_2.pk})
        self.client.force_authenticate(user=self.superuser)
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, 204)

        # Confirm that only field_2 and the related rule is deleted.
        self.assertFalse(models.TextField.objects.filter(pk=self.field_2.pk).exists())
        self.assertFalse(models.RuleResult.objects.filter(pk=self.result.pk).exists())

        # Confirm that field_1, the new result and condition still exist.
        self.assertTrue(models.TextField.objects.filter(pk=self.field_1.pk).exists())
        self.assertTrue(models.Rule.objects.filter(pk=self.rule.pk).exists())
        self.assertTrue(models.RuleResult.objects.filter(pk=extra_result.pk).exists())
        self.assertTrue(models.RuleCondition.objects.filter(pk=self.condition.pk).exists())
