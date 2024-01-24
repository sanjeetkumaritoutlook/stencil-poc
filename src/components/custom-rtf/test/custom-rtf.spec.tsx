import { newSpecPage } from '@stencil/core/testing';
import { CustomRtf } from '../custom-rtf';

describe('custom-rtf', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CustomRtf],
      html: `<custom-rtf></custom-rtf>`,
    });
    expect(page.root).toEqualHtml(`
      <custom-rtf>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </custom-rtf>
    `);
  });
});
