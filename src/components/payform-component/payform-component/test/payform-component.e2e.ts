import { newE2EPage } from '@stencil/core/testing';

describe('payform-component', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<payform-component></payform-component>');

    const element = await page.find('payform-component');
    expect(element).toHaveClass('hydrated');
  });
});
