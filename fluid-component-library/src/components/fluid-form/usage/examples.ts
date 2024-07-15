const elementWidth = 4;
const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1);

const complexElemenTypes = ['radio-group', 'array', 'hidden', 'address-form'];

const all_element_types = [
  'input',
  'currency',
  'textarea',
  'date',
  'radio-group',
  'toggle',
  'select',
  'array',
  'combo-box',
  'hidden',
  'address-form',
  'rating',
];

const _getFromData = (
  _date = new Date().toISOString().split('T')[0],
  _number = 2,
  _text = 'Test 1',
  _b = false,
  _option = 'united'
) => {
  const _fromData = {};
  all_element_types
    .filter((el) => {
      return !complexElemenTypes.includes(el);
    })
    .forEach((i) => {
      switch (i) {
        case 'currency':
        case 'rating':
          _fromData[i] = _number;
          break;
        case 'date':
          _fromData[i] = _date;
          break;
        case 'toggle':
          _fromData[i] = _b;
          break;
        case 'combo-box':
        case 'select':
          _fromData[i] = _option;
          break;
        default:
          _fromData[i] = _text ? _text : i;
      }
    });

  return _fromData;
};

const _options = [
  {
    label: 'Inception',
    value: 'inception',
  },
  {
    label: 'United',
    value: 'united',
  },
  {
    label: 'Shutter Island',
    value: 'shutter-island',
  },
  {
    label: 'Perfect Host, The',
    value: 'perfect-host',
  },
  {
    label: 'Star Wars: Episode IV - A New Hope',
    value: 'star-wars-episode-iv',
  },
  {
    label: 'Star Wars: Episode V - The Empire Strikes Back',
    value: 'star-wars-episode-v',
  },
  {
    label: 'Star Wars: Episode VI - Return of the Jedi',
    value: 'star-wars-episode-vi',
  },
  {
    label:
      'Dr. Strangelove Or: How I Learned To Stop Worrying And Love The Bomb',
    value: 'dr-strangelove',
  },
  {
    label: 'Olympus Has Fallen',
    value: 'olympus-has-fallen',
  },
  {
    label: "Don't Look in the Basement!",
    value: 'dont-look-in-the-basement',
  },
  {
    label: 'What About Bob?',
    value: 'what-about-bob',
  },
  {
    label: 'Casablanca',
    value: 'casablanca',
  },
  {
    label: 'Transformers: Dark of the Moon',
    value: 'transformers-dark-of-the-moon',
  },
  {
    label: 'V/H/S',
    value: 'vhs',
  },
  {
    label: 'Extremely Loud & Incredibly Close',
    value: 'extremely-loud-incredibly-close',
  },
  {
    label: '1984 (Nineteen Eighty-Four)',
    value: '1984',
  },
];

const _fromDataOptions = [
  { label: 'Empty', value: {} },
  { label: 'Test 1', value: _getFromData() },
  {
    label: 'Test 2',
    value: _getFromData('2024-01-01', 3, 'Test 2', true, '1984'),
  },
];

const elements = [
  {
    dataPath: 'textInput',
    label: 'My Text Input',
    type: 'input',
  },
  {
    dataPath: 'currencyInput',
    label: 'My Currency Input',
    type: 'currency',
  },

  {
    dataPath: 'numberInput',
    label: 'My Number Input',
    type: 'number',
  },
  {
    dataPath: 'dateInput',
    label: 'My Date Input',
    elementType: 'date',
  },
];

const submitConfig = {
  actionText: 'Save',
  actionKey: 'formSubmitted',
};

const cancelConfig = {
  actionText: 'Cancel',
  actionKey: 'formCancelled',
  displayDialogBeforeAction: true,
};

const validation = [
  {
    type: 'required',
    value: true,
    message: 'This is a required field.',
  },
];

const formConfig = {
  elements,
};

const formConfigForConfirmationDialog = {
  elements,
  submitConfig,
  cancelConfig,
};

const disableForm = {
  elements: all_element_types
    .filter((el) => {
      return !complexElemenTypes.includes(el);
    })
    .map((i) => {
      switch (i) {
        case 'combo-box':
        case 'select':
          return {
            elementType: i,
            label: `${capitalize(i)}:`,
            dataPath: i,
            options: _options,
          };

        default:
          return {
            elementType: i,
            label: `${capitalize(i)}:`,
            dataPath: i,
          };
      }
    }),
};

const formValidation = {
  elements: [
    {
      label: 'First name',
      type: 'text',
      dataPath: 'firstName',
      validation,
    },
    {
      label: 'Middle name',
      type: 'text',
      dataPath: 'middleName',
      validation,
    },
    {
      label: 'Last name',
      type: 'text',
      dataPath: 'lastName',
      validation,
    },
  ],
  submitConfig,
};

const formHorizontalLayout = {
  layout: 'horizontal',
  elements: [
    {
      label: 'First name',
      type: 'text',
      elementWidth,
      dataPath: 'firstName',
      validation,
    },
    {
      label: 'Middle name',
      type: 'text',
      elementWidth,
      dataPath: 'middleName',
      validation,
    },
    {
      label: 'Last name',
      type: 'text',
      elementWidth,
      dataPath: 'lastName',
      validation,
    },
  ],
  submitConfig: {
    actionText: 'Save',
    actionKey: 'formSubmitted',
  },
};

module.exports = [
  {
    name: 'Using Elements',
    props: {
      config: formConfig,
    },
    events: [{ eventKey: 'valueChange' }, { eventKey: 'formChanged' }],
  },
  {
    name: 'Horizontal Layout',
    props: {
      config: formHorizontalLayout,
    },
  },
  {
    name: 'Validation',
    props: {
      config: formValidation,
    },
  },

  {
    name: 'Confirmation Dialog for the Cancel Button',
    props: {
      config: formConfigForConfirmationDialog,
    },
  },
  {
    name: 'Disable Form',
    props: {
      config: disableForm,
    },
    toggles: [
      {
        property: 'disabled',
        label: 'Disabled',
        type: 'toggle',
      },
    ],
  },
  {
    name: 'Using `fromData` property',
    props: {
      config: disableForm,
    },
    toggles: [
      {
        property: 'fromData',
        label: 'Change `fromData` property',
        type: 'combo-box',
        options: _fromDataOptions,
      },
    ],
  },
];
