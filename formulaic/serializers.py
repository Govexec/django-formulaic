import pytz
import six
from tzlocal import get_localzone

from formulaic import models
from rest_framework import serializers


class BooleanFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.BooleanField
        fields = (
            'id',
            'display_name',
            'data_name',
            'slug',
            'required',
            'help_text',
            'model_class',
            'position',
            'css_class',
            'form',
            'subtype',
            'default_checked',
        )


class HiddenFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.HiddenField
        fields = (
            'id',
            'display_name',
            'data_name',
            'slug',
            'required',
            'help_text',
            'model_class',
            'position',
            'css_class',
            'form',
            'subtype',
            'value',
        )


class JsonField(serializers.Field):

    def to_internal_value(self, data):
        if isinstance(data, six.text_type) or isinstance(data, dict) or isinstance(data, list):
            return data
        else:
            msg = self.error_messages['invalid']
            raise serializers.ValidationError(msg)

    def to_representation(self, obj):
        return obj


class DefaultOptionField(serializers.Field):

    def to_internal_value(self, data):
        if isinstance(data, six.text_type):
            return data
        else:
            msg = self.error_messages['invalid']
            raise serializers.ValidationError(msg)

    def to_representation(self, obj):
        return obj


class DefaultOptionsField(serializers.Field):

    def to_internal_value(self, data):
        if isinstance(data, list):
            return data
        else:
            msg = self.error_messages['invalid']
            raise serializers.ValidationError(msg)

    def to_representation(self, obj):
        return obj


class ChoiceFieldSerializer(serializers.ModelSerializer):
    default_option = DefaultOptionField(allow_null=True)
    default_options = DefaultOptionsField(allow_null=True)

    class Meta:
        model = models.ChoiceField
        fields = (
            'id',
            'display_name',
            'data_name',
            'slug',
            'required',
            'help_text',
            'model_class',
            'position',
            'css_class',
            'form',
            #'multiselect',
            'minimum_selections',
            'maximum_selections',
            'option_list',
            'option_group',
            'default_option',
            'default_options',
            'default_text',
            'subtype',
        )


class TextFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TextField
        fields = (
            'id',
            'display_name',
            'data_name',
            'slug',
            'required',
            'help_text',
            'model_class',
            'position',
            'css_class',
            'form',
            'subtype',
        )


class FieldSerializer(serializers.ModelSerializer):
    booleanfield = BooleanFieldSerializer()
    choicefield = ChoiceFieldSerializer()
    textfield = TextFieldSerializer()
    hiddenfield = HiddenFieldSerializer()

    class Meta:
        model = models.Field
        fields = (
            'id',
            'display_name',
            'data_name',
            'slug',
            'required',
            'help_text',
            'model_class',
            'position',
            'css_class',
            'form',
            'subtype',
            #'enabled',
            "textfield",
            "booleanfield",
            "choicefield",
            "hiddenfield",
            "content_type",
        )


class FormSerializer(serializers.ModelSerializer):
    #fields = FieldSerializer(source='field_set', many=True)

    class Meta:
        model = models.Form
        fields = (
            'id',
            'name',
            'slug',
            'success_message',
            'privacy_policy',
            #'fields',
        )


class PrivacyPolicySerializer(serializers.ModelSerializer):

    class Meta:
        model = models.PrivacyPolicy
        fields = (
            'id',
            'name',
            'text',
        )


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Option
        fields = (
            'id',
            'name',
            'value',
            'position',
            'list',
        )


class OptionListSerializer(serializers.ModelSerializer):
    options = OptionSerializer(source='option_set', many=True)

    class Meta:
        model = models.OptionList
        fields = (
            'id',
            'name',
            'options',
            'groups',
        )


class OptionGroupSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)

    class Meta:
        model = models.OptionGroup
        fields = (
            'id',
            'name',
            'position',
            'options',
            'list',
        )


class RuleResultSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField(read_only=False, required=False)

    class Meta:
        model = models.RuleResult
        fields = (
            'id',
            'action',
            'field',
            'rule',
            'option_group',
        )


class RuleConditionSerializer(serializers.ModelSerializer):

    # id: override read_only default
    id = serializers.IntegerField(read_only=False, required=False)

    # value: handle property (not a Django field)
    value = JsonField(required=False, allow_null=True)

    class Meta:
        model = models.RuleCondition
        fields = (
            'id',
            'position',
            'rule',
            'field',
            'operator',
            'value',
        )


class RuleSerializer(serializers.ModelSerializer):
    conditions = RuleConditionSerializer(many=True)
    results = RuleResultSerializer(many=True)

    class Meta:
        model = models.Rule
        fields = (
            'id',
            'form',
            'operator',
            'position',
            'conditions',
            'results',
        )

    def update(self, rule_obj, validated_data):
        conditions = validated_data.pop('conditions')
        results = validated_data.pop('results')

        # Update rule
        rule_obj.operator = validated_data.get('operator', rule_obj.operator)
        rule_obj.position = validated_data.get('position', rule_obj.position)
        rule_obj.save()

        # Update, create, or delete conditions
        condition_objs = list(rule_obj.conditions.all())
        for condition in conditions:
            if condition.get('id'):
                # exists
                for condition_obj in condition_objs:
                    if condition.get('id') == condition_obj.id:
                        # update existing condition
                        condition_obj.position = condition.get('position', condition_obj.position)
                        condition_obj.field_id = condition.get('field', condition_obj.field_id)
                        condition_obj.operator = condition.get('operator', condition_obj.operator)
                        condition_obj.value = condition.get('value', condition_obj.value)

                        # mark to avoid deletion
                        condition_obj.keep_alive = True
            else:
                # create new condition
                condition['rule'] = rule_obj
                # condition['value'] = "Test"  # TODO: remove hard coded value

                value = condition.pop('value')

                # Note: can't use `create` method; need access to `data` property
                condition_obj = models.RuleCondition(**condition)
                condition_obj.value = value
                condition_obj.save()

        # Carry out saves / deletes
        for condition_obj in condition_objs:
            if getattr(condition_obj, 'keep_alive', False):
                condition_obj.save()
            else:
                condition_obj.delete()

        # Update, create, or delete results
        result_objs = list(rule_obj.results.all())
        for result in results:
            if result.get('id'):
                # exists
                for result_obj in result_objs:
                    if result.get('id') == result_obj.id:
                        # update existing result
                        result_obj.action = result.get('action', result_obj.action)
                        result_obj.field_id = result.get('field', result_obj.field_id)
                        result_obj.option_group = result.get('option_group', result_obj.option_group)

                        # mark to avoid deletion
                        result_obj.keep_alive = True
            else:
                # create new rule
                result['rule'] = rule_obj
                models.RuleResult.objects.create(**result)

        # Carry out saves / deletes
        for result_obj in result_objs:
            if getattr(result_obj, 'keep_alive', False):
                result_obj.save()
            else:
                result_obj.delete()

        return rule_obj

    def create(self, validated_data):
        conditions = validated_data.pop('conditions')
        results = validated_data.pop('results')

        # Create rule
        rule = models.Rule.objects.create(**validated_data)

        # Create all conditions
        for condition in conditions:
            condition['rule'] = rule
            # condition['value'] = "Test"  # TODO: remove hard coded value

            value = condition.pop('value', None)

            # Note: can't use `create` method; need access to `data` property
            condition_obj = models.RuleCondition(**condition)
            condition_obj.value = value
            condition_obj.save()

        # Create all results
        for result in results:
            result['rule'] = rule
            models.RuleResult.objects.create(**result)

        return rule


class CustomDateTimeField(serializers.DateTimeField):

    def to_representation(self, obj):
        try:
            local_tz = get_localzone()
            obj_aware = pytz.timezone(local_tz.zone).localize(obj)
        except ValueError:
            obj_aware = obj

        return obj_aware.strftime('%m/%d/%Y %H:%M %Z')


class SubmissionSerializer(serializers.ModelSerializer):
    # values: handle property (not a Django field)
    custom_data = serializers.ReadOnlyField()

    date_created = CustomDateTimeField()

    class Meta:
        model = models.Submission
        fields = (
            'id',
            'date_created',
            'form',
            'custom_data',
            'source',
            'promo_source',
        )
