'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const {resolve} = require("path");

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    fingerprint: {
      exclude: ['assets/vendor*', 'assets/ember-formulaic*'],
      generateAssetMap: true,
      fingerprintAssetMap: true,
      replaceExtensions: ['html', 'css', 'js'],
      displayOutput: false
    },
    'ember-bootstrap': {
      bootstrapVersion: 5,
      importBootstrapFont: true,
      importBootstrapCSS: false,
      insertEmberWormholeElementToDom: false
    },
    'ember-cli-babel': {
      includePolyfill: true
    },
    'ember-fetch': {
      preferNative: true
    },
    sassOptions: {
    // Example to use dart-sass
    implementation: require('sass'),
  }
  });

  return app.toTree();
};
