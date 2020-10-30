from bs4 import BeautifulSoup
from django import forms


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
