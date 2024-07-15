// Helpers

const controlName = (label) => label.replace(/ /g, '').toLowerCase();

const createComboBox = (label, props) => ({
  id: controlName(label),
  controlName: controlName(label),
  label,
  ...props,
});

// ================================================================ //
// -- Add Translations

const i18nProvider = () => document.querySelector('fluid-i18n-provider');

i18nProvider().translations = {
  en: {
    translatable: {
      label: 'Translatable Field',
      placeholder: 'Watch me translate!',
      helpText: 'This field is translatable!',
      emptyListMessage: 'This empty list message is translatable',
      options: {
        option_one: 'Option One',
        option_two: 'Option Two',
        option_three: 'Option Three',
        option_four: 'Option Four',
      },
      validation: {
        wrongAnswer: ({ value }) => `${value} is not the right answer!`,
      },
    },
  },
  fr: {
    translatable: {
      label: 'Champ Traduisible',
      placeholder: 'Regardez-moi Traduire!',
      helpText: 'Ce Champ est Traduisible !',
      emptyListMessage: 'Ce message de liste vide est traduisible',
      options: {
        option_one: 'Première Option',
        option_two: 'Deuxième Option',
        option_three: 'Troisième Option',
        option_four: 'Option Quatre',
      },
      validation: {
        wrongAnswer: ({ value }) => `${value} n'est pas la bonne réponse!`,
      },
    },
  },
  es: {
    translatable: {
      label: 'Campo Traducible',
      placeholder: '¡Mírame Traducir!',
      helpText: '¡Este campo es Traducible!',
      emptyListMessage: 'Este mensaje de lista vacía es traducible',
      options: {
        option_one: 'Opción Uno',
        option_two: 'Opción Dos',
        option_three: 'Opción Tres',
        option_four: 'Opción Cuatro',
      },
      validation: {
        wrongAnswer: ({ value }) => `${value} no es la respuesta correcta!`,
      },
    },
  },
};

['en', 'fr', 'es'].forEach((lang) => {
  const button = document.getElementById(lang);
  button.addEventListener('click', () => {
    console.log('Setting language', lang);
    i18nProvider().language = lang;
  });
});

// ================================================================ //
// -- Define element sets

const basicSelect = [
  createComboBox('Default', {
    options: [
      { label: 'Option 1', value: 'option_one' },
      { label: 'Option 2', value: 'option_two' },
      { label: 'Option 3', value: 'option_three' },
      { label: 'Option 4', value: 'option_four' },
    ],
  }),
];

const groupedSelect = [
  createComboBox('Grouped', {
    options: [
      { label: 'Option one', value: 'option_one', group: { label: 'One' } },
      { label: 'Option two', value: 'option_two', group: { label: 'One' } },
      { label: 'Option three', value: 'option_three', group: { label: 'One' } },
      { label: 'Option four', value: 'option_four', group: { label: 'Two' } },
      { label: 'Option five', value: 'option_five', group: { label: 'Two' } },
      { label: 'Option six', value: 'option_six', group: { label: 'Two' } },
      { label: 'OneOneOne', value: 'OneOneOne' },
      { label: 'twotwotwo', value: 'twotwotwo' },
      { label: 'threethreethree', value: 'threethreethree' },
      { label: 'Onetwothree', value: 'Onetwothree' },
      { label: 'test-two', value: 'test-two' },
    ],
  }),
];

const i18nOptionStrategyEmptyMessage = [
  createComboBox('Datepicker with i18n - option based translation strategy', {
    label: 'Translatable Field',
    placeholder: 'Watch me translate!',
    helpText: 'This field is translatable!',
    emptyListMessage: 'This empty list message is translatable',
    fluidTranslate: {
      label: 'translatable.label',
      placeholder: 'translatable.placeholder',
      helpText: 'translatable.helpText',
      emptyListMessage: 'translatable.emptyListMessage',
    },
    options: [
      {
        label: 'Option 1',
        value: 'option_one',
        fluidTranslate: { label: 'translatable.options.option_one' },
      },
      {
        label: 'Option 2',
        value: 'option_two',
        fluidTranslate: { label: 'translatable.options.option_two' },
      },
      {
        label: 'Option 3',
        value: 'option_three',
        fluidTranslate: { label: 'translatable.options.option_three' },
      },
      {
        label: 'Option 4',
        value: 'option_four',
        fluidTranslate: { label: 'translatable.options.option_four' },
      },
    ],
  }),
];

const i18nOptionStrategy = [
  createComboBox('Datepicker with i18n - option based translation strategy', {
    label: 'Translatable Field',
    placeholder: 'Watch me translate!',
    helpText: 'This field is translatable!',
    fluidTranslate: {
      label: 'translatable.label',
      placeholder: 'translatable.placeholder',
      helpText: 'translatable.helpText',
    },
    options: [
      {
        label: 'Option 1',
        value: 'option_one',
        fluidTranslate: { label: 'translatable.options.option_one' },
      },
      {
        label: 'Option 2',
        value: 'option_two',
        fluidTranslate: { label: 'translatable.options.option_two' },
      },
      {
        label: 'Option 3',
        value: 'option_three',
        fluidTranslate: { label: 'translatable.options.option_three' },
      },
      {
        label: 'Option 4',
        value: 'option_four',
        fluidTranslate: { label: 'translatable.options.option_four' },
      },
    ],
  }),
];

const i18nValueStrategy = [
  createComboBox('Datepicker with i18n - value map translation strategy', {
    label: 'Translatable Field',
    placeholder: 'Watch me translate!',
    helpText: 'This field is translatable!',
    fluidTranslate: {
      label: 'translatable.label',
      placeholder: 'translatable.placeholder',
      helpText: 'translatable.helpText',
      options: {
        option_one: 'translatable.options.option_one',
        option_two: 'translatable.options.option_two',
        option_three: 'translatable.options.option_three',
        option_four: 'translatable.options.option_four',
      },
    },
    options: [
      { label: 'Option 1', value: 'option_one' },
      { label: 'Option 2', value: 'option_two' },
      { label: 'Option 3', value: 'option_three' },
      { label: 'Option 4', value: 'option_four' },
    ],
  }),
];

const i18nValidation_TranslateStrategy = [
  createComboBox('Datepicker with i18n - value map translation strategy', {
    label: 'Translatable Field',
    placeholder: 'Watch me translate!',
    helpText: 'This field is translatable!',
    validation: [
      {
        id: 'wrongAnswer',
        type: 'custom',
        validatorFn: (value) => value === ['option_two'],
      },
    ],
    fluidTranslate: {
      label: 'translatable.label',
      placeholder: 'translatable.placeholder',
      helpText: 'translatable.helpText',
      options: {
        option_one: 'translatable.options.option_one',
        option_two: 'translatable.options.option_two',
        option_three: 'translatable.options.option_three',
        option_four: 'translatable.options.option_four',
      },
      validation: {
        wrongAnswer: 'translatable.validation.wrongAnswer',
      },
    },
    options: [
      { label: 'Option 1', value: 'option_one' },
      { label: 'Option 2', value: 'option_two' },
      { label: 'Option 3', value: 'option_three' },
      { label: 'Option 4', value: 'option_four' },
    ],
  }),
];

const i18nValidation_ValidatorStrategy = [
  createComboBox('Datepicker with i18n - value map translation strategy', {
    label: 'Translatable Field',
    placeholder: 'Watch me translate!',
    helpText: 'This field is translatable!',
    validation: [
      {
        type: 'custom',
        validatorFn: (value) => value === ['option_two'],
        fluidTranslate: {
          message: 'translatable.validation.wrongAnswer',
        },
      },
    ],
    fluidTranslate: {
      label: 'translatable.label',
      placeholder: 'translatable.placeholder',
      helpText: 'translatable.helpText',
      options: {
        option_one: 'translatable.options.option_one',
        option_two: 'translatable.options.option_two',
        option_three: 'translatable.options.option_three',
        option_four: 'translatable.options.option_four',
      },
    },
    options: [
      { label: 'Option 1', value: 'option_one' },
      { label: 'Option 2', value: 'option_two' },
      { label: 'Option 3', value: 'option_three' },
      { label: 'Option 4', value: 'option_four' },
    ],
  }),
];

const asyncSelect = [
  createComboBox('Async', {
    options: [],
    optionLookup: {
      debounceTime: 1000,
      lookup: (activeQuery, setOptions) => {
        fetch('https://jsonplaceholder.typicode.com/users')
          .then((response) => response.json())
          .then((results) => {
            const filtered = results.filter((result) => {
              return (
                result.username
                  .toLowerCase()
                  .indexOf(activeQuery.toLowerCase()) !== -1
              );
            });
            const newOptions = filtered.map((user) => ({
              label: user.name,
              value: user.username,
            }));
            setOptions(newOptions);
          });
      },
    },
  }),
];

const basicSelectHelpTextAsString = [
  createComboBox('Default', {
    options: [
      { label: 'Option 1', value: 'option_one' },
      { label: 'Option 2', value: 'option_two' },
      { label: 'Option 3', value: 'option_three' },
      { label: 'Option 4', value: 'option_four' },
    ],
    helpText: 'This is a help text',
  }),
];

const basicSelectHelpTextAsObject = [
  createComboBox('Default', {
    options: [
      { label: 'Option 1', value: 'option_one' },
      { label: 'Option 2', value: 'option_two' },
      { label: 'Option 3', value: 'option_three' },
      { label: 'Option 4', value: 'option_four' },
    ],
    helpText: {
      header: 'Custom header',
      message: 'this is a message set on config',
    },
  }),
];

// ================================================================ //
// -- Create Element Sections

const toMulti = (group, retainSelections) =>
  group.map((c) => ({
    ...c,
    optionLookup: retainSelections
      ? {
          ...c.optionLookup,
          retainSelections: true,
        }
      : c.optionLookup,
    multiSelect: true,
    id: c.id + '_multi' + (retainSelections ? '_retained' : ''),
  }));

const withProps = (elementSet, props) => [
  {
    ...elementSet[0],
    ...props,
  },
];

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue (single)',
  withProps(asyncSelect, { initialValue: 'Bret' })
);

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue as array (single)',
  withProps(asyncSelect, { initialValue: ['Bret'] })
);

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue (multi)',
  toMulti(withProps(asyncSelect, { initialValue: 'Bret' }))
);

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue as array (multi)',
  toMulti(withProps(asyncSelect, { initialValue: ['Bret'] }))
);

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue (multi - with retain)',
  toMulti(withProps(asyncSelect, { initialValue: 'Bret' }), true)
);

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue as array (multi - with retain)',
  toMulti(withProps(asyncSelect, { initialValue: ['Bret'] }), true)
);

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue - multiple initial values (multi - with retain)',
  toMulti(withProps(asyncSelect, { initialValue: ['Bret', 'Kamren'] }), true)
);

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue - multiple initial values with one invalid (multi - with retain)',
  toMulti(
    withProps(asyncSelect, { initialValue: ['Bret', 'Invalid Option'] }),
    true
  )
);

createElementSection(
  'fluid-combo-box',
  'async-with-initial',
  'Async Options with initialValue - multiple initial values with one invalid but custom allowed (multi - with retain)',
  toMulti(
    withProps(asyncSelect, {
      initialValue: ['Bret', 'Invalid Option'],
      allowCustomInput: true,
    }),
    true
  )
);

createElementSection(
  'fluid-combo-box',
  'default-select',
  'Basic Select with help text `string`',
  basicSelectHelpTextAsString
);
createElementSection(
  'fluid-combo-box',
  'default-select',
  'Basic Select with help text `object`',
  basicSelectHelpTextAsObject
);
createElementSection(
  'fluid-combo-box',
  'default-select',
  'Basic Select',
  basicSelect
);
createElementSection(
  'fluid-combo-box',
  'default-multiple',
  'Basic Multi-Select',
  toMulti(basicSelect)
);
createElementSection(
  'fluid-combo-box',
  'grouped-select',
  'Grouped Select',
  groupedSelect
);
createElementSection(
  'fluid-combo-box',
  'grouped-multiple',
  'Grouped Multi-Select',
  toMulti(groupedSelect)
);
createElementSection(
  'fluid-combo-box',
  'async-single',
  'Async Options Select',
  asyncSelect
);
createElementSection(
  'fluid-combo-box',
  'async-multi',
  'Async Options Multi-Select',
  toMulti(asyncSelect)
);
createElementSection(
  'fluid-combo-box',
  'async-multi',
  'Async Options Multi-Select (retain selections)',
  toMulti(asyncSelect, true)
);
createElementSection(
  'fluid-combo-box',
  'emptyListMessage',
  'Custom emptyListMessage',
  withProps(basicSelect, {
    emptyListMessage: 'Custom empty list message',
    placeholder: "Type 'a' to see custom empty list message",
  })
);

createElementSection(
  'fluid-combo-box',
  'i18n-option-strategy-with-translated-message',
  'i18n-Enabled Combobox - With translated empty state message.',
  i18nOptionStrategyEmptyMessage
);

createElementSection(
  'fluid-combo-box',
  'i18n-option-strategy',
  'i18n-Enabled Combobox - Single Selection - Option Based Strategy',
  i18nOptionStrategy
);

createElementSection(
  'fluid-combo-box',
  'i18n-option-strategy-multi',
  'i18n-Enabled Combobox - Multi Selection - Option Based Strategy',
  toMulti(i18nOptionStrategy)
);

createElementSection(
  'fluid-combo-box',
  'i18n-value-strategy',
  'i18n-Enabled Combobox - Single Selection - Value Based Strategy',
  i18nValueStrategy
);

createElementSection(
  'fluid-combo-box',
  'i18n-value-strategy-multi',
  'i18n-Enabled Combobox - Multi Selection - Value Based Strategy',
  toMulti(i18nValueStrategy)
);

createElementSection(
  'fluid-combo-box',
  'i18n-validation-translate-strategy',
  'i18n-Enabled Combobox - Validation - Translate Based Strategy',
  toMulti(i18nValidation_TranslateStrategy)
);

createElementSection(
  'fluid-combo-box',
  'i18n-validation-translate-strategy',
  'i18n-Enabled Combobox - Validation - Validator Based Strategy',
  toMulti(i18nValidation_ValidatorStrategy)
);

// ================================================================ //
// -- Add Event Listeners

addFluidEventListener('default', 'valueChange', function (eventData) {
  printEvent('valueChanged', eventData.detail);
});

addFluidEventListener('grouped', 'valueChange', function (eventData) {
  printEvent('valueChanged', eventData.detail);
});

addFluidEventListener('async_multi', 'valueChange', function (eventData) {
  printEvent('valueChanged', eventData.detail);
});

addFluidEventListener(
  'async_multi_retained',
  'valueChange',
  function (eventData) {
    printEvent('valueChanged', eventData.detail);
  }
);

// ================================================================ //
// -- Add Method Executors

// addMethodExecutors([
//   { methodName: 'toggleAll', label: 'Select All', args: [true], },
// ], 'checkbox');

// ================================================================ //
// -- Add Theme Switchers

addThemeSwitchers();
