'use strict';

define("ember-formulaic/tests/helpers/destroy-app", ["exports", "@ember/runloop"], function (_exports, _runloop) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = destroyApp;
  0; //eaimeta@70e063a35619d71f0,"@ember/runloop"eaimeta@70e063a35619d71f
  function destroyApp(application) {
    (0, _runloop.run)(application, 'destroy');
  }
});
define("ember-formulaic/tests/helpers/index", ["exports", "ember-qunit"], function (_exports, _emberQunit) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setupApplicationTest = setupApplicationTest;
  _exports.setupRenderingTest = setupRenderingTest;
  _exports.setupTest = setupTest;
  0; //eaimeta@70e063a35619d71f0,"ember-qunit"eaimeta@70e063a35619d71f
  // This file exists to provide wrappers around ember-qunit's
  // test setup functions. This way, you can easily extend the setup that is
  // needed per test type.

  function setupApplicationTest(hooks, options) {
    (0, _emberQunit.setupApplicationTest)(hooks, options);

    // Additional setup for application tests can be done here.
    //
    // For example, if you need an authenticated session for each
    // application test, you could do:
    //
    // hooks.beforeEach(async function () {
    //   await authenticateSession(); // ember-simple-auth
    // });
    //
    // This is also a good place to call test setup functions coming
    // from other addons:
    //
    // setupIntl(hooks); // ember-intl
    // setupMirage(hooks); // ember-cli-mirage
  }
  function setupRenderingTest(hooks, options) {
    (0, _emberQunit.setupRenderingTest)(hooks, options);

    // Additional setup for rendering tests can be done here.
  }
  function setupTest(hooks, options) {
    (0, _emberQunit.setupTest)(hooks, options);

    // Additional setup for unit tests can be done here.
  }
});
define("ember-formulaic/tests/helpers/module-for-acceptance", ["exports", "rsvp", "qunit", "ember-formulaic/tests/helpers/start-app", "ember-formulaic/tests/helpers/destroy-app"], function (_exports, _rsvp, _qunit, _startApp, _destroyApp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _default;
  0; //eaimeta@70e063a35619d71f0,"rsvp",0,"qunit",0,"ember-formulaic/tests/helpers/start-app",0,"ember-formulaic/tests/helpers/destroy-app"eaimeta@70e063a35619d71f
  function _default(name, options = {}) {
    (0, _qunit.module)(name, {
      beforeEach() {
        this.application = (0, _startApp.default)();
        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },
      afterEach() {
        let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return _rsvp.Promise.resolve(afterEach).then(() => (0, _destroyApp.default)(this.application));
      }
    });
  }
});
define("ember-formulaic/tests/helpers/resolver", ["exports", "ember-formulaic/resolver", "ember-formulaic/config/environment"], function (_exports, _resolver, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  0; //eaimeta@70e063a35619d71f0,"ember-formulaic/resolver",0,"ember-formulaic/config/environment"eaimeta@70e063a35619d71f
  const resolver = _resolver.default.create();
  resolver.namespace = {
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix
  };
  var _default = _exports.default = resolver;
});
define("ember-formulaic/tests/helpers/start-app", ["exports", "@ember/runloop", "@ember/polyfills", "ember-formulaic/app", "ember-formulaic/config/environment"], function (_exports, _runloop, _polyfills, _app, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = startApp;
  0; //eaimeta@70e063a35619d71f0,"@ember/runloop",0,"@ember/polyfills",0,"ember-formulaic/app",0,"ember-formulaic/config/environment"eaimeta@70e063a35619d71f
  function startApp(attrs) {
    let attributes = (0, _polyfills.merge)({}, _environment.default.APP);
    attributes = (0, _polyfills.merge)(attributes, attrs); // use defaults, but you can override;

    return (0, _runloop.run)(() => {
      let application = _app.default.create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
      return application;
    });
  }
});
define("ember-formulaic/tests/integration/components/sidebar-test", ["qunit", "ember-formulaic/tests/helpers", "@ember/test-helpers", "@ember/template-factory"], function (_qunit, _helpers, _testHelpers, _templateFactory) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"qunit",0,"ember-formulaic/tests/helpers",0,"@ember/test-helpers",0,"@ember/template-factory"eaimeta@70e063a35619d71f
  (0, _qunit.module)('Integration | Component | sidebar', function (hooks) {
    (0, _helpers.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        <Sidebar />
      */
      {
        "id": "1gEHp0yN",
        "block": "[[[8,[39,0],null,null,null]],[],false,[\"sidebar\"]]",
        "moduleName": "/Users/ronnieodima/PycharmProjects/formulaic/django-formulaic/formulaic/static/admin/formulaic/ember-formulaic/ember-formulaic/tests/integration/components/sidebar-test.js",
        "isStrictMode": false
      }));
      assert.dom().hasText('');

      // Template block usage:
      await (0, _testHelpers.render)((0, _templateFactory.createTemplateFactory)(
      /*
        
            <Sidebar>
              template block text
            </Sidebar>
          
      */
      {
        "id": "Njbqm4SP",
        "block": "[[[1,\"\\n      \"],[8,[39,0],null,null,[[\"default\"],[[[[1,\"\\n        template block text\\n      \"]],[]]]]],[1,\"\\n    \"]],[],false,[\"sidebar\"]]",
        "moduleName": "/Users/ronnieodima/PycharmProjects/formulaic/django-formulaic/formulaic/static/admin/formulaic/ember-formulaic/ember-formulaic/tests/integration/components/sidebar-test.js",
        "isStrictMode": false
      }));
      assert.dom().hasText('template block text');
    });
  });
});
define("ember-formulaic/tests/test-helper", ["ember-formulaic/app", "ember-formulaic/config/environment", "qunit", "@ember/test-helpers", "qunit-dom", "ember-qunit"], function (_app, _environment, QUnit, _testHelpers, _qunitDom, _emberQunit) {
  "use strict";

  0; //eaimeta@70e063a35619d71f0,"ember-formulaic/app",0,"ember-formulaic/config/environment",0,"qunit",0,"@ember/test-helpers",0,"qunit-dom",0,"ember-qunit"eaimeta@70e063a35619d71f
  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));
  (0, _qunitDom.setup)(QUnit.assert);
  (0, _emberQunit.start)();
});
define('ember-formulaic/config/environment', [], function() {
  var prefix = 'ember-formulaic';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('ember-formulaic/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
