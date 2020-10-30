from django.conf import settings

"""
Required settings; must be implemented in site's settings.py
"""
FORMULAIC_EXPORT_STORAGE_LOCATION = getattr(settings, 'FORMULAIC_EXPORT_STORAGE_LOCATION')