//Create a mock for TinyMCE so that you don't actually initialize the editor in your tests. The mock should simulate TinyMCE's methods and events.
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
