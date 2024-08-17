import { newSpecPage } from '@stencil/core/testing';
import { CustomRtf } from '../custom-rtf';
import tinymce from './__mocks__/tinymce';    // import 'tinymce' from mock
jest.mock('tinymce');

describe('custom-rtf', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CustomRtf],
      html: `<custom-rtf></custom-rtf>`,
    });
    expect(page.root).toEqualHtml(`
      <custom-rtf>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </custom-rtf>
    `);
  });

  //-----first unit test case----//
  it('should initialize TinyMCE on component load', async () => {
    const page = await newSpecPage({
      components: [CustomRtf],
      html: `<custom-rtf initialvalue="Initial content"></custom-rtf>`,
    });

    expect(tinymce.init).toHaveBeenCalled();
    expect(tinymce.init.mock.calls[0][0].target.innerHTML).toContain('Initial content');
  });

//---2nd unit test case---//
it('should update content when value prop changes', async () => {
  const page = await newSpecPage({
    components: [CustomRtf],
    html: `<custom-rtf initialvalue="Initial content"></custom-rtf>`,
  });

  const component = page.rootInstance;

  // Simulate the TinyMCE editor being initialized
  component.editor = tinymce.get();

  component.onValueChange('New content');

  expect(component.editor.setContent).toHaveBeenCalledWith('New content');
});

//--3rd unit test case---//
it('should handle editor content change events', async () => {
  const page = await newSpecPage({
    components: [CustomRtf],
    html: `<custom-rtf></custom-rtf>`,
  });

  const component = page.rootInstance;

  // Mocking TinyMCE editor instance
  component.editor = tinymce.get();
  
  const emitSpy = jest.spyOn(component.contentChanged, 'emit');

  // Trigger change event
  component.editor.getContent.mockReturnValue('<p>Changed content</p>');
  component.editor.on.mock.calls[1][1](); // Assuming 'change' is the second event listener

  expect(emitSpy).toHaveBeenCalledWith('<p>Changed content</p>');
});

//---4th unit test case--//
it('should remove TinyMCE editor on component unload', async () => {
  const page = await newSpecPage({
    components: [CustomRtf],
    html: `<custom-rtf></custom-rtf>`,
  });

  const component = page.rootInstance;

  // Simulate component unload
  component.disconnectedCallback();

  expect(tinymce.remove).toHaveBeenCalled();
});

//----5th unit test case---//
it('should emit valueChange event on content change', async () => {
  const page = await newSpecPage({
    components: [CustomRtf],
    html: `<custom-rtf></custom-rtf>`,
  });

  const component = page.rootInstance;

  // Mocking TinyMCE editor instance
  component.editor = tinymce.get();
  
  const emitSpy = jest.spyOn(component.valueChange, 'emit');

  // Simulate a content change
  component.editor.getContent.mockReturnValue('Updated content');
  component.editor.on.mock.calls[0][1](); // Assuming 'change keyup' is the first event listener

  expect(emitSpy).toHaveBeenCalledWith('Updated content');
});

//----6th unit test case----//
it('should set TinyMCE editor to readonly mode when disabled', async () => {
  const page = await newSpecPage({
    components: [CustomRtf],
    html: `<custom-rtf disabled></custom-rtf>`,
  });

  const component = page.rootInstance;

  // Simulate the TinyMCE editor being initialized
  component.editor = tinymce.get();

  expect(component.editor.mode.set).toHaveBeenCalledWith('readonly');
});

});
