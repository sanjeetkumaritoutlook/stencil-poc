import { newSpecPage } from '@stencil/core/testing';
import { MyNewComponent } from '../my-new-component';

describe('my-new-component', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MyNewComponent],
      html: `<my-new-component></my-new-component>`,
    });
    expect(page.root).toEqualHtml(`
      <my-new-component>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </my-new-component>
    `);
  });
});
