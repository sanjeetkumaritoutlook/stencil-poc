import { newE2EPage } from '@stencil/core/testing';

describe('custom-rtf', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<custom-rtf></custom-rtf>');

    const element = await page.find('custom-rtf');
    expect(element).toHaveClass('hydrated');
  });
});
