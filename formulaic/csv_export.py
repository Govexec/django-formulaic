import csv
import json
import sys
from datetime import datetime

import pytz
from celery import shared_task
from django.conf import settings
from six import u
from tzlocal import get_localzone

from formulaic import models, utils


@shared_task
def download_submission_task(form_id):
    form = models.Form.objects.get(pk=form_id)
    datetime_slug = datetime.now().strftime("%Y%m%d-%H:%M:%S-%f")
    filename = '{}-submissions-{}.csv'.format(form.slug, datetime_slug)
    full_path = '{}/{}'.format(settings.FORMULAIC_EXPORT_STORAGE_LOCATION, filename)

    with open(full_path, 'w') as csvfile:
        return export_submissions_to_file(form, csvfile)

@shared_task(bind=True)
def generate_report(request, **kwargs):
  """
    Task: Generate a data report, store for download, and save the
    download URL to AsyncResults model once task finishes running
  """
  try:
    form_id = kwargs.get('form_id')
    datetime_slug = datetime.now().strftime("%Y%m%d-%H:%M:%S-%f")
    # function to generate, upload a report to AWS S3 then return
    # the report's s3 url
    # download_url = execute_generate_report()
    # get the celery task's task id

    form = models.Form.objects.get(pk=form_id)
    task_id = request.id
    # generate a file name
    filename = '{}-submissions-{}.csv'.format(form.slug, datetime_slug)
    result = {"status_code": 200,
              # "location": download_url,
              "filename": filename}
    json_result = json.dumps(result)
    models.AsyncResults.objects.create(task_id=task_id, result=json_result)
  except:
    # save error messages with status code 500
    result = {"status_code": 500,
              "error_message": str(sys.exc_info()[0])}
    json_result = json.dumps(result)
    models.AsyncResults.objects.create(task_id=task_id, result=json_result)

    return json_result


def export_submissions_to_file(form, output_file):
    field_names = form.column_headers
    writer = csv.DictWriter(output_file, fieldnames=field_names)
    writer.writeheader()

    submission_qs = (
        models.Submission.objects
        .filter(form=form)
        .order_by('id')
        .prefetch_related('values')
    )

    for _, _, _, submission_batch in utils.batch_qs(submission_qs):
        row_batch = []
        for submission in submission_batch:
            row = submission.custom_data
            local_tz = get_localzone()
            d = submission.date_created
            if d.tzinfo is None or d.tzinfo.utcoffset(d) is None:
                date_created_aware = (
                    pytz.timezone(local_tz.zone).localize(submission.date_created)
                )
            else:
                date_created_aware = submission.date_created
            row["date"] = date_created_aware.strftime('%m/%d/%Y %H:%M')
            row["source"] = submission.source
            # row_batch.append(
            #     {k: u(str(v)) if isinstance(v, bool) else v
            #      for (k, v) in row.items()}
            # )
            row_batch.append({k: u(v) for (k, v) in row.items()})
        writer.writerows(row_batch)
