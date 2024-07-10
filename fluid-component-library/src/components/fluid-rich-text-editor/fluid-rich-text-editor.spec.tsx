import { newSpecPage } from '@stencil/core/testing';

import { FluidRichTextEditor } from './fluid-rich-text-editor';

describe('fluid-rich-text-editor', () => {
  let page, component;

  /************************************************************************************
   * Render tests
   ***********************************************************************************/
  describe('Basic Rich Text Editor Rendering', () => {
    beforeEach(async () => {
      page = await newSpecPage({
        components: [FluidRichTextEditor],
        html: '<div></div>',
      });
      component = page.doc.createElement('fluid-rich-text-editor');
      console.log(component);
    });

    it('should build', async () => {
      expect(1).toEqual(1);
    });
  });
});
