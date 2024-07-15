import { FluidOption } from '@lmig/fluid-core';

import {
  COMBO_BOX_EXCEEDS_MAX_VALUES,
  COMBO_BOX_INVALID_VALUES,
} from '../../../constants/constants';
import { FluidComboBox } from '../fluid-combo-box';
import {
  gatherRetainedOptions,
  getSelectedOptionValues,
  parseActiveQueryFromValue,
  setRetainedOption,
  update,
  validateSelected,
} from './fluid-combo-box.utils';

describe('Combo Box Utils', () => {
  let host: FluidComboBox;

  const generateOptions = (
    count: number,
    selectedIndex?: number[]
  ): FluidOption[] => {
    return [...Array(count)].map((_, i) => {
      return {
        label: `Option ${i}`,
        value: `opt-${i}`,
        selected: !!selectedIndex && selectedIndex.includes(i),
      };
    });
  };

  // ================================================================ //
  // -- update()

  describe('update()', () => {
    beforeEach(() => {
      host = new FluidComboBox();
      host.controlName = 'combo-box-mock';
      host.label = 'Combo Box Mock';
      host.touched = false;
      host.setActiveIndex = jest.fn;
    });

    // ==== Single-Select

    describe('Single-Select', () => {
      it('should add specified option value to empty _elementState when option is selected', async () => {
        host.options = generateOptions(10);
        host.initializeState();

        expect(host._elementState.value).toEqual(undefined);
        update(host, host.options[5]);
        expect(host._elementState.value).toEqual([host.options[5].value]);
      });

      it('should replace existing option value in _elementState when option is selected', async () => {
        host.options = generateOptions(10, [2]);
        host.initializeState();

        expect(host._elementState.value).toEqual([host.options[2].value]);
        update(host, host.options[5]);
        expect(host._elementState.value).toEqual([host.options[5].value]);
      });
    });

    // ==== Multi-Select

    describe('Multi-Select', () => {
      it('should add specified option value to empty _elementState when option is selected', async () => {
        host.multiSelect = true;
        host.options = generateOptions(10);
        host.initializeState();

        expect(host._elementState.value).toEqual(undefined);
        update(host, host.options[5]);
        expect(host._elementState.value).toEqual([host.options[5].value]);
      });

      it('should add additional option values to _elementState when new options are selected', async () => {
        host.multiSelect = true;
        host.options = generateOptions(10, [2]);
        host.initializeState();

        expect(host._elementState.value).toEqual([host.options[2].value]);
        update(host, host.options[4]);
        expect(host._elementState.value).toEqual([
          host.options[2].value,
          host.options[4].value,
        ]);
        update(host, host.options[6]);
        expect(host._elementState.value).toEqual([
          host.options[2].value,
          host.options[4].value,
          host.options[6].value,
        ]);
      });

      it('should remove option values from _elementState when existing options are deselected', async () => {
        host.multiSelect = true;
        host.options = generateOptions(10, [2, 4, 6]);
        host.initializeState();

        expect(host._elementState.value).toEqual([
          host.options[2].value,
          host.options[4].value,
          host.options[6].value,
        ]);
        update(host, host.options[6]);
        expect(host._elementState.value).toEqual([
          host.options[2].value,
          host.options[4].value,
        ]);
        update(host, host.options[4]);
        expect(host._elementState.value).toEqual([host.options[2].value]);
      });

      it('should reset _elementState value to undefined when all existing options are deselected', async () => {
        host.multiSelect = true;
        host.options = generateOptions(10, [2]);
        host.initializeState();

        expect(host._elementState.value).toEqual([host.options[2].value]);
        update(host, host.options[2]);
        expect(host._elementState.value).toEqual(undefined);
      });
    });
  });

  // ================================================================ //
  // -- getSelectedOptionValues()

  describe('getSelectedOptionValues()', () => {
    it('should return the values of all selected options when selected options exist', async () => {
      const options = generateOptions(10, [2, 4, 6, 8]);
      const selectedOpts = options.filter((opt) => opt.selected);
      const selectedVals = getSelectedOptionValues(options);

      expect(selectedVals.length).toEqual(selectedOpts.length);
      expect(
        selectedOpts.every((opt) => selectedVals.includes(opt.value))
      ).toEqual(true);
    });

    it('should return an empty array when selected options do NOT exist', async () => {
      const options = generateOptions(10);
      const selectedVals = getSelectedOptionValues(options);

      expect(selectedVals.length).toBeFalsy();
      expect(selectedVals).toEqual([]);
    });
  });

  // ================================================================ //
  // -- validateSelected()

  describe('validateSelected()', () => {
    beforeEach(() => {
      host = new FluidComboBox();
      host.options = generateOptions(10);
      host.controlName = 'combo-box-mock';
      host.label = 'Combo Box Mock';

      jest.spyOn(console, 'warn');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    // ==== Single Select / Multi-select

    it('should return "undefined" when the original array of option values is empty', async () => {
      const initialValues = [];
      const validatedVals = validateSelected(host, initialValues);

      expect(validatedVals).toBeFalsy();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should return "undefined" without outputting a console error when "_stateInitialized" is false', async () => {
      host['_stateInitialized'] = false;
      const initialValues = [
        'opt-totally-valid',
        'opt-2',
        'opt-4.5',
        'opt-8',
        'opt-100',
      ];
      const validatedVals = validateSelected(host, initialValues);

      expect(validatedVals).toBeFalsy();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should find all invalid option values, output them in console warning, & return "undefined"', async () => {
      host['_stateInitialized'] = true;
      const initialValues = [
        'opt-totally-valid',
        'opt-2',
        'opt-4.5',
        'opt-8',
        'opt-100',
      ];
      const validatedVals = validateSelected(host, initialValues);

      expect(validatedVals).toBeFalsy();
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn['mock'].calls[0][0]).toContain(
        COMBO_BOX_INVALID_VALUES(['opt-totally-valid', 'opt-4.5', 'opt-100'])
      );
    });

    it('should accept custom input via "initialValue" when "allowCustomInput" is true', async () => {
      host.allowCustomInput = true;
      const initialValue = ['Custom Input!'];
      const validatedVals = validateSelected(host, initialValue);

      expect(validatedVals).toBeTruthy();
      expect(validatedVals).toEqual(initialValue);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should NOT accept custom input via "initialValue" when "allowCustomInput" is false', async () => {
      host['_stateInitialized'] = true;
      host.allowCustomInput = false;
      const initialValue = ['Custom Input!'];
      const validatedVals = validateSelected(host, initialValue);

      expect(validatedVals).toBeFalsy();
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn['mock'].calls[0][0]).toContain(
        COMBO_BOX_INVALID_VALUES(['Custom Input!'])
      );
    });

    // ==== Single-Select

    it('should return 1st value provided & output console warning when multiSelect is false & multiple values provided', async () => {
      const initialValues = ['opt-2', 'opt-4', 'opt-6', 'opt-8'];
      const validatedVals = validateSelected(host, initialValues);

      expect(validatedVals).toBeTruthy();
      expect(validatedVals).toEqual([initialValues[0]]);
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn['mock'].calls[0][0]).toContain(
        COMBO_BOX_EXCEEDS_MAX_VALUES(initialValues[0])
      );
    });

    it('should return the original option value (in an array) when value is valid & multiSelect is false', async () => {
      const initialValues = ['opt-2'];
      const validatedVals = validateSelected(host, initialValues);

      expect(validatedVals).toBeTruthy();
      expect(validatedVals).toEqual(initialValues);
      expect(console.warn).not.toHaveBeenCalled();
    });

    // ==== Multi-Select

    it('should return the original array of option values when all values are valid & multiSelect is true', async () => {
      host.multiSelect = true;
      const initialValues = ['opt-2', 'opt-4', 'opt-6', 'opt-8'];
      const validatedVals = validateSelected(host, initialValues);

      expect(validatedVals).toBeTruthy();
      expect(validatedVals).toEqual(initialValues);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  // ================================================================ //
  // -- Async Utilities

  describe('Async Utilities', () => {
    // ==== parseActiveQueryFromValue()

    describe('parseActiveQueryFromValue()', () => {
      it('should return an empty string when given an array with multiple values', () => {
        expect(parseActiveQueryFromValue(['Bret', 'Kamren'])).toEqual('');
      });

      it('should return the first value in the array as a string, if there is only one array', () => {
        expect(parseActiveQueryFromValue(['Bret'])).toEqual('Bret');
      });

      it('should return the initial value of a string if given a string', () => {
        expect(parseActiveQueryFromValue('Bret')).toEqual('Bret');
      });
    });

    // ==== gatherRetainedOptions()

    describe('gatherRetainedOptions()', () => {
      const options = [
        { label: 'Leanne Graham', value: 'Bret' },
        { label: 'Chelsey Deitrich', value: 'Kamren' },
        { label: 'Kurtis Weissnat', value: 'Elwyn.Skiles' },
      ];

      it('should return an array of options whose value attribute exists in the elements current value', () => {
        const elementValue = ['Bret', 'Kamren'];
        const retainedOptions = gatherRetainedOptions(options, elementValue);
        expect(retainedOptions.length).toEqual(2);
        expect(retainedOptions).toMatchObject([
          { label: 'Leanne Graham', value: 'Bret' },
          { label: 'Chelsey Deitrich', value: 'Kamren' },
        ]);
      });

      it('should return an array of options that each have "_index: -1", "_hidden: false", & "selected: true" properties', () => {
        const elementValue = ['Bret', 'Elwyn.Skiles'];
        const retainedOptions = gatherRetainedOptions(options, elementValue);
        expect(retainedOptions.length).toEqual(2);
        expect(retainedOptions.every((opt) => opt.selected === true)).toEqual(
          true
        );
        expect(retainedOptions.every((opt) => opt._hidden === false)).toEqual(
          true
        );
        expect(retainedOptions.every((opt) => opt._index === -1)).toEqual(true);
      });

      it('should return an empty array if the elements current value is undefined', () => {
        const elementValue = undefined;
        const retainedOptions = gatherRetainedOptions(options, elementValue);
        expect(retainedOptions.length).toEqual(0);
        expect(retainedOptions).toEqual([]);
      });
    });

    // ==== setRetainedOption()

    describe('setRetainedOption()', () => {
      const retainedObjProps = { selected: true, _hidden: false, _index: -1 };
      const option1: FluidOption = { label: 'Leanne Graham', value: 'Bret' };
      const option2: FluidOption = {
        label: 'Chelsey Deitrich',
        value: 'Kamren',
      };

      beforeEach(() => {
        host = new FluidComboBox();
        host.controlName = 'combo-box-mock';
        host.label = 'Combo Box Mock';
        host.optionLookup = { retainSelections: true, lookup: jest.fn };
      });

      // ==== Single-Select

      describe('Single-Select', () => {
        it('should retain the new selected option', async () => {
          host._retainedOptions = [];
          setRetainedOption(host, { ...option1, selected: false });
          expect(host._retainedOptions).toEqual([
            { ...option1, ...retainedObjProps },
          ]);
        });

        it('should replace the previously retained option with the new selected option', async () => {
          host._retainedOptions = [{ ...option1, ...retainedObjProps }];
          setRetainedOption(host, { ...option2, selected: false });
          expect(host._retainedOptions).toEqual([
            { ...option2, ...retainedObjProps },
          ]);
        });

        it('should NOT retain the new selected "custom input" option', async () => {
          host._retainedOptions = [];
          setRetainedOption(host, { ...option1, selected: false, _index: -1 });
          expect(host._retainedOptions).toEqual([]);
        });

        it('should CLEAR retained options when new selected option is "custom input"', async () => {
          host._retainedOptions = [{ ...option1, ...retainedObjProps }];
          setRetainedOption(host, { ...option2, selected: false, _index: -1 });
          expect(host._retainedOptions).toEqual([]);
        });
      });

      // ==== Multi-Select

      describe('Multi-Select', () => {
        beforeEach(() => {
          host.multiSelect = true;
        });

        it('should add new selected option to retained options', async () => {
          host._retainedOptions = [{ ...option1, ...retainedObjProps }];
          setRetainedOption(host, { ...option2, selected: false });
          expect(host._retainedOptions).toEqual([
            { ...option1, ...retainedObjProps },
            { ...option2, ...retainedObjProps },
          ]);
        });

        it('should remove deselected option from retained options', async () => {
          host._retainedOptions = [
            { ...option1, ...retainedObjProps },
            { ...option2, ...retainedObjProps },
          ];
          setRetainedOption(host, { ...option1, selected: true });
          expect(host._retainedOptions).toEqual([
            { ...option2, ...retainedObjProps },
          ]);
        });
      });
    });
  });
});
