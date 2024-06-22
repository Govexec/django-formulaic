//controllers/form/submissions.js

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SubmissionsController extends Controller {
  @service store;
  @service router; // Injecting the router service

  queryParams = ['page', 'source'];
  @tracked formId = null;
  @tracked source = null;
  @tracked page = 1;

  get fields() {
    try {
      return this.store.query('field', { form: this.formId });
    } catch (error) {
      console.error('Error fetching fields:', error);
      throw error;
    }
  }

  get columnHeaders() {
    let headers = ['Date/Time', 'Source', 'Promo Source'];

    if (this.fields.isFulfilled) {
      this.fields.forEach(field => {
        headers.push(field.data_name);
      });
    }

    return headers;
  }

  get customColumnSlugs() {
    let slugs = [];

    if (this.fields.isFulfilled) {
      this.fields.forEach(field => {
        slugs.push(field.slug);
      });
    }

    return slugs;
  }

  get submissionDataList() {
    let rows = [];
    let slugs = this.customColumnSlugs;

    let submissions = this.model;

    submissions.forEach(submission => {
      let row = [
        submission.date_created,
        submission.source,
        submission.promo_source
      ];
      slugs.forEach(slug => {
        row.push(submission.custom_data[slug]);
      });
      rows.push(row);
    });

    return rows;
  }

  get hasSubmissions() {
    return this.submissionDataList.length > 0;
  }

  get metaData() {
    return this.model.meta;
  }

  get count() {
    return this.metaData ? this.metaData.count : null;
  }

  get currentPage() {
    return this.page || 1;
  }

  get nextPage() {
    return this.metaData ? this.metaData.next : null;
  }

  get previousPage() {
    let previousPage = this.page - 1;
    return previousPage > 0 ? previousPage : null;
  }

  get pageCount() {
    return Math.ceil(this.count / this.page_size);
  }

  get sources() {
    try {
      return this.store.query('submissionsource', { form: this.formId });
    } catch (error) {
      console.error('Error fetching sources:', error);
      throw error;
    }
  }

  get selectedSource() {
    return this.source;
  }

  @action
  changeSource(value) {
    this.source = value;
  }

  @action
  gotoPreviousPage() {
    if (this.page > 1) {
      this.page -= 1;
    }
  }

  @action
  gotoNextPage() {
    this.page += 1;
  }

  @action
  closeSubmissions() {
    this.router.transitionTo('form');
  }
}
