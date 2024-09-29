import { newE2EPage } from '@stencil/core/testing';

describe('rich-text-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<rich-text-editor></rich-text-editor>');

    const element = await page.find('rich-text-editor');
    expect(element).toHaveClass('hydrated');
  });
});
