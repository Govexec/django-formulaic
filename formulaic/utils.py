import os

from django.core.servers.basehttp import FileWrapper
from django.http import HttpResponse


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


def send_file(request, filename, full_path):
    """
    Send a file through Django without loading the whole file into
    memory at once. The FileWrapper will turn the file object into an
    iterator for chunks of 8KB.

    Credit (modified to fit our purposes):
    jcrocholl
    https://djangosnippets.org/snippets/365/
    """
    wrapper = FileWrapper(file(full_path))
    response = HttpResponse(wrapper, content_type='text/csv')
    response['Content-Length'] = os.path.getsize(full_path)
    response['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
    response.set_cookie("fileDownload", value="true", max_age=60*60, path="/")
    return response