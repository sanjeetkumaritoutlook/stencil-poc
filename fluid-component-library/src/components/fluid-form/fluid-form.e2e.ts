import { newE2EPage } from '@stencil/core/testing';

describe('fluid-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<fluid-form></fluid-form>');

    const element = await page.find('fluid-form');
    expect(element).toHaveClass('hydrated');
  });
});
