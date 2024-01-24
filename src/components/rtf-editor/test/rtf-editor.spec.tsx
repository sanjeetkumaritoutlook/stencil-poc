import { newSpecPage } from '@stencil/core/testing';
import { RtfEditor } from '../rtf-editor';

describe('rtf-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [RtfEditor],
      html: `<rtf-editor></rtf-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <rtf-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </rtf-editor>
    `);
  });
});
