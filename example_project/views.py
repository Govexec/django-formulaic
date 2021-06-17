from django.shortcuts import redirect, render
from formulaic.forms import CustomForm
from formulaic.models import Form, TextField


def test_formulaic_form(request):
    # create form and add text field (if needed)
    formulaic_form, created = Form.objects.get_or_create(
        name="Test Form",
        slug="robot-form",
        archived=False,
    )

    TextField.objects.get_or_create(
        name="Text Field 1",
        slug="text-field-1",
        required=True,
        help_text=None,
        position=0,
        form_id=formulaic_form.id,
        enabled=0,
        css_class=None,
        subtype=TextField.SUBTYPE_TEXT,
    )

    if request.method == 'POST':
        form = CustomForm(
            request.POST,
            request=request,
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
            raise Exception('Not valid {}'.format(form.errors))

    else:
        form = CustomForm(
            request=request,
            instance_id='form-page-a',
            form=formulaic_form
        )

    return render(request, 'form.html', {
        'form': form
    })


def test_formulaic_form_complete(request):
    formulaic_form = Form.objects.get(slug='robot-form')

    return render(request, 'form-complete.html', {
        'form': formulaic_form,
    })
