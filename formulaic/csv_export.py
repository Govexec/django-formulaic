import csv
import json
import sys

import pytz
from celery import shared_task
from six import u
from tzlocal import get_localzone

from formulaic import models, utils


# bind the task to itself to ensure that task results get associated # with the correct task id
from formulaic.models import AsyncResults


@shared_task(bind=True)
# for bound celery tasks, you need to pass in self as the first argument
def generate_report(self, **kwargs):
  """
    Task: Generate a data report, store for download, and save the
    download URL to AsyncResults model once task finishes running
  """
  try:
    # function to generate, upload a report to AWS S3 then return
    # the report's s3 url
    # download_url = execute_generate_report()
    # get the celery task's task id
    task_id = self.request.id
    # generate a file name
    filename = f"export.csv"
    result = {"status_code": 200,
              # "location": download_url,
              "filename": filename}
    json_result = json.dumps(result)
    AsyncResults.objects.create(task_id=task_id,result=json_result)
  except:
    # save error messages with status code 500
    result = {"status_code": 500,
              "error_message": str(sys.exc_info()[0])}
    json_result = json.dumps(result)
    AsyncResults.objects.create(task_id=task_id, result=json_result)


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
