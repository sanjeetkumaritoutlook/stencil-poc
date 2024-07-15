const content =
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. ' +
  "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to " +
  'make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.';

module.exports = [
  {
    name: 'Basic Section Detail - Legacy theme',
    element: `<fluid-section-detail theme="theme" overrideGlobalTheme="overrideGlobalTheme" sectionTitle="sectionTitle"></fluid-section-detail>`,
    props: {
      theme: 'legacy',
      overrideGlobalTheme: true,
      sectionTitle: 'My Legacy Section',
    },
    content,
  },
  {
    name: 'Basic Section Detail - LM Property theme',
    element: `<fluid-section-detail theme="theme" overrideGlobalTheme="overrideGlobalTheme" sectionTitle="sectionTitle"></fluid-section-detail>`,
    props: {
      theme: 'lm',
      overrideGlobalTheme: true,
      sectionTitle: 'My LM Property Section',
    },
    content,
  },
  {
    name: 'Basic Section Detail - Corporate theme',
    element: `<fluid-section-detail theme="theme" overrideGlobalTheme="overrideGlobalTheme" sectionTitle="sectionTitle"></fluid-section-detail>`,
    props: {
      theme: 'corp',
      overrideGlobalTheme: true,
      sectionTitle: 'My Corporate Section',
    },
    content,
  },
  {
    name: 'Increasing section title size with titleLevel property',
    element: `<fluid-section-detail theme="theme" overrideGlobalTheme="overrideGlobalTheme" sectionTitle="sectionTitle" titleLevel="titleLevel"></fluid-section-detail>`,
    props: {
      theme: 'corp',
      overrideGlobalTheme: true,
      sectionTitle: 'My Corporate Section',
      titleLevel: 2,
    },
    content,
  },
];
