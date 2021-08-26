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

    with open(full_path, 'w+') as csvfile:
        export_submissions_to_file(form, csvfile)
    return filename


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
