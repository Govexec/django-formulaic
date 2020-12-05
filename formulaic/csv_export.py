import csv
import pytz
from six import u
from tzlocal import get_localzone

from formulaic import models, utils


def export_submissions_to_file(form, output_file):
    field_names = form.column_headers
    writer = csv.DictWriter(output_file, fieldnames=field_names)
    writer.writeheader()

    submission_qs = (
        models.Submission.objects
        .filter(form=form)
        .select_related('values')
        .order_by('id')
    )

    for _, _, _, submission_batch in utils.batch_qs(submission_qs):
        row_batch = []
        for submission in submission_batch:
            row = submission.custom_data
            local_tz = get_localzone()
            date_created_aware = (
                pytz.timezone(local_tz.zone).localize(submission.date_created)
            )
            row["date"] = date_created_aware.strftime('%m/%d/%Y %H:%M')
            row["source"] = submission.source
            row_batch.append({k: u(v).encode('utf-8') for (k, v) in row.items()})
        writer.writerows(row_batch)
