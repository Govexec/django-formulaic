from six import iteritems, u

from formulaic.utils import state_from_zip, city_from_zip


"""
#TODO#
This way of auto-populating state values from zipcode values is a work-around until
we can add a proper `ZipCodeField` field to Formulaic, and then implement the
auto-zipcode-to-state mapping in a way similar to how it was done for the `FullNameField`
parsing. Right now we are not doing the more correct thing for time-saving reasons.
"""


def attempt_kv_auto_populate(submission_kv, field_val, form_data):
    """
    Attempts to auto-populate values for certain form fields; passes through the original
    value (which in most cases will be an empty/null of some kind; why would we be auto-
    populating otherwise?) untouched if no auto-population was possible.
    """
    if submission_kv.key.lower() == "state" or submission_kv.key.lower() == "city":
        return _attempt_state_or_city_from_zipcode(submission_kv, field_val, form_data)

    # . . . other kinds of auto-populate attempts could be added here
    return field_val


def _attempt_state_or_city_from_zipcode(submission_kv, field_val, form_data):
    """
    Attempt to get the state name from the zipcode, otherwise pass the original value
    through.

    We only look for hidden 'state' fields, since that field configuration is the user's
    way of signalling that they want 'state' to be auto-populated by Formulaic. It's
    certainly a not-ideal work-around.
    """
    is_hidden_field = submission_kv.field.subtype_is(submission_kv.field.TYPE_HIDDEN)

    zipcode = None
    for key, value in iteritems(form_data):
        if key.lower() not in ("zipcode", "zip-code"):
            continue
        try:
            zipcode = value.strip()[:5]
        except AttributeError:
            zipcode = u(value).strip()[:5]
        break

    if is_hidden_field and zipcode and not field_val:
        if submission_kv.key.lower() == "state":
            return state_from_zip(zipcode)
        else:
            return city_from_zip(zipcode)

    return field_val
