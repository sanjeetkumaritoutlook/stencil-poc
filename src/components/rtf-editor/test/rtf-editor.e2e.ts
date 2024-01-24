import { newE2EPage } from '@stencil/core/testing';

describe('rtf-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<rtf-editor></rtf-editor>');

    const element = await page.find('rtf-editor');
    expect(element).toHaveClass('hydrated');
  });
});
