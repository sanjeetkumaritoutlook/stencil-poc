import { newE2EPage } from '@stencil/core/testing';

describe('fluid-rich-text-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<fluid-rich-text-editor></fluid-rich-text-editor>');

    const element = await page.find('fluid-rich-text-editor');
    expect(element).toHaveClass('hydrated');
  });
});
