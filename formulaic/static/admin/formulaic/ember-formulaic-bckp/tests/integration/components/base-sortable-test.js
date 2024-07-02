import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('base-sortable', 'Integration | Component | base sortable', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{base-sortable}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#base-sortable}}
      template block text
    {{/base-sortable}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
