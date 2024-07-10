// ================================================================ //
// -- Define element sets
const states = {
  AL: 'Alabama',
  AK: 'Alaska',
  AS: 'American Samoa',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District Of Columbia',
  FM: 'Federated States Of Micronesia',
  FL: 'Florida',
  GA: 'Georgia',
  GU: 'Guam',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MH: 'Marshall Islands',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  MP: 'Northern Mariana Islands',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PW: 'Palau',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VI: 'Virgin Islands',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};
const stateListOptions = Object.keys(states)
  .map((key) => ({ label: states[key], value: key }))
  .sort((a, b) => {
    return a.label < b.label ? -1 : 1;
  });
const countries = {
  BD: 'Bangladesh',
  BE: 'Belgium',
  BF: 'Burkina Faso',
  BG: 'Bulgaria',
  BA: 'Bosnia and Herzegovina',
  BB: 'Barbados',
  WF: 'Wallis and Futuna',
  BL: 'Saint Barthelemy',
  BM: 'Bermuda',
  BN: 'Brunei',
  BO: 'Bolivia',
  BH: 'Bahrain',
  BI: 'Burundi',
  BJ: 'Benin',
  BT: 'Bhutan',
  JM: 'Jamaica',
  BV: 'Bouvet Island',
  BW: 'Botswana',
  WS: 'Samoa',
  BQ: 'Bonaire, Saint Eustatius and Saba ',
  BR: 'Brazil',
  BS: 'Bahamas',
  JE: 'Jersey',
  BY: 'Belarus',
  BZ: 'Belize',
  RU: 'Russia',
  RW: 'Rwanda',
  RS: 'Serbia',
  TL: 'East Timor',
  RE: 'Reunion',
  TM: 'Turkmenistan',
  TJ: 'Tajikistan',
  RO: 'Romania',
  TK: 'Tokelau',
  GW: 'Guinea-Bissau',
  GU: 'Guam',
  GT: 'Guatemala',
  GS: 'South Georgia and the South Sandwich Islands',
  GR: 'Greece',
  GQ: 'Equatorial Guinea',
  GP: 'Guadeloupe',
  JP: 'Japan',
  GY: 'Guyana',
  GG: 'Guernsey',
  GF: 'French Guiana',
  GE: 'Georgia',
  GD: 'Grenada',
  GB: 'United Kingdom',
  GA: 'Gabon',
  SV: 'El Salvador',
  GN: 'Guinea',
  GM: 'Gambia',
  GL: 'Greenland',
  GI: 'Gibraltar',
  GH: 'Ghana',
  OM: 'Oman',
  TN: 'Tunisia',
  JO: 'Jordan',
  HR: 'Croatia',
  HT: 'Haiti',
  HU: 'Hungary',
  HK: 'Hong Kong',
  HN: 'Honduras',
  HM: 'Heard Island and McDonald Islands',
  VE: 'Venezuela',
  PR: 'Puerto Rico',
  PS: 'Palestinian Territory',
  PW: 'Palau',
  PT: 'Portugal',
  SJ: 'Svalbard and Jan Mayen',
  PY: 'Paraguay',
  IQ: 'Iraq',
  PA: 'Panama',
  PF: 'French Polynesia',
  PG: 'Papua New Guinea',
  PE: 'Peru',
  PK: 'Pakistan',
  PH: 'Philippines',
  PN: 'Pitcairn',
  PL: 'Poland',
  PM: 'Saint Pierre and Miquelon',
  ZM: 'Zambia',
  EH: 'Western Sahara',
  EE: 'Estonia',
  EG: 'Egypt',
  ZA: 'South Africa',
  EC: 'Ecuador',
  IT: 'Italy',
  VN: 'Vietnam',
  SB: 'Solomon Islands',
  ET: 'Ethiopia',
  SO: 'Somalia',
  ZW: 'Zimbabwe',
  SA: 'Saudi Arabia',
  ES: 'Spain',
  ER: 'Eritrea',
  ME: 'Montenegro',
  MD: 'Moldova',
  MG: 'Madagascar',
  MF: 'Saint Martin',
  MA: 'Morocco',
  MC: 'Monaco',
  UZ: 'Uzbekistan',
  MM: 'Myanmar',
  ML: 'Mali',
  MO: 'Macao',
  MN: 'Mongolia',
  MH: 'Marshall Islands',
  MK: 'Macedonia',
  MU: 'Mauritius',
  MT: 'Malta',
  MW: 'Malawi',
  MV: 'Maldives',
  MQ: 'Martinique',
  MP: 'Northern Mariana Islands',
  MS: 'Montserrat',
  MR: 'Mauritania',
  IM: 'Isle of Man',
  UG: 'Uganda',
  TZ: 'Tanzania',
  MY: 'Malaysia',
  MX: 'Mexico',
  IL: 'Israel',
  FR: 'France',
  IO: 'British Indian Ocean Territory',
  SH: 'Saint Helena',
  FI: 'Finland',
  FJ: 'Fiji',
  FK: 'Falkland Islands',
  FM: 'Micronesia',
  FO: 'Faroe Islands',
  NI: 'Nicaragua',
  NL: 'Netherlands',
  NO: 'Norway',
  NA: 'Namibia',
  VU: 'Vanuatu',
  NC: 'New Caledonia',
  NE: 'Niger',
  NF: 'Norfolk Island',
  NG: 'Nigeria',
  NZ: 'New Zealand',
  NP: 'Nepal',
  NR: 'Nauru',
  NU: 'Niue',
  CK: 'Cook Islands',
  XK: 'Kosovo',
  CI: 'Ivory Coast',
  CH: 'Switzerland',
  CO: 'Colombia',
  CN: 'China',
  CM: 'Cameroon',
  CL: 'Chile',
  CC: 'Cocos Islands',
  CA: 'Canada',
  CG: 'Republic of the Congo',
  CF: 'Central African Republic',
  CD: 'Democratic Republic of the Congo',
  CZ: 'Czech Republic',
  CY: 'Cyprus',
  CX: 'Christmas Island',
  CR: 'Costa Rica',
  CW: 'Curacao',
  CV: 'Cape Verde',
  CU: 'Cuba',
  SZ: 'Swaziland',
  SY: 'Syria',
  SX: 'Sint Maarten',
  KG: 'Kyrgyzstan',
  KE: 'Kenya',
  SS: 'South Sudan',
  SR: 'Suriname',
  KI: 'Kiribati',
  KH: 'Cambodia',
  KN: 'Saint Kitts and Nevis',
  KM: 'Comoros',
  ST: 'Sao Tome and Principe',
  SK: 'Slovakia',
  KR: 'South Korea',
  SI: 'Slovenia',
  KP: 'North Korea',
  KW: 'Kuwait',
  SN: 'Senegal',
  SM: 'San Marino',
  SL: 'Sierra Leone',
  SC: 'Seychelles',
  KZ: 'Kazakhstan',
  KY: 'Cayman Islands',
  SG: 'Singapore',
  SE: 'Sweden',
  SD: 'Sudan',
  DO: 'Dominican Republic',
  DM: 'Dominica',
  DJ: 'Djibouti',
  DK: 'Denmark',
  VG: 'British Virgin Islands',
  DE: 'Germany',
  YE: 'Yemen',
  DZ: 'Algeria',
  US: 'United States',
  UY: 'Uruguay',
  YT: 'Mayotte',
  UM: 'United States Minor Outlying Islands',
  LB: 'Lebanon',
  LC: 'Saint Lucia',
  LA: 'Laos',
  TV: 'Tuvalu',
  TW: 'Taiwan',
  TT: 'Trinidad and Tobago',
  TR: 'Turkey',
  LK: 'Sri Lanka',
  LI: 'Liechtenstein',
  LV: 'Latvia',
  TO: 'Tonga',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  LR: 'Liberia',
  LS: 'Lesotho',
  TH: 'Thailand',
  TF: 'French Southern Territories',
  TG: 'Togo',
  TD: 'Chad',
  TC: 'Turks and Caicos Islands',
  LY: 'Libya',
  VA: 'Vatican',
  VC: 'Saint Vincent and the Grenadines',
  AE: 'United Arab Emirates',
  AD: 'Andorra',
  AG: 'Antigua and Barbuda',
  AF: 'Afghanistan',
  AI: 'Anguilla',
  VI: 'U.S. Virgin Islands',
  IS: 'Iceland',
  IR: 'Iran',
  AM: 'Armenia',
  AL: 'Albania',
  AO: 'Angola',
  AQ: 'Antarctica',
  AS: 'American Samoa',
  AR: 'Argentina',
  AU: 'Australia',
  AT: 'Austria',
  AW: 'Aruba',
  IN: 'India',
  AX: 'Aland Islands',
  AZ: 'Azerbaijan',
  IE: 'Ireland',
  ID: 'Indonesia',
  UA: 'Ukraine',
  QA: 'Qatar',
  MZ: 'Mozambique',
};
const countryOptions = Object.keys(countries)
  .map((key) => ({ label: countries[key], value: key }))
  .sort((a, b) => {
    return a.label < b.label ? -1 : 1;
  });
const defaultValues = [
  {
    branch_name: 'St. Louis Branch',
    name_number: 2434,
    street: 'Louisville Avenue',
    town_city: 'Louisville',
    state_region: 'NC',
    postal_code: '12343-4323',
    country: 'US',
  },
  {
    branch_name: 'UK Dispatch Hub',
    name_number: 90,
    street: 'Heresmewha Street',
    town_city: 'Belfast',
    state_region: 'Down',
    postal_code: 'BT20 4DZ',
    country: 'GB',
  },
];
const addressFormConfig = {
  layout: 'horizontal',
  elements: [
    // First Row
    {
      label: 'Branch Name',
      dataPath: 'branch_name',
      elementType: 'input',
      elementWidth: 3,
      validation: [
        {
          type: 'required',
          value: true,
          message: 'This is required.',
        },
      ],
    },
    {
      label: 'Name/Number',
      dataPath: 'name_number',
      elementType: 'input',
      elementWidth: 3,
    },
    {
      label: 'Street',
      dataPath: 'street',
      elementType: 'input',
      elementWidth: 3,
    },
    {
      label: 'Town/City',
      dataPath: 'town_city',
      elementType: 'input',
      elementWidth: 3,
      fluidTranslate: {
        wrongCity: 'translatable.validation.wrongCity',
      },
    },
    // Second Row
    {
      label: 'State',
      dataPath: 'state_region',
      elementType: 'combo-box',
      elementWidth: 2,
      options: stateListOptions,
      conditionalOn: (formValue) => formValue?.country?.[0] === 'US',
      validation: [
        {
          type: 'custom',
          validatorFn: (value) => value === 'FR',
          fluidTranslate: {
            message: 'translatable.validation.wrongCity',
          },
        },
      ],
    },
    {
      label: 'Region',
      dataPath: 'state_region',
      elementType: 'input',
      elementWidth: 2,
      conditionalOn: (formValue) => formValue?.country?.[0] !== 'US',
    },
    {
      label: 'Postal Code',
      dataPath: 'postal_code',
      elementType: 'input',
      validation: [],
      dynamicConfig: (formValue) => ({
        validation:
          formValue?.country?.[0] === 'US'
            ? [
                {
                  type: 'pattern',
                  value: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
                  message: 'Zipcode must be in the format 00000 or 00000-0000',
                },
              ]
            : [],
      }),
      elementWidth: 2,
    },
    {
      label: 'Country',
      dataPath: 'country',
      elementType: 'combo-box',
      options: countryOptions,
      elementWidth: 3,
    },
    {
      label: 'Gate Code',
      dataPath: 'entry_code',
      helpText:
        'Upon entering a gate code, a gate secret is generated, and masked using a masking function on a disabled field which uses dynamicValue',
      elementType: 'input',
      type: 'number',
      elementWidth: 3,
    },
    {
      label: 'Gate Secret',
      dataPath: 'entry_secret',
      elementType: 'input',
      disabled: true,
      elementWidth: 2,
      maskingConfig: {
        maskingFn: (value) => {
          return `${value}`
            .split('')
            .map((character, idx) => (idx % 2 === 0 ? '*' : character))
            .join('');
        },
      },
      dynamicValue: (formValue) => {
        return formValue?.entry_code ? formValue?.entry_code * 3 : '';
      },
    },
  ],
};

const basicFormWithAddress = [
  {
    // disabled: true,
    config: {
      formName: 'basicFormWithAddress',
      layout: 'vertical',
      externalState: {
        expectedCity: 'Bangor',
      },
      elements: [
        {
          label: 'First Name',
          dataPath: 'firstName',
          outputFormat: {
            formatter: (value) => `First Name is: ${value}`,
            applyInline: true,
          },
        },
        {
          label: 'Surname',
          dataPath: 'surname',
          disabled: true,
          outputFormat: {
            formatter: (value) => `Surname is: ${value}`,
            applyInline: false,
          },
        },
        {
          label: 'Favourite Number',
          dataPath: 'favouriteNumber',
          updateStrategy: 'blur',
          outputFormat: {
            formatter: (value) => `Favourite Number is: ${value}`,
            applyInline: true,
          },
        },
        {
          label: 'Town/City',
          dataPath: 'town_city',
          elementType: 'input',
          elementWidth: 3,
          validation: [
            {
              id: 'wrongCity',
              type: 'custom',
              validatorFn: (value, _, externalState) => {
                return value === externalState.expectedCity;
              },
            },
          ],
          fluidTranslate: {
            validation: {
              wrongCity: 'translatable.validation.wrongCity',
            },
          },
        },
        // Second Row
        {
          label: 'State',
          dataPath: 'state_region',
          elementType: 'combo-box',
          elementWidth: 2,
          options: stateListOptions,
          validation: [
            {
              type: 'custom',
              validatorFn: (value) => value === 'FR',
              fluidTranslate: {
                message: 'translatable.validation.wrongCity',
              },
            },
          ],
        },
        {
          label: 'Favourite Colour',
          dataPath: 'favouriteColour',
          elementType: 'combo-box',
          options: [
            { label: 'Blue', value: 'blue' },
            { label: 'Red', value: 'red' },
            { label: 'Green', value: 'green' },
            { label: 'Yellow', value: 'yellow' },
          ],
        },
        {
          label: 'Date of Birth',
          dataPath: 'dob',
        },
        // Address form just needs an elementType of 'address-form' to render the pattern.
        // {
        //   dataPath: 'address',
        //   elementType: 'address-form',
        // },
      ],
      submitConfig: {
        actionText: 'risk_assessment.save',
        actionKey: 'formSubmitted',
      },
      cancelConfig: {
        actionText: 'risk_assessment.cancel',
        actionKey: 'formCancel',
        cancelReset: true,
      },
      controlsAlignment: 'right',
    },
  },
];

addSandboxI18n({
  en: {
    translatable: {
      validation: {
        wrongCity: ({ value, externalState }) =>
          `${value} is not the right answer! We expected you to choose ${externalState?.expectedCity}`,
      },
    },
  },
  fr: {
    translatable: {
      validation: {
        wrongCity: ({ value, externalState }) =>
          `${value} n'est pas la bonne réponse! Nous nous attendions à ce que vous choisissiez ${externalState?.expectedCity}`,
      },
    },
  },
  es: {
    translatable: {
      validation: {
        wrongCity: ({ value, externalState }) =>
          `${value} no es la respuesta correcta! Esperábamos que eligieras ${externalState?.expectedCity}`,
      },
    },
  },
});

// ================================================================ //
// -- Create Element Sections

// createElementSection('fluid-table', 'basic-table', "Basic Table", basicTable);
createElementSection(
  'fluid-form',
  'vertical-form',
  'Form with Locale Driven Address',
  basicFormWithAddress
);
const ctaButtons = [
  { id: 'id-button-set', color: 'primary', label: 'set hidden value' },
  { id: 'id-button-get', color: 'primary', label: 'get Form values' },
];
createElementSection('fluid-button', 'cta-button', '--', ctaButtons);

// ================================================================ //
// -- Add Event Listeners

addFluidEventListener('vertical-form', 'actionClicked', function (eventData) {
  console.log('Action Clicked', eventData.detail);
});

addFluidEventListener('vertical-form', 'formChanged', function (eventData) {
  console.log('Form Changed', eventData.detail.rawValue);
  console.log('Form Valid?', eventData.detail.valid);
  if (!eventData.detail.valid) {
    console.log('Errors', eventData.detail.errors);
  }
});

addFluidEventListener('id-button-set', 'click', function () {
  document
    .querySelector('fluid-form')
    .setElementValue('hidden-value', 'test 123');
});

addFluidEventListener('id-button-get', 'click', function () {
  const results = document.querySelector('fluid-form').getFormState();
  console.log(results);
});

// ================================================================ //
// -- Add Method Executors

addMethodExecutors(
  [
    {
      methodName: 'getFormState',
      label: 'Get Form State',
      args: [true],
      handler: (eventData) => {
        console.log('Form State:', eventData);
      },
    },
    {
      methodName: 'getElementRef',
      label: 'Get Text Input Reference',
      args: ['textInput'],
      handler: (elementRef) => {
        console.log('Got ref:', elementRef);
        console.log('About to call reset method on it alone....');
        elementRef.reset(true).then((_) => console.log('Should be reset?'));
      },
    },
    {
      methodName: 'setElementValue',
      label: 'Set single value',
      args: ['formArray', [defaultValues[1]]],
      handler: (returnVal) => console.log(returnVal),
    },
    {
      methodName: 'setElementValue',
      label: 'Set multiple values',
      args: ['formArray', defaultValues],
      handler: (returnVal) => console.log(returnVal),
    },
    {
      methodName: 'markTouchedAndValidate',
      label: 'Validate Form',
      args: [],
      handler: (returnVal) => console.log('Validating', returnVal),
    },
    {
      methodName: 'reset',
      label: 'Reset Form',
      args: [true],
      handler: (returnVal) => console.log('Resetting', returnVal),
    },
  ],
  'vertical-form'
);

// ================================================================ //
// -- Add Theme Switchers

addThemeSwitchers();
