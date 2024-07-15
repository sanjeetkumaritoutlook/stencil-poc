import { newE2EPage } from '@stencil/core/testing';

describe('fluid-combo-box', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<fluid-combo-box></fluid-combo-box>');

    const element = await page.find('fluid-combo-box');
    expect(element).toHaveClass('hydrated');
  });
});
