import { newSpecPage } from '@stencil/core/testing';
import { RichTextEditor } from '../rich-text-editor';

describe('rich-text-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [RichTextEditor],
      html: `<rich-text-editor></rich-text-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <rich-text-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </rich-text-editor>
    `);
  });
});
