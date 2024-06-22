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
* `ember serve`

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests - TK

* `ember test`
* `ember test --server`

### Building - TK: I generally don't differentiate the build created by `ember serve` from `ember build`

* `ember build` (development)
* `ember build --environment production` (production)

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
