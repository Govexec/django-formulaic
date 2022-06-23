from django.conf import settings
from django.forms.widgets import MultiWidget
from django.forms.widgets import TextInput


class GroupedChoiceWidget(MultiWidget):
    def __init__(self, widgets, attrs=None, widget_name="unknown"):
        self.widget_name = widget_name
        super(GroupedChoiceWidget, self).__init__(widgets, attrs=attrs)

    def decompress(self, value):
        if value and len(value) > 0:
            return [value]
        else:
            return []


class PhoneInput(TextInput):
    """Phone input field built upon Jack O'Connor's intl-tel-input widget.
    https://github.com/jackocnr/intl-tel-input
    """
    def __init__(self, attrs=None):
        super().__init__(attrs=attrs)
        self.attrs["utilsScript"] = settings.STATIC_URL.rstrip("/") + "/formulaic/js/intTelInput_utils.js"
        self.attrs["autocomplete"] = "tel"
        self.attrs.setdefault("full_suffix", "_full")

    def value_from_datadict(self, data, files, name):
        """
        Instead of getting the "name" value, we want to get the "full" version.
        This version of the phone number has the country code and preformatted
        by the front end for our convenvience.
        """
        suffix = self.attrs["full_suffix"]
        return data.get(name + suffix)

    class Media:
        js = (
            "formulaic/js/intlTelInput.min.js",
            "formulaic/js/phoneNumber.js",
        )
        css = {
            "all": (
                "formulaic/css/intlTelInput.css",
            ),
        }
