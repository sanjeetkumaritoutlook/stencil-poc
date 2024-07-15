// Helpers

const controlName = (label) => label.replace(/ /g, '').toLowerCase();

const createField = (label, props) => ({
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
    },
  },
  fr: {
    translatable: {
      label: 'Champ Traduisible',
      placeholder: 'Regardez-moi Traduire!',
      helpText: 'Ce Champ est Traduisible !',
    },
  },
  es: {
    translatable: {
      label: 'Campo Traducible',
      placeholder: '¡Mírame Traducir!',
      helpText: '¡Este campo es Traducible!',
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

const inputFieldCollection = [
  createField('@Prop initialValue = 3 ', {
    initialValue: 3,
  }),

  createField('@Prop allowCancel = true ', {
    bordered: true,
    allowCancel: true,
  }),

  createField('@Prop iconSize = XL ', {
    iconSize: 'xl',
  }),

  createField('Input with i18n', {
    label: 'Translatable Field',
    placeholder: 'Watch me translate!',
    helpText: 'This field is translatable!',
    fluidTranslate: {
      label: 'translatable.label',
      placeholder: 'translatable.placeholder',
      helpText: 'translatable.helpText',
    },
  }),
];

// ================================================================ //
// -- Create Element Sections

createElementSection(
  'fluid-rating',
  'default-select',
  '@Prop type variants ',
  inputFieldCollection
);

// ================================================================ //
// -- Add Event Listeners

addFluidEventListener('sandbox-area', 'valueChange', (eventData) => {
  console.log('\n');
  console.log('======== FLUID Rating: Value Changed! ========');
  console.log('>> host:', eventData.target);
  console.log('## event payload:', eventData.detail);
  console.log('\n');
  printEvent('valueChange', eventData.detail);
});

// ================================================================ //
// -- Add Method Executors

addMethodExecutors(
  [{ methodName: 'myMethod', label: 'My Method', args: [] }],
  'array-property-one'
);

// ================================================================ //
// -- Add Theme Switchers

addThemeSwitchers();
