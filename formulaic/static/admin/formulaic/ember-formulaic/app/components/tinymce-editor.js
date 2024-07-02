import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TinymceEditorComponent extends Component {
  editor = null;

  @action
  setupEditor(element) {
    const options = {
      target: element,
      ...this.args.options,
      setup: (editor) => {
        this.editor = editor;
        editor.on('Change', () => {
          if (this.args.onChange) {
            this.args.onChange(editor.getContent());
          }
        });
      },
    };

    tinymce.init(options);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.editor) {
      tinymce.remove(this.editor); // Use tinymce.remove to clean up the editor
    }
  }
}
