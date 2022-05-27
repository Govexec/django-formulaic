import csv
import pytz
from six import u
from tzlocal import get_localzone

from formulaic import models, utils


def export_submissions_to_file(form, output_file):
    field_names = form.column_headers
    writer = csv.DictWriter(output_file, fieldnames=field_names)
    writer.writeheader()

    # Prefetch the values, with the field select_related for speed.
    submission_qs = (
        models.Submission.objects
        .filter(form=form)
        .order_by('id')
        .prefetch_custom_data()
    )

    for _, _, _, submission_batch in utils.batch_qs(submission_qs):
        row_batch = []
        for submission in submission_batch:
            row = submission.prefetched_custom_data
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
            row['promo_source'] = submission.promo_source
            row_batch.append({k: u(v) for (k, v) in row.items()})
        writer.writerows(row_batch)
