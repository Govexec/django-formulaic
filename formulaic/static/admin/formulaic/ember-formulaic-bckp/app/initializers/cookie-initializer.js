export function initialize(application) {
    application.inject('route', 'cookie', 'cookie:main');
    application.inject('controller', 'cookie', 'cookie:main');
    application.inject('adapter', 'cookie', 'cookie:main');
}

export default {
    name: 'cookie-initializer',
    before: ['ember-data'],
    initialize: initialize
};
