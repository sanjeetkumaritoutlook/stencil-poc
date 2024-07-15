const fluidRatingIconSizeOptions = [
  {
    label: 'sm',
    value: 'sm',
  },
  {
    label: 'md',
    value: 'md',
    selected: true,
  },
  {
    label: 'lg',
    value: 'lg',
  },
  {
    label: 'xl',
    value: 'xl',
  },
];

const fluidRatingIconLenghtOptions = [
  {
    label: '3',
    value: '3',
  },
  {
    label: '5',
    value: '5',
    selected: true,
  },
  {
    label: '10',
    value: '10',
  },
];
const rating_toggles = [
  { property: 'bordered', label: 'Bordered', type: 'toggle' },
  { property: 'allowCancel', label: 'AllowCancel', type: 'toggle' },
  { property: 'disabled', label: 'Disabled', type: 'toggle' },
  { property: 'readonly', label: 'Readonly', type: 'toggle' },

  {
    property: 'iconSize',
    label: 'Icon Size',
    type: 'combo-box',
    options: fluidRatingIconSizeOptions,
  },
  {
    property: 'max',
    label: 'Max',
    type: 'combo-box',
    options: fluidRatingIconLenghtOptions,
  },
];

module.exports = [
  {
    name: 'Initial value',
    props: { initialValue: 2.5 },
  },

  {
    name: 'Allow cancel & bordered property',
    props: {
      initialValue: 5,
      allowCancel: true,
      bordered: true,
      label: 'Allow cancel & bordered property',
    },
  },

  {
    name: 'Explore icon size, max, bordered, allow cancel, disabled and readonly properties',
    props: {},
    toggles: rating_toggles,
  },
];
