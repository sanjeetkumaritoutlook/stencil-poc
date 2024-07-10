import { newSpecPage } from '@stencil/core/testing';
import { FluidForm } from './fluid-form';
import {
  FluidFieldValidationType,
  FluidFormElementType,
  FluidFormLayout,
  FluidFormState,
  FluidInputType,
  FluidTheme,
  inputField,
} from '@lmig/fluid-core';
import { Utils } from '../../utils/utils';
import { HIDDEN_FIELDS_CACHE, isHiddenCache } from './util/fluid-form.cache';
import clearAllMocks = jest.clearAllMocks;

const rowAndColumn = (element, gridRow: number, gridColumn: number) =>
  row(column(element, gridColumn), gridRow);
const row = (element, gridRow: number) => modify(element, { gridRow });
const column = (element, gridColumn: number) => modify(element, { gridColumn });
const modify = (element, update) => ({ ...element, ...update });

describe('fluid-form', () => {
  let page, component;

  /************************************************************************************
   * Render tests
   ***********************************************************************************/
  describe('Basic Form Rendering', () => {
    beforeEach(async () => {
      page = await newSpecPage({
        components: [FluidForm],
        html: `<div></div>`,
      });
      component = page.doc.createElement('fluid-form');
      component.config = {
        formName: 'My Form',
        layout: 'grid',
        columnOptions: [
          { columnId: 1, colSpan: 6 },
          { columnId: 2, colSpan: 6 },
        ],
        elements: [
          {
            label: 'Text Input',
            name: 'testInputOne',
            dataPath: 'testInputOne',
            type: 'text',
            gridColumn: 1,
            validation: [
              {
                type: 'minLength',
                value: 8,
                message:
                  'You must enter a minimum of 8 characters in this field.',
              },
            ],
          },
          {
            label: 'Text Input',
            name: 'testInputTwo',
            dataPath: 'testInputTwo',
            supplementaryLabel: '(with initial value)',
            initialValue: 'some value',
            type: 'text',
            gridColumn: 1,
            validation: [],
          },
          {
            label: 'Password Input',
            name: 'testInputThree',
            dataPath: 'testInputThree',
            type: 'password',
            gridColumn: 1,
            validation: [
              {
                type: 'required',
                value: true,
                message: 'Please enter a password to continue',
              },
            ],
          },
          {
            label: 'Select Input',
            name: 'testInputFour',
            dataPath: 'testInputFour',
            type: 'select',
            gridColumn: 2,
            initialValue: 'option_2',
            options: [
              {
                value: 'option_1',
                label: 'Option 1',
              },
              {
                value: 'option_2',
                label: 'Option 2',
              },
              {
                value: 'option_3',
                label: 'Option 3',
              },
            ],
          },
        ],
      };

      jest
        .spyOn(require('./util/fluid-form.utils'), 'addElementRef')
        .mockImplementation(
          (
            host: Partial<FluidForm>,
            dataPath: string,
            el: HTMLFluidFormElementElement
          ) => {
            el.getValue = jest.fn();
            host._elementRefs.push({ dataPath, el });
          }
        );
    });

    it('should render a basic Form with legacy theme', async () => {
      component.theme = 'legacy';
      component.emitOnRender = false;
      page.root.appendChild(component);
      await page.waitForChanges();
      expect(page.root.shadowRoot).toBeTruthy();

      const el = page.root.shadowRoot.querySelector('.fluid-form');
      expect(el).toBeTruthy();
      expect(el.classList.toString()).toContain('legacy');
    });

    it('should render a basic Form with lm theme', async () => {
      component.theme = 'lm';
      component.emitOnRender = false;
      page.root.appendChild(component);
      await page.waitForChanges();
      expect(page.root.shadowRoot).toBeTruthy();

      const el = page.root.shadowRoot.querySelector('.fluid-form');
      expect(el).toBeTruthy();
      expect(el.classList.toString()).toContain('lm');
    });

    it('should render a basic Form with corporate theme', async () => {
      component.theme = FluidTheme.CORP;
      component.emitOnRender = false;
      page.root.appendChild(component);
      await page.waitForChanges();
      expect(page.root.shadowRoot).toBeTruthy();

      const el = page.root.shadowRoot.querySelector('.fluid-form');
      expect(el).toBeTruthy();
      expect(el.classList.toString()).toContain(FluidTheme.CORP);
    });
  });

  /************************************************************************************
   * Functional tests
   ***********************************************************************************/
  describe('Functional Tests', () => {
    let component: FluidForm;

    beforeEach(() => {
      component = new FluidForm();
      component.emitOnRender = false;
    });

    it('should create an instance', () => {
      component.theme = FluidTheme.LEGACY;
      expect(component).toBeTruthy();
    });

    describe('clearConditionalFieldErrors', () => {
      const elementOne = {
        label: 'Some Field',
        controlName: 'testOne',
        dataPath: 'testOne',
        type: FluidInputType.TEXT,
      };
      const elementTwo = {
        label: 'Some Other Field',
        controlName: 'testTwo',
        dataPath: 'testTwo',
        type: FluidInputType.TEXT,
      };
      const elementThree = {
        label: 'Some Field',
        controlName: 'testThree',
        dataPath: 'testThree',
        type: FluidInputType.TEXT,
      };
      const errors = { testTwo: ['required'], testThree: ['custom'] };

      beforeEach(() => {
        component.config = {
          elements: [],
          layout: undefined,
          formName: 'test_form',
        };
        component._formState = {
          rawValue: { testOne: 1, testTwo: 2, testThree: 3 },
        };
      });

      it('should remove an error if its field is conditional, and hidden from current form', () => {
        component.config.elements = [
          elementOne,
          { ...elementTwo, conditionalOn: (data) => data.testOne === 2 },
          elementThree,
        ];
        Utils.selectiveMapConfigToLocal(component, component.config);
        component.updateHiddenFields(component._formState);
        const cleared = component.clearConditionalFieldErrors(errors);
        expect(cleared).toEqual({ testThree: ['custom'] });
      });

      it('should not remove an error if its field is conditional, and not hidden from current form', () => {
        component.config.elements = [
          elementOne,
          { ...elementTwo, conditionalOn: (data) => data.testOne === 1 },
          elementThree,
        ];
        Utils.selectiveMapConfigToLocal(component, component.config);
        component.updateHiddenFields(component._formState);
        const cleared = component.clearConditionalFieldErrors(errors);
        expect(cleared).toEqual({
          testTwo: ['required'],
          testThree: ['custom'],
        });
      });
    });

    describe('configUsesRows', () => {
      beforeEach(() => {
        component.config = {
          elements: [],
          layout: undefined,
          formName: 'test_form',
        };
      });

      it('should return true if all elements in the config have a gridRow property', () => {
        component.config = {
          ...component.config,
          elements: [
            rowAndColumn(inputField({ label: 'Input One' }), 1, 1),
            rowAndColumn(inputField({ label: 'Input Two' }), 2, 1),
            rowAndColumn(inputField({ label: 'Input Three' }), 2, 2),
          ],
        };
        Utils.selectiveMapConfigToLocal(component, component.config);
        expect(component.configUsesRows()).toEqual(true);
      });

      it('should return false if only some elements in the config have a gridRow property', () => {
        component.config = {
          ...component.config,
          elements: [
            rowAndColumn(inputField({ label: 'Input One' }), 1, 1),
            column(inputField({ label: 'Input Two' }), 2),
            rowAndColumn(inputField({ label: 'Input Three' }), 2, 2),
          ],
        };
        Utils.selectiveMapConfigToLocal(component, component.config);
        expect(component.configUsesRows()).toEqual(false);
      });

      it('should return false if no elements in the config have a gridRow property', () => {
        component.config = {
          ...component.config,
          elements: [
            column(inputField({ label: 'Input One' }), 1),
            column(inputField({ label: 'Input Two' }), 2),
            column(inputField({ label: 'Input Three' }), 2),
          ],
        };
        Utils.selectiveMapConfigToLocal(component, component.config);
        expect(component.configUsesRows()).toEqual(false);
      });
    });

    describe('validateGridLayout', () => {
      beforeEach(() => {
        component.config = {
          columnOptions: [],
          elements: [],
          layout: FluidFormLayout.GRID,
          formName: 'test_form',
        };
      });

      it('should return true if the grid config has columnOptions configured, and every element has a gridColumn property', () => {
        component.config = {
          ...component.config,
          layout: FluidFormLayout.GRID,
          columnOptions: [
            { columnId: 1, colSpan: 4 },
            { columnId: 2, colSpan: 4 },
            { columnId: 3, colSpan: 4 },
          ],
          elements: [
            column(inputField({ label: 'Input One' }), 1),
            column(inputField({ label: 'Input Two' }), 2),
            column(inputField({ label: 'Input Three' }), 3),
          ],
        };
        Utils.selectiveMapConfigToLocal(component, component.config);
        expect(component.validateGridLayout()).toEqual(true);
      });

      it('should return false if the grid config has columnOptions configured, and some elements do not have a gridColumn property', () => {
        component.config = {
          ...component.config,
          layout: FluidFormLayout.GRID,
          columnOptions: [
            { columnId: 1, colSpan: 4 },
            { columnId: 2, colSpan: 4 },
            { columnId: 3, colSpan: 4 },
          ],
          elements: [
            column(inputField({ label: 'Input One' }), 1),
            inputField({ label: 'Input Two' }),
            column(inputField({ label: 'Input Three' }), 3),
          ],
        };
        Utils.selectiveMapConfigToLocal(component, component.config);

        expect(component.validateGridLayout()).toEqual(false);
      });
    });

    describe('getRedactedValue', () => {
      const values = [
        { dataPath: 'testOne.one', value: 'TEST ONE' },
        { dataPath: 'testOne.two', value: 'TEST ONE TWO' },
        { dataPath: 'testTwo', value: 'TEST TWO' },
        { dataPath: 'testThree', value: 'TEST THREE' },
      ];

      beforeEach(() => {
        component.elements = [
          { dataPath: 'testOne.one' },
          { dataPath: 'testOne.two' },
          { dataPath: 'testTwo' },
          { dataPath: 'testThree' },
        ];
      });

      it('should return an object representing the form value with any hidden fields removed', () => {
        component._formStateCache[HIDDEN_FIELDS_CACHE]['testTwo'] = true;
        expect(component.getRedactedValue(values)).toEqual({
          testOne: {
            one: 'TEST ONE',
            two: 'TEST ONE TWO',
          },
          testThree: 'TEST THREE',
        });
      });

      it('should return an object representing the form value with any hidden fields removed and any configured output formatting applied', () => {
        component._formStateCache[HIDDEN_FIELDS_CACHE]['testTwo'] = true;
        component.elements[0] = {
          ...component.elements[0],
          outputFormat: {
            formatter: (value) => `The value is ${value}`,
            applyInline: false,
          },
        };
        expect(component.getRedactedValue(values)).toEqual({
          testOne: {
            one: 'The value is TEST ONE',
            two: 'TEST ONE TWO',
          },
          testThree: 'TEST THREE',
        });
      });

      it('should return an object representing the full form value if no hidden fields', () => {
        component._formStateCache[HIDDEN_FIELDS_CACHE]['testTwo'] = false;
        expect(component.getRedactedValue(values)).toEqual({
          testOne: {
            one: 'TEST ONE',
            two: 'TEST ONE TWO',
          },
          testTwo: 'TEST TWO',
          testThree: 'TEST THREE',
        });
      });
    });

    describe('updateHiddenFields', () => {
      beforeEach(() => {
        component.elements = [
          { dataPath: 'testOne' },
          {
            dataPath: 'testTwo',
            conditionalOn: (formData) => formData.testOne === 2,
          },
          { dataPath: 'testThree' },
        ];
      });

      it('should update the hidden fields cache with the result of conditionalFieldIsHidden when condition is false', () => {
        const formState: FluidFormState = {
          rawValue: {
            testOne: 1,
            testTwo: 2,
            testThree: 3,
          },
        };
        component.updateHiddenFields(formState);
        expect(isHiddenCache(component, 'testOne')).toEqual(false);
        expect(isHiddenCache(component, 'testTwo')).toEqual(true);
        expect(isHiddenCache(component, 'testThree')).toEqual(false);
      });

      it('should update the hidden fields cache with the result of conditionalFieldIsHidden when condition is true', () => {
        const formState: FluidFormState = {
          rawValue: {
            testOne: 2,
            testTwo: 2,
            testThree: 3,
          },
        };
        component.updateHiddenFields(formState);
        expect(isHiddenCache(component, 'testOne')).toEqual(false);
        expect(isHiddenCache(component, 'testTwo')).toEqual(false);
        expect(isHiddenCache(component, 'testThree')).toEqual(false);
      });
    });

    describe('setDynamicValue', () => {
      let testOneSpy, testTwoSpy;

      const testOne = {
        label: 'Test One',
        dataPath: 'testOne',
        type: FluidInputType.NUMBER,
        elementType: FluidFormElementType.INPUT,
      };
      const testTwo = (params: object) => ({
        ...{
          label: 'Test Two',
          dataPath: 'testTwo',
          dynamicValue: (formData) =>
            formData?.testOne > 5 ? 'Over Threshold' : 'Below Threshold',
        },
        ...params,
      });

      const setValue = (dataPath: string, value: any) =>
        (component._formState = {
          rawValue: {
            [dataPath]: value,
          },
        });

      beforeEach(() => {
        clearAllMocks();
        component._elementRefs = [
          {
            dataPath: 'testOne',
            el: {
              setValue: jest.fn(),
              getValue: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve({ value: undefined })
                ),
            } as unknown as HTMLFluidFormElementElement,
          },
          {
            dataPath: 'testTwo',
            el: {
              setValue: jest.fn(),
              getValue: jest
                .fn()
                .mockImplementation(() =>
                  Promise.resolve({ value: undefined })
                ),
            } as unknown as HTMLFluidFormElementElement,
          },
        ];
        testOneSpy = jest
          .spyOn(component._elementRefs[0].el, 'setValue')
          .mockImplementation(() => Promise.resolve());
        testTwoSpy = jest
          .spyOn(component._elementRefs[1].el, 'setValue')
          .mockImplementation(() => Promise.resolve());
      });

      // it('should call setValue on the matching element ref if its configuration has a dynamicValue and it is read-only', () => {
      //
      //   component.config = {
      //     formName: 'test-form',
      //     layout: FluidFormLayout.VERTICAL,
      //     elements: [testOne, testTwo({ readonly: true, disabled: false })]
      //   };
      //
      //   setValue('testOne', 10);
      //
      //   component.setDynamicValues();
      //   expect(testOneSpy).not.toHaveBeenCalled();
      //   expect(testTwoSpy).toHaveBeenCalledWith('Over Threshold', { skipDisabledCheck: true });
      //
      //   clearAllMocks();
      //
      //   setValue('testOne', 3);
      //
      //   component.setDynamicValues();
      //   expect(testOneSpy).not.toHaveBeenCalled();
      //   expect(testTwoSpy).toHaveBeenCalledWith('Below Threshold', { skipDisabledCheck: true });
      // });
      //
      // it('should call setValue on the matching element ref if its configuration has a dynamicValue and it is disabled', () => {
      //
      //   component.config = {
      //     formName: 'test-form',
      //     layout: FluidFormLayout.VERTICAL,
      //     elements: [testOne, testTwo({ readonly: false, disabled: true })]
      //   };
      //
      //   setValue('testOne', 10);
      //
      //   component.setDynamicValues();
      //   expect(testOneSpy).not.toHaveBeenCalled();
      //   expect(testTwoSpy).toHaveBeenCalledWith('Over Threshold', { skipDisabledCheck: true });
      //
      //   clearAllMocks();
      //
      //   setValue('testOne', 3);
      //
      //   component.setDynamicValues();
      //   expect(testOneSpy).not.toHaveBeenCalled();
      //   expect(testTwoSpy).toHaveBeenCalledWith('Below Threshold', { skipDisabledCheck: true });
      // });

      it('should not call setValue on the element ref if it has a dynamicValue but is not marked readonly or disabled', () => {
        component.config = {
          formName: 'test-form',
          layout: FluidFormLayout.VERTICAL,
          elements: [testOne, testTwo({ readonly: false, disabled: false })],
        };

        setValue('testOne', 10);

        expect(testOneSpy).not.toHaveBeenCalled();
        expect(testTwoSpy).not.toHaveBeenCalled();
      });
    });

    describe('setDynamicConfig', () => {
      const elements = [
        {
          label: 'Element One',
          dataPath: 'elementOne',
        },
        {
          label: 'Element Two',
          dataPath: 'elementTwo',
        },
      ];

      it('should update any element that have a dynamic configuration defined with new config based on current form value', () => {
        component.config = {
          formName: 'test-form',
          layout: FluidFormLayout.VERTICAL,
          elements: elements.map((e) => {
            return e.dataPath === 'elementOne'
              ? {
                  ...e,
                  dynamicConfig: (formData) => ({
                    validation:
                      formData?.elementTwo === 'hello'
                        ? [
                            {
                              type: FluidFieldValidationType.REQUIRED,
                              value: true,
                              message:
                                "This field is required when you enter 'hello' in element two",
                            },
                          ]
                        : undefined,
                  }),
                }
              : e;
          }),
        };

        component._formState = {
          rawValue: {
            elementOne: 'Hello',
            elementTwo: 'World',
          },
        };

        // Set dynamic config when dynamic criteria isn't met
        component.setDynamicConfig();

        // Should equal original config with empt
        expect(component.config.elements[0]).toEqual({
          ...component.config.elements[0],

          // expect.anything() as we're not testing the existence of the function
          dynamicConfig: expect.anything(),
        });

        // Meet the criteria for dynamic config to update validation
        component._formState = {
          rawValue: {
            elementOne: '',
            elementTwo: 'hello',
          },
        };

        // Should now update config as criteria is met
        component.setDynamicConfig();

        expect(component.config.elements[0]).toEqual({
          ...component.config.elements[0],

          // expect.anything() as we're not testing the existence of the function
          dynamicConfig: expect.anything(),

          // Validation now updated due to form value change
          validation: [
            {
              type: FluidFieldValidationType.REQUIRED,
              value: true,
              message:
                "This field is required when you enter 'hello' in element two",
            },
          ],
        });
      });

      it('should not update any elements if none have any dynamic configuration applied', () => {
        component.config = {
          formName: 'test-form-2',
          layout: FluidFormLayout.VERTICAL,
          elements,
        };

        expect(component.config.elements).toEqual(elements);
        component.setDynamicConfig();
        expect(component.config.elements).toEqual(elements);
      });
    });
  });
});
