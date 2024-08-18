//Create a mock for TinyMCE so that you don't actually initialize the editor in your tests. The mock should simulate TinyMCE's methods and events.
//https://stenciljs.com/docs/mocking
//https://stackoverflow.com/questions/52416567/how-to-handle-duplicated-manual-mock-found-in-the-project
const tinymce = {
  init: jest.fn(),
  remove: jest.fn(),
  triggerSave: jest.fn(),
  get: jest.fn().mockReturnValue({
    setContent: jest.fn(),
    getContent: jest.fn().mockReturnValue(''),
    on: jest.fn(),
    mode: {
      set: jest.fn(),
    },
  }),
};

export default tinymce;
