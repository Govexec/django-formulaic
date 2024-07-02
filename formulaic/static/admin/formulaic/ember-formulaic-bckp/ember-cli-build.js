/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    lessOptions: {
      paths: [
        'bower_components/bootstrap/less'
      ]
    }
  });

app.import('bower_components/jquery-ui/jquery-ui.js');
app.import('bower_components/jquery-file-download/src/Scripts/jquery.fileDownload.js');

app.import('bower_components/bootstrap/js/affix.js');

app.import('bower_components/bootstrap/fonts/glyphicons-halflings-regular.eot', {
  destDir: 'fonts/'
});
app.import('bower_components/bootstrap/fonts/glyphicons-halflings-regular.svg', {
  destDir: 'fonts/'
});
app.import('bower_components/bootstrap/fonts/glyphicons-halflings-regular.ttf', {
  destDir: 'fonts/'
});
app.import('bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff', {
  destDir: 'fonts/'
});
app.import('bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff2', {
  destDir: 'fonts/'
});

app.import('bower_components/slug/slug.js');

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
