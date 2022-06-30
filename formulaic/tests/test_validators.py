from django.test import TestCase

from formulaic.validators import validate_phone_number
from django.forms import ValidationError


class PhoneNumberTestCase(TestCase):

    def test_valid_phone_number(self):
        """Confirm that no exception gets raised by this function when provided
        with a "valid" phone number"""
        self.assertIsNone(validate_phone_number("+12025551234"))

    def test_valid_phone_number_with_extension(self):
        """Confirm that no exception gets raised by this function when provided
        with a "valid" phone number"""
        self.assertIsNone(validate_phone_number("+12025551234 ext. 12"))

    def test_possible_but_invalid_phone_number(self):
        """These are numbers that look like they could be real, but are not.
        An example would be one that uses an area code that does not exist."""

        with self.assertRaises(ValidationError):
            validate_phone_number("+19995551234")

    def test_invalid_phone_number(self):
        """Other junky phone numbers."""

        # Missing one digit.
        with self.assertRaises(ValidationError):
            validate_phone_number("+1202555123")

        # Too many digits
        with self.assertRaises(ValidationError):
            validate_phone_number("+120255512345")

        # Missing Country Code
        with self.assertRaises(ValidationError):
            validate_phone_number("2025551234")

        # Whatever
        with self.assertRaises(ValidationError):
            validate_phone_number("Whatever")
