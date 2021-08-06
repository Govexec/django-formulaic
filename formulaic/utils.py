import json

from django.http import StreamingHttpResponse
from pyzipcode import ZipCodeDatabase
import us
from rest_framework.response import Response
from rest_framework.views import APIView

from formulaic import models


class PollAsyncResultsView(APIView):

    def get(self, request, *args, **kwargs):
        task_id = self.kwargs.get("task_id", None)
        # there should only be one async_result with the task_id, user
        # combination
        async_result = models.AsyncResults.objects.get(task_id=task_id,
                                                user=self.request.user)
        if async_result:
            load_body = json.loads(async_result.result)
            status_code = load_body.get("status_code", None)
            # if the task produced an error code
            if status_code == 500:
                return Response(
                    status=500)
            else:
                return Response(status=200, data=load_body)
        else:
            return Response(status=202)


def batch_qs(qs, batch_size=1000):
    """
    Returns a (start, end, total, queryset) tuple for each batch in the given
    queryset.

    Usage:
        # Make sure to order your querset
        article_qs = Article.objects.order_by('id')
        for start, end, total, qs in batch_qs(article_qs):
            print "Now processing %s - %s of %s" % (start + 1, end, total)
            for article in qs:
                print article.body

    Credit:
    jkocherhans
    https://djangosnippets.org/snippets/1170/
    """
    total = qs.count()
    for start in range(0, total, batch_size):
        end = min(start + batch_size, total)
        yield (start, end, total, qs[start:end])



def send_file(filename, full_path):
    """
    Send a file through Django without loading the whole file into
    memory at once. The FileWrapper will turn the file object into an
    iterator for chunks of 8KB.

    Credit (modified to fit our purposes):
    jcrocholl
    https://djangosnippets.org/snippets/365/
    """
    wrapper = open(full_path)
    response = StreamingHttpResponse(wrapper, content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
    response.set_cookie("fileDownload", value="true", max_age=60*60, path="/")
    return response


def state_from_zip(zipcode):
    try:
        zip_info = ZipCodeDatabase()[zipcode]
    except IndexError:
        return None

    if zip_info.city in ('APO', 'FPO', 'DPO'):
        # we cannot lookup state names for APO/FPO/DPO zipcodes;
        # probably we need better handling in audb for military PO addresses
        return zip_info.state

    state = us.states.lookup(zip_info.state)
    return state.name if state else None


def city_from_zip(zipcode):
    try:
        zip_info = ZipCodeDatabase()[zipcode]
        return zip_info.city
    except IndexError:
        return None
