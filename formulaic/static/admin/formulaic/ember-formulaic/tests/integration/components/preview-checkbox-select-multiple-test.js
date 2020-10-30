import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('preview-checkbox-select-multiple', 'Integration | Component | preview checkbox select multiple', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{preview-checkbox-select-multiple}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#preview-checkbox-select-multiple}}
      template block text
    {{/preview-checkbox-select-multiple}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
