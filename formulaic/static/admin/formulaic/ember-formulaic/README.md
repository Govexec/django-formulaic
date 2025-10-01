# ember-formulaic

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [nvm](https://github.com/creationix/nvm)
* [Node.js](https://nodejs.org/) (with NPM)
* [Bower](https://bower.io/)
* [Ember CLI](https://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/) - TK: for testing

## Installation

* `nvm use`
* `npm install`
* `bower install`

## Running / Development

* `nvm use`
* `npm start` (uses the local ember-cli)

### Code Generators

Make use of the many generators for code, try `npx ember help generate` for more details (or `node ./node_modules/ember-cli/bin/ember help generate` if `npx` is not available)

### Running Tests

Prefer using the npm script so the local ember-cli is used:

* `npm test`
* `npm run test -- --server`

If you run `ember test` directly and see an error like `Error: spawn npx ENOENT`, it is because the global `ember` package is a placeholder that forwards to `npx`. Either install a Node version that includes `npx`, install `ember-cli` globally, or use the npm scripts above which always use the local ember-cli.

### Building

* `npm run build` (development)
* `npm run build -- --environment production` (production)

### Deploying

Most JavaScript changes can be deployed without any special effort.  The templates point
to `/dist/` already.  However, if you make a configuration change
(e.g. `config/environment.js`) or anything else that requires a new commit of
`app/index.html`, you may need to update the Django template
(`<formulaic-dir>/templates/admin/formulaic/form/index.html`) with the change.

## Further Reading / Useful Links

* [GEMG Wiki Entry on Dep Management](https://github.com/Govexec/ge-govexec/wiki/JavaScript-Dependency-Management)
* [ember.js](http://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
