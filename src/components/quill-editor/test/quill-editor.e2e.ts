import { newE2EPage } from '@stencil/core/testing';

describe('quill-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<quill-editor></quill-editor>');

    const element = await page.find('quill-editor');
    expect(element).toHaveClass('hydrated');
  });
});
