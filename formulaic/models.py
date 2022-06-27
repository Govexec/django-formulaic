import json

from ckeditor.fields import RichTextField
import django
from django.contrib.contenttypes.models import ContentType
from django.db import models, transaction
from django.db.models import Max, Prefetch
from django.forms import fields, widgets
from django.utils import timezone
from django.utils.functional import cached_property
import phonenumbers
from six import iteritems, python_2_unicode_compatible, u

from formulaic import fields as custom_fields
from formulaic.auto_populate import attempt_kv_auto_populate
from formulaic.signals import submission_complete
from formulaic.validators import validate_mixed_content, validate_phone_number
from formulaic.widgets import PhoneInput


@python_2_unicode_compatible
class Form(models.Model):
    BASE_COLUMN_HEADERS = ['date', 'source', 'promo_source']
    name = models.CharField(max_length=500)
    slug = models.SlugField(max_length=200)
    success_message = models.TextField(null=True, blank=True)
    privacy_policy = models.ForeignKey(
        'PrivacyPolicy', on_delete=models.PROTECT, null=True, blank=True
    )

    archived = models.BooleanField(default=False)

    def create_submission(self, cleaned_data, source=None, metadata=None, promo_source=None):

        with transaction.atomic():
            # case submission
            submission = Submission()
            submission.form = self
            submission.date_created = timezone.now()
            submission.source = source
            submission.metadata = metadata or {}
            submission.promo_source = promo_source
            submission.save()

            # key value pairs
            key_value_pairs = []
            for key, value in iteritems(cleaned_data):
                if isinstance(value, dict):
                    # handle multi-value fields
                    # todo: DRY
                    for sub_key, sub_value in iteritems(value):
                        # if None, use regular key
                        if sub_key:
                            final_sub_key = "{}[{}]".format(key, sub_key)
                        else:
                            final_sub_key = key

                        key_value = SubmissionKeyValue()
                        key_value.submission = submission
                        key_value.key = final_sub_key
                        key_value.field = self.get_field_by_slug(key)
                        key_value.value = sub_value
                        key_value_pairs.append(key_value)
                else:
                    # handle standard fields
                    # todo: DRY
                    key_value = SubmissionKeyValue()
                    key_value.submission = submission
                    key_value.key = key
                    key_value.field = self.get_field_by_slug(key)
                    key_value.value = attempt_kv_auto_populate(key_value, value, cleaned_data)
                    key_value_pairs.append(key_value)

            SubmissionKeyValue.objects.bulk_create(key_value_pairs)

            submission_complete.send(sender=self.__class__, submission=submission, form=self)

        return submission

    @cached_property
    def column_headers(self):
        return (
            Form.BASE_COLUMN_HEADERS +
            list(self.field_set.all().order_by('position').values_list("slug", flat=True))
        )

    def get_field_by_slug(self, slug):
        if not hasattr(self, "_fields_dict"):
            all_fields = self.field_set.all()
            self._fields_dict = dict([(field.slug, field) for field in all_fields])

        return self._fields_dict.get(slug)

    @staticmethod
    def autocomplete_search_fields():
        return ("id__iexact", "name__icontains", "slug__icontains", )

    def __str__(self):
        if self.archived:
            return u("{} (archived)".format(self.name))
        else:
            return self.name

    class Meta:
        ordering = ('archived', 'name',)


@python_2_unicode_compatible
class PrivacyPolicy(models.Model):
    """
    Provides an editable list of privacy policies which can be selected
    on any Formulaic Form.  Ideally, it will act to override the privacy
    policy on the page the form is rendered on.
    """

    name = models.CharField(max_length=250)
    text = RichTextField(
        config_name="very_basic",
        validators=[validate_mixed_content, ]
    )

    class Meta:
        verbose_name_plural = "Privacy policies"

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class OptionList(models.Model):
    """
    Collection of options for use in selects, checkbox lists,
    radio lists, etc...
    """

    name = models.CharField(max_length=250)

    @cached_property
    def cached_groups(self):
        return self.groups.all()

    @cached_property
    def has_groups(self):
        """
        Checks if OptionList has any OptionGroups.  Using len()
        instead of count() because its anticipated to be used
        in conjunction with cached_groups anyway.
        """
        return len(self.cached_groups) > 0

    def __str__(self):
        return self.name


@python_2_unicode_compatible
class Option(models.Model):
    """
    An individual selectable option, represented as a member
    of an OptionList
    """

    name = models.CharField(max_length=250)
    value = models.CharField(max_length=250)
    position = models.PositiveIntegerField("Position", default=0)

    list = models.ForeignKey(OptionList, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('position',)

    def save(self, *args, **kwargs):
        if not self.position:
            max = self.objects.aggregate(m=Max("position"))["m"]
            self.position = 10 + (max or 0)
        super(Option, self).save(*args, **kwargs)


@python_2_unicode_compatible
class OptionGroup(models.Model):
    """
    A group of Options in an OptionList.  OptionGroups provide
    for flexibility to change which Options display based on
    the values of other fields via the Rules feature
    """

    name = models.CharField(max_length=250)
    position = models.PositiveIntegerField("Position", default=0)

    options = models.ManyToManyField(Option, related_name="groups")
    list = models.ForeignKey(
        OptionList, on_delete=models.CASCADE, related_name="groups"
    )

    @cached_property
    def cached_options(self):
        return self.options.all()

    def __str__(self):
        return "{}:{}".format(self.list.name, self.name)

    class Meta:
        ordering = ('position',)

    def save(self, *args, **kwargs):
        if not self.position:
            max = self.objects.aggregate(m=Max("position"))["m"]
            self.position = 10 + (max or 0)
        super(OptionGroup, self).save(*args, **kwargs)


@python_2_unicode_compatible
class Field(models.Model):
    # TODO: look into changing these
    TYPE_SELECT = "select"
    TYPE_TEXT = "text"
    TYPE_CHECKBOX = "checkbox"
    TYPE_HIDDEN = "hidden"

    # displayed attributes
    name = models.CharField(max_length=500)  # TODO: remove?
    display_name = models.CharField(max_length=1000)
    data_name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    required = models.BooleanField()
    help_text = models.CharField(max_length=500, blank=True, null=True)

    subtype = models.CharField(max_length=100)

    # bookkeeping attributes
    model_class = models.CharField(max_length=100)
    position = models.PositiveIntegerField("Position")
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    enabled = models.BooleanField(default=True)

    # styling attributes
    css_class = models.CharField(max_length=120, blank=True, null=True)

    # TODO: marked for removal
    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT)

    def subtype_is(self, subtype):
        return self.subtype == subtype

    def subtype_in(self, subtypes):
        return self.subtype in subtypes

    # TODO: delete this and change references to complete_field
    def get_specific_field(self):
        return self.content_type.get_object_for_this_type(id=self.id)

    @property
    def complete_field(self):
        model = self.content_type.model
        return getattr(self, model)

    class Meta:
        ordering = ['position']

        # TODO: based on requirements, this should probably be removed
        # might need to support duplicates across multiple pages
        unique_together = ("form", "slug")

    def __str__(self):
        return self.data_name

    def save(self, **kwargs):
        # TODO: temporary; testing Ember
        self.content_type = ContentType.objects.get_for_model(type(self))
        self.model_class = self.__class__.__name__.lower()

        super(Field, self).save(**kwargs)


class TextField(Field):
    SUBTYPE_TEXT = u"text"
    SUBTYPE_TEXTAREA = u"textarea"
    SUBTYPE_FULL_NAME = u"full_name"
    SUBTYPE_EMAIL = u"email"
    SUBTYPE_PHONE_NUMBER = u"phone_number"
    SUBTYPE_INTEGER = u"integer"

    SUBTYPES = {
        SUBTYPE_TEXT: {
            u"field_class": fields.CharField,
            u"widget_class": widgets.TextInput
        },
        SUBTYPE_TEXTAREA: {
            u"field_class": fields.CharField,
            u"widget_class": widgets.Textarea
        },
        SUBTYPE_EMAIL: {
            u"field_class": fields.EmailField,
            u"widget_class": widgets.TextInput
        },
        SUBTYPE_PHONE_NUMBER: {
            u"field_class": fields.CharField,
            u"widget_class": PhoneInput,
            u"validators": [validate_phone_number],
        },
        SUBTYPE_INTEGER: {
            u"field_class": fields.IntegerField,
            u"widget_class": widgets.TextInput
        },
        SUBTYPE_FULL_NAME: {
            u"field_class": custom_fields.FullNameField,
            u"widget_class": widgets.TextInput
        },
    }

    textarea_rows = models.PositiveIntegerField(blank=True, null=True)

    def get_implementation(self, widget_attrs=None):

        widget_attrs = widget_attrs or dict()

        subtype_options = TextField.SUBTYPES[self.subtype]

        widget_attrs[u"data-id"] = self.id

        if self.subtype == TextField.SUBTYPE_TEXTAREA:
            widget_attrs[u"rows"] = str(self.textarea_rows if self.textarea_rows else 4)

        widget_class = subtype_options[u"widget_class"]
        widget = widget_class(attrs=widget_attrs)

        field_class = subtype_options[u"field_class"]

        validators = subtype_options.get(u"validators", [])

        return field_class(
            label=self.display_name,
            required=self.required,
            widget=widget,
            validators=validators
        )

    def save(self, **kwargs):
        self.content_type = ContentType.objects.get_for_model(type(self))
        self.model_class = self.__class__.__name__.lower()

        super(TextField, self).save(**kwargs)


class HiddenField(Field):
    field_type = Field.TYPE_HIDDEN

    value = models.CharField(max_length=500, null=True, blank=True)

    def get_implementation(self, widget_attrs={}):
        widget_attrs[u"data-id"] = self.id
        widget = widgets.HiddenInput(attrs=widget_attrs)

        return fields.CharField(
            widget=widget,
            initial=self.value,
            required=False
        )


class BooleanField(Field):
    field_type = Field.TYPE_CHECKBOX

    default_checked = models.BooleanField()

    def get_implementation(self, widget_attrs={}):
        widget_attrs[u"data-id"] = self.id
        widget = widgets.CheckboxInput(attrs=widget_attrs)

        return fields.BooleanField(
            label=self.display_name,
            required=self.required,
            widget=widget,
            initial=self.default_checked
        )

    def save(self, **kwargs):
        self.content_type = ContentType.objects.get_for_model(type(self))
        self.model_class = self.__class__.__name__.lower()

        super(BooleanField, self).save(**kwargs)


class ChoiceField(Field):
    DEFAULT_TEXT_BACKUP = u"(Choose One)"

    SUBTYPE_SELECT = u"select"
    SUBTYPE_SELECTMULTIPLE = u"select_multiple"
    SUBTYPE_RADIOSELECT = u"radio_select"
    SUBTYPE_CHECKBOXSELECTMULTIPLE = u"checkbox_select_multiple"

    SUBTYPES = {
        SUBTYPE_SELECT: {
            u"field_class": fields.ChoiceField,
            u"widget_class": widgets.Select,
            u"multiple": False,
        },
        SUBTYPE_SELECTMULTIPLE: {
            u"field_class": fields.MultipleChoiceField,
            u"widget_class": widgets.SelectMultiple,
            u"multiple": True,
        },
        SUBTYPE_RADIOSELECT: {
            u"field_class": fields.ChoiceField,
            u"widget_class": widgets.RadioSelect,
            u"multiple": False,
        },
        SUBTYPE_CHECKBOXSELECTMULTIPLE: {
            u"field_class": fields.MultipleChoiceField,
            u"widget_class": widgets.CheckboxSelectMultiple,
            u"multiple": True,
        },
    }

    # multiselect = models.BooleanField()
    minimum_selections = models.PositiveIntegerField(blank=True, null=True)
    maximum_selections = models.PositiveIntegerField(blank=True, null=True)

    option_list = models.ForeignKey(OptionList, on_delete=models.PROTECT)
    option_group = models.ForeignKey(
        OptionGroup, on_delete=models.PROTECT, blank=True, null=True
    )
    default_options_string = models.CharField(max_length=200, blank=True, null=True)
    default_text = models.CharField(max_length=200, blank=True, null=True)

    field_type = Field.TYPE_SELECT
    field_class = fields.ChoiceField

    @property
    def needs_default_text(self):
        return not self.supports_multiple_values and not self.default_option

    @property
    def default_text_or_backup(self):
        return self.default_text or ChoiceField.DEFAULT_TEXT_BACKUP

    @property
    def supports_multiple_values(self):
        return ChoiceField.SUBTYPES[self.subtype][u"multiple"]

    @property
    def default_option(self):
        if self.default_options_string and not self.supports_multiple_values:
            return json.loads(self.default_options_string)[0]
        else:
            return None

    @default_option.setter
    def default_option(self, value):
        if not self.supports_multiple_values:
            if value:
                self.default_options_string = json.dumps([value])
            else:
                self.default_options_string = None

    @property
    def default_options(self):
        if self.default_options_string and self.supports_multiple_values:
            return json.loads(self.default_options_string)
        else:
            return []

    @default_options.setter
    def default_options(self, value):
        if self.supports_multiple_values:
            if value:
                self.default_options_string = json.dumps(value)
            else:
                self.default_options_string = None

    @property
    def options(self):
        if self.option_group:
            return self.option_group.options.all()
        else:
            return self.option_list.option_set.all()

    def get_implementation(self, widget_attrs={}):
        subtype_options = ChoiceField.SUBTYPES[self.subtype]

        widget_attrs[u"data-id"] = self.id
        widget_class = subtype_options[u"widget_class"]

        field_class = subtype_options[u"field_class"]

        default_options = []
        if self.needs_default_text:
            default_options.append(("", self.default_text_or_backup))
        for option in self.options:
            default_options.append((option.id, option.name))

        if self.supports_multiple_values and self.default_options:
            initial_value = self.default_options
        elif not self.supports_multiple_values and self.default_option:
            initial_value = self.default_option
        else:
            initial_value = None

        if not self.option_list.has_groups:
            # Standard implementation
            return field_class(
                label=self.display_name,
                required=self.required,
                choices=default_options,
                initial=initial_value,
                widget=widget_class(attrs=widget_attrs)
            )
        else:
            # GroupedChoiceField implementation
            groups = {
                None: default_options
            }

            for group in self.option_list.cached_groups:
                group_options = []

                if self.needs_default_text:
                    group_options.append((u"", self.default_text_or_backup))

                for option in group.cached_options:
                    group_options.append((option.id, option.name))

                groups[group.id] = group_options

            return custom_fields.GroupedChoiceField(
                label=self.display_name,
                required=self.required,
                groups=groups,
                initial=initial_value,
                field_class=field_class,
                widget_class=widget_class,
                widget_attrs=widget_attrs
            )

    def save(self, **kwargs):
        self.content_type = ContentType.objects.get_for_model(type(self))
        self.model_class = self.__class__.__name__.lower()

        super(ChoiceField, self).save(**kwargs)


@python_2_unicode_compatible
class RuleResult(models.Model):
    ACTION_SHOW = 'show'
    ACTION_HIDE = 'hide'
    ACTION_REQUIRE = 'require'
    ACTION_OPTIONAL = 'optional'
    ACTION_CHANGE_OPTION_GROUP = 'change-option-group'

    ACTION_CHOICES = (
        (ACTION_SHOW, 'Show'),
        (ACTION_HIDE, 'Hide'),
        (ACTION_REQUIRE, 'Require (Override)'),
        (ACTION_OPTIONAL, 'Optional (Override)'),
        (ACTION_CHANGE_OPTION_GROUP, 'Change Option Group'),
    )

    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    field = models.ForeignKey(Field, on_delete=models.PROTECT)
    rule = models.ForeignKey(
        'Rule', on_delete=models.CASCADE, related_name='results', blank=True, null=True
    )
    option_group = models.ForeignKey(
        'OptionGroup', on_delete=models.PROTECT, blank=True, null=True
    )

    def __str__(self):
        return u("{}: '{}' field '{}' if rule '{}' is true".format(
            self.id,
            self.action,
            self.field_id,
            self.rule_id
        ))


@python_2_unicode_compatible
class Rule(models.Model):
    OPERATOR_AND = 'and'
    OPERATOR_OR = 'or'
    OPERATOR_CHOICES = (
        (OPERATOR_AND, 'And'),
        (OPERATOR_OR, 'Or')
    )

    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    # rule_set
    operator = models.CharField(max_length=3, choices=OPERATOR_CHOICES)
    position = models.IntegerField()

    def __str__(self):
        return u('{}: position "{}"'.format(self.id, self.position))

    class Meta:
        ordering = ('position',)


@python_2_unicode_compatible
class RuleCondition(models.Model):
    OPERATOR_IS = 'is'
    OPERATOR_IS_NOT = 'is_not'
    OPERATOR_CONTAINS = 'contains'
    OPERATOR_DOES_NOT_CONTAIN = 'does_not_contain'
    OPERATOR_BEGINS_WITH = 'begins_with'
    OPERATOR_ENDS_WITH = 'ends_with'
    OPERATOR_GREATER_THAN = 'greater_than'
    OPERATOR_LESS_THAN = 'less_than'
    OPERATOR_ANY_SELECTED = 'any_selected'
    OPERATOR_ALL_SELECTED = 'all_selected'

    OPERATOR_CHOICES = (
        (OPERATOR_IS, 'is'),
        (OPERATOR_IS_NOT, 'is_not'),
        (OPERATOR_CONTAINS, 'contains'),
        (OPERATOR_DOES_NOT_CONTAIN, 'does_not_contain'),
        (OPERATOR_BEGINS_WITH, 'begins_with'),
        (OPERATOR_ENDS_WITH, 'ends_with'),
        (OPERATOR_GREATER_THAN, 'greater_than'),
        (OPERATOR_LESS_THAN, 'less_than'),
        (OPERATOR_ANY_SELECTED, 'any_selected'),
        (OPERATOR_ALL_SELECTED, 'all_selected')
    )

    position = models.PositiveIntegerField()
    rule = models.ForeignKey(
        Rule, on_delete=models.CASCADE, related_name="conditions", blank=True, null=True
    )

    field = models.ForeignKey(Field, on_delete=models.PROTECT)
    operator = models.CharField(max_length=30, choices=OPERATOR_CHOICES)

    value_string = models.TextField()

    @property
    def value(self):
        return json.loads(self.value_string)

    @value.setter
    def value(self, value):
        self.value_string = json.dumps(value)

    def __str__(self):
        return u('{}: field "{}" {} ______'.format(
            self.id,
            self.field_id,
            self.operator
        ))

    class Meta:
        ordering = ('position',)


@python_2_unicode_compatible
class DisplayCondition(models.Model):
    IS = "is"
    IS_NOT = "is_not"

    VALUE_OPTIONS = (
        (IS, "is"),
        (IS_NOT, "is not")
    )

    values = models.TextField()
    value_option = models.CharField(max_length=15, choices=VALUE_OPTIONS)

    affected_field = models.ForeignKey(
        Field, on_delete=models.PROTECT, related_name="affecting_conditions"
    )
    watched_field = models.ForeignKey(
        Field, on_delete=models.PROTECT, related_name="watching_conditions"
    )

    def is_met_by_default(self):
        specific_watched_field = self.watched_field.get_specific_field()

        value_is = self.value_option == DisplayCondition.IS
        if specific_watched_field.field_type == Field.TYPE_SELECT:
            default_option_in_values = specific_watched_field.default_option in json.loads(self.values)
            return default_option_in_values if value_is else not default_option_in_values
        else:
            # TODO: setup default values which could match the DisplayCondition values
            return False

    def __str__(self):
        return "Display field #{} if field #{} {} {}".format(
            self.affected_field_id,
            self.watched_field_id,
            self.value_option,
            self.values
        )


class SubmissionQuerySet(models.QuerySet):

    _should_prefetch_custom_data = False
    _prefetch_custom_data_done = False

    def _clone(self, **kwargs):
        """Overloading _clone to allow for lazy prefetching of prefetch_custom_data

        This is required to make the prefetch_custom_data method commutative
        """

        # Compatibility
        if django.get_version() < "2.0.0":
            clone = super()._clone(**kwargs)
        else:
            clone = super()._clone()
        clone._should_prefetch_custom_data = self._should_prefetch_custom_data
        return clone

    def _fetch_all(self):
        """Overloading _fetch_all to allow for lazy prefetching of prefetch_custom_data"""

        r = super()._fetch_all()
        if self._should_prefetch_custom_data and not self._prefetch_custom_data_done:
            self._execute_prefetch_custom_data()
            self._prefetch_custom_data_done = True
        return r

    def _execute_prefetch_custom_data(self):
        """Performs the prefetch on the custom data in bulk
        """

        # First, determine what is the smallest set of options that we need to
        # create and then generate the options lookup dictionary.
        relevant_choices = (
            SubmissionKeyValue.objects
            .filter(submission__in=self, field__subtype__in=ChoiceField.SUBTYPES.keys())
            .values_list("value_charfield", flat=True)
            .order_by("value_charfield").distinct()
        )

        relevant_choices = [json.loads(choice) for choice in relevant_choices]
        # We need to "flatten" relevant choices, some entries could be lists.
        cleaned_relevant_choices = []
        for choice in relevant_choices:
            # Ignore blanks.
            if not choice:
                continue

            # Extend our cleaned list of relevant choices.
            # Make sure we only count integers.
            if isinstance(choice, list):
                cleaned_relevant_choices.extend([int(val) for val in choice if val.isdigit()])

            # These should already be integers. But better to make sure nothing
            # is slipping through.
            else:
                cleaned_relevant_choices.append(int(choice))

        # Remove duplicates
        cleaned_relevant_choices = set(cleaned_relevant_choices)

        # Create the options lookup dictionary.
        options = (
            Option.objects
            .filter(id__in=cleaned_relevant_choices)
            .values_list("id", "name")
        )
        options_lookup = dict(options)

        forms_by_id = dict()

        # We need to assign forms here to the python objects. Without this step,
        # we would create multiple python objects for the same form contained in
        # the database. By reassigning the form here we cache results onto a
        # single python object. It should be noted that in practice, there will
        # likely only be one form, but this supports submissions across
        # different forms.
        for submission in self._result_cache:
            if submission.form_id in forms_by_id:
                submission.form = forms_by_id[submission.form_id]
            else:
                forms_by_id[submission.form_id] = submission.form

            # Actually constructing the custom data and storing it.
            submission._get_custom_data_with_option_lookup(options_lookup)

    def prefetch_custom_data(self):
        """Returns a list with all of the custom data included."""

        self._should_prefetch_custom_data = True
        prefetch_values_qs = SubmissionKeyValue.objects.select_related("field")
        return self.select_related("form").prefetch_related(Prefetch("values", queryset=prefetch_values_qs))


class SubmissionManager(models.Manager):
    def get_queryset(self):
        return SubmissionQuerySet(self.model, using=self._db)

    def prefetch_custom_data(self):
        return self.get_queryset().prefetch_custom_data()


class Submission(models.Model):

    objects = SubmissionManager()

    form = models.ForeignKey(Form, on_delete=models.PROTECT)
    date_created = models.DateTimeField()

    source = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text="Name of the specific form placement the user filled out (e.g. sidebar-subscribe)"
    )

    promo_source = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text="Source passed through metadata variable promo_source"
    )

    @cached_property
    def custom_data(self):
        column_headers = self.form.column_headers
        data = {}

        for key_value in self.values.all():
            if key_value.key in column_headers:
                data[key_value.key] = key_value.output_value

        return data

    _prefetched_custom_data_cache = None

    @property
    def prefetched_custom_data(self):
        """Retrieves the custom data that was prefetched by the
        "prefetch_custom_data" queryset method.
        """

        if not self._prefetched_custom_data_cache:
            self._prefetched_custom_data_cache = self.custom_data
        return self._prefetched_custom_data_cache

    def _get_custom_data_with_option_lookup(self, options_lookup):
        """Similar output to "custom_data" property, however this allows for an
        options_lookup and importantly calls the _output_value_with_options_lookup
        method on the SubmissionKeyValue objects. Calling this with the lookup
        allows for much more efficient bulk exports.
         """
        if not self._prefetched_custom_data_cache:

            column_headers = self.form.column_headers
            data = {}

            for key_value in self.values.all():
                if key_value.key in column_headers:
                    data[key_value.key] = key_value._output_value_with_options_lookup(options_lookup)

            self._prefetched_custom_data_cache = data

        return self._prefetched_custom_data_cache

    metadata_serialized = models.TextField(
        help_text="Serialized JSON object storing arbitrary submission-related metadata"
    )

    @property
    def metadata(self):
        try:
            return json.loads(self.metadata_serialized)
        except ValueError:
            return {}

    @metadata.setter
    def metadata(self, value):
        self.metadata_serialized = json.dumps(value)


@python_2_unicode_compatible
class SubmissionKeyValue(models.Model):
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="values"
    )
    key = models.CharField(max_length=200, db_index=True)
    value_charfield = models.CharField(max_length=500, null=True, blank=True)
    value_textfield = models.TextField(null=True, blank=True)
    field = models.ForeignKey(Field, on_delete=models.SET_NULL, null=True, blank=True)

    # TODO: cache output_value in database to speed up reports.  problem, option values can change...hmmm....

    @property
    def value(self):
        # print("THIS ONE AT LEAST?")
        if self.value_charfield is not None:
            return json.loads(self.value_charfield)
        else:
            return self.value_textfield

    @value.setter
    def value(self, value):
        if self.field and self.field.subtype_is(TextField.SUBTYPE_TEXTAREA):
            self.value_textfield = value
            self.value_charfield = None
        else:
            self.value_textfield = None
            self.value_charfield = json.dumps(value)

    @property
    def output_value(self):
        value = self.value

        # Special Formatting for Phone Numbers
        if self.field.subtype_is(TextField.SUBTYPE_PHONE_NUMBER):
            try:
                parsed_number = phonenumbers.parse(value)
                return phonenumbers.format_number(
                    parsed_number, phonenumbers.PhoneNumberFormat.INTERNATIONAL
                )

            except phonenumbers.NumberParseException:
                # If phonenumbers doesn't know how to handle it, just return the
                # value as is.
                return value

        # replace ids with text values
        if value and self.field and self.field.subtype_in(ChoiceField.SUBTYPES.keys()):
            # convert to list for query
            if not isinstance(value, list):
                value = [value]

            selected_options = Option.objects.filter(id__in=value).values_list('name', flat=True)

            value = ",".join(selected_options)

        return value

    def _output_value_with_options_lookup(self, options_lookup):
        """Mirrors "output_value", but with an option_lookup dictionary. This
        dictionary avoids looking up the options in the database. This is useful for when
        exporting multiple submissions of the same form, as the Options being
        looked up are almost always the same.

        options_lookup is a dictionary with "values" as keys and "names" as values
        """
        value = self.value

        # replace ids with text values
        if value and self.field and self.field.subtype_in(ChoiceField.SUBTYPES.keys()):
            # convert to list for query
            if not isinstance(value, list):
                value = [value]

            selected_options = [options_lookup.get(json.loads(v)) for v in value]
            return ",".join(selected_options)

        return self.output_value

    def __str__(self):
        return "{}:{}".format(self.key, self.value)
