import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-formulaic/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | sidebar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Sidebar />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <Sidebar>
        template block text
      </Sidebar>
    `);

    assert.dom().hasText('template block text');
  });
});
