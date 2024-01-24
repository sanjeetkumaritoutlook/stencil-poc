import { newSpecPage } from '@stencil/core/testing';
import { PayformComponent } from '../payform-component';

describe('payform-component', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PayformComponent],
      html: `<payform-component></payform-component>`,
    });
    expect(page.root).toEqualHtml(`
      <payform-component>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </payform-component>
    `);
  });
});
