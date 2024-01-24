import { newE2EPage } from '@stencil/core/testing';

describe('my-new-component', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<my-new-component></my-new-component>');

    const element = await page.find('my-new-component');
    expect(element).toHaveClass('hydrated');
  });
});
