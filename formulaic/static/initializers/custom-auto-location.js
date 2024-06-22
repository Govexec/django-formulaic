import CustomAutoLocation from 'ember-formulaic/locations/auto';

export function initialize(application) {
  application.register('location:auto', CustomAutoLocation);
}

export default {
  initialize
};
