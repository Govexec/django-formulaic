"""example_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
try:
    # django >= 1.10
    from django.urls import path, include
except:
    # django < 1.10
    from django.conf.urls import url as path
    from django.conf.urls import include

from . import views

urlpatterns = [
    path(
        'completed/',
        views.test_formulaic_form_complete,
        name='form-complete'
    ),

    path('formulaic/', include('formulaic.urls')),
    path('admin/', admin.site.urls),
    path('', views.test_formulaic_form),
]