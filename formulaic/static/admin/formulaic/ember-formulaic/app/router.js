import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
    this.route('form', { 
        path: '/:form_id/'
    }, function() {
        this.route('fields', function() {
            //this.route('field', { path: '/fields/:field_id' });
        });
        this.route('rules');
        this.route('submissions');
    });
});

// var Router = Ember.Router.extend({
//   location: config.locationType // ???
// });

// Router.map(function() {
//     this.resource('form', { path: '/:form_id/' }, function() {
//         this.route('edit');
//         this.resource('fields', function() {
//             //this.route('field', { path: '/fields/:field_id' });
//         });
//         this.resource('rules', function() {

//         });
//         this.resource('submissions', function() {

//         });
//     });
    
// });

export default Router;
