import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'ember-formulaic/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  rootElement= "#formulaic-container";
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
