import uuid

from formulaic.csv_export import export_submissions_to_file
from formulaic.models import Form
from handl import errors as handl_errors
from handl.decorators import handl_job
from handl.models import DownloadableFile


@handl_job(max_retries=7)  # ~ 2 minutes
def create_submission_csv(data):

    try:
        form = Form.objects.get(pk=data.get('form_pk'))
    except Form.DoesNotExist:
        raise handl_errors.HandlTaskMissingData

    with open("/tmp/create_lead_csv-{}".format(uuid.uuid4()), "w") as outfile:
        export_submissions_to_file(form, outfile)

        files = [
            DownloadableFile(
                filename='{}-submissions.csv'.format(form.slug),
                file=outfile
            )
        ]

        return files
