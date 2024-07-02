import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preview-phone-number', 'Integration | Component | preview phone number', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{preview-phone-number}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#preview-phone-number}}
      template block text
    {{/preview-phone-number}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
