# Django Formulaic

Django Formulaic allows Django Admin users to create custom forms.  The generated forms
are rendered using an extension of Django's Form class.  Form submission data is
collected by the app and accessible via its admin interface.

_The app was originally developed for internal use.  We hope others will find it useful,
but it definitely lacks polish at this point in its development._

## Implementation

### Configuration

```python
# urls.py
urlpatterns = [
    # ...

    path('formulaic/', include('formulaic.urls')),
    path('admin/', admin.site.urls),
]
```

```python
# settings.py
FORMULAIC_EXPORT_STORAGE_LOCATION = '/data/shared/assets/formulaic_exports'
```

### Example Usage

The `CustomForm` class extends Django's `forms.Form` class, so you can expect a lot of the same behavior you see in Django's documentation.

```python
# urls.py
from django.contrib import admin
from django.urls import path, include

from formulaic_demo import views as fd_views

urlpatterns = [
    path('form-test/', fd_views.test_formulaic_form),
    path(
        'form-test/completed/',
        fd_views.test_formulaic_form_complete,
        name='form-complete'
    ),

    path('formulaic/', include('formulaic.urls')),
    path('admin/', admin.site.urls),
]
```

```python
# formulaic_demo/views.py
from django.shortcuts import redirect, render

from formulaic.forms import CustomForm
from formulaic.models import Form


def test_formulaic_form(request):
    formulaic_form = Form.objects.get(slug='robot-form')

    if request.method == 'POST':
        form = CustomForm(
            request.POST,
            request=request,
            # page-specific name for form. will be stored with each submission in the
            # `source` field.
            instance_id='form-page-a',
            form=formulaic_form
        )

        if form.is_valid():
            formulaic_form.create_submission(
                form.cleaned_data,
                source=form.instance_id,
                metadata={
                    'extra-data-1': 'some data',
                    'extra-data-2': 'more data',
                }
            )

            return redirect('form-complete')

        elif not form.is_valid():
            errors = form.errors
            # raise Exception('Not valid {}'.format(form.errors))
            return render(request, 'formulaic_demo/formulaic-form.html', {
                'form': form
            })
    else:
        form = CustomForm(
            request=request,
            # page-specific name for form. will be stored with each submission in the
            # `source` field.
            instance_id='form-page-a',
            form=formulaic_form
        )

    return render(request, 'formulaic_demo/formulaic-form.html', {
        'form': form
    })


def test_formulaic_form_complete(request):
    formulaic_form = Form.objects.get(slug='robot-form')

    return render(request, 'formulaic_demo/formulaic-form-complete.html', {
        'message': formulaic_form.success_message,
    })

```

```html
<!-- templates/formulaic_demo/formulaic-form.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Test Formulaic Form</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
  </head>
  <body>
    {{ form }}
  </body>
</html>

```

```html
<!-- templates/formulaic_demoformulaic-form-complete.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Test Formulaic Form</title>
  </head>
  <body>
    <p>{{ message }}</p>
  </body>
</html>


```

## Dependencies

### Python

- Django 3.1 [wip: expanding to a wider range]
- Python 3.8 [wip: expanding to a wider range]
- django-rest-framework 3.11.2 [wip: any breaking changes in 4.x?]
- nameparser 0.3.16
- pyzipcode 2.0.0
- us 0.9.1
- tzlocal 1.2.2

We would like to phase these out or make them optional

- beautifulsoup4 4.4.1
- raven 6.10.0
- django-ckeditor 5.9.0

### JavaScript

- **jQuery** must be included (for now) for the public-facing forms.
- The admin interface was built mostly using **EmberJS**.  You'll find setup instructions in the `README.md` at the root of that project: `/formulaic/static/admin/ember-formulaic`. This should only be important if you wish to make changes to the admin.

## License

Formulaic is licensed under the MIT License.  View the `LICENSE` file in the root directory for more information.
