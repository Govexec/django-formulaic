from bs4 import BeautifulSoup
from django import forms
import phonenumbers


def validate_mixed_content(value):
    """
    Validate content to avoid mixed content warnings
    """

    targets = (
        {"tag": "img", "attr": "src"},
        {"tag": "script", "attr": "src"},
        {"tag": "iframe", "attr": "src"},
        {"tag": "link", "attr": "src"},
    )

    soup = BeautifulSoup(value, 'html.parser')
    errors = []

    for target in targets:
        for item in soup.find_all(target["tag"]):
            src = item.get(target["attr"], '')
            if "http://" in src:
                if not errors:
                    errors.append("These tags must use https protocol:")
                errors.append("<{}>: {}".format(target["tag"], src))

    if errors:
        raise forms.ValidationError(errors)


def validate_phone_number(value):
    """Uses the phonenumbers library to try and parse the phone number and
    check for it's validity. """

    try:
        z = phonenumbers.parse(value, None)
    except phonenumbers.NumberParseException:
        raise forms.ValidationError("Enter a valid phone number.")

    if not phonenumbers.is_valid_number(z):
        raise forms.ValidationError("Enter a valid phone number.")

