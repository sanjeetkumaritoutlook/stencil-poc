import { newSpecPage } from '@stencil/core/testing';
import { QuillEditor } from '../quill-editor';

describe('quill-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [QuillEditor],
      html: `<quill-editor></quill-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <quill-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </quill-editor>
    `);
  });
});
