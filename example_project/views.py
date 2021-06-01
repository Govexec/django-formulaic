# from django.urls import reverse
# from django.http import HttpResponseRedirect
# from django.shortcuts import get_object_or_404, render
# from django.views.generic import FormView, TemplateView
# from formulaic.forms import CustomForm


# class IndexView(TemplateView):
#     if()
#         form = models.Form.objects.create(
#             event=event,
#             name='Registration Form',
#             slug='registration-form',
#             archived=False
#         )

#     template_name = 'event/success.html'
#     page_type = 'success'

#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['event'] = models.Event.objects.get(slug=kwargs.get('event_slug'))
#         return context

# class RegistrationView(FormView):
#     form_class = CustomForm
#     template_name = 'registration.html'

#     @property
#     def form_instance_id(self):
#         return 'test-registration'

#     @property
#     def success_url(self):
#         return reverse('success', kwargs={'event_slug': self.event.slug})

#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         # pass GET parameters through to POST request
#         context['querystring'] = self.request.GET.urlencode()

#         return context

#     def get_form_kwargs(self):
#         if 'promo_source' in self.request.GET:
#             self.promo_source = self.request.GET['promo_source']

#         kwargs = super().get_form_kwargs()
#         kwargs.update({
#             'form': self.page.registration_form,
#             'instance_id': self.form_instance_id,
#             'request': self.request
#         })

#         return kwargs


from django.shortcuts import redirect, render

from formulaic.forms import CustomForm
from formulaic.models import Form


def test_formulaic_form(request):
    formulaic_form = Form.objects.get(slug='robot-form')

    if request.method == 'POST':
        form = CustomForm(
            request.POST,
            request=request,
            name='Registration Form',
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
            return render(request, 'form.html', {
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

    return render(request, 'form.html', {
        'form': form
    })


def test_formulaic_form_complete(request):
    formulaic_form = Form.objects.get(slug='robot-form')

    return render(request, 'form-complete.html', {
        'message': formulaic_form.success_message,
    })