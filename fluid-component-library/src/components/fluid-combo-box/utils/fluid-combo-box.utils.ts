import {
  FluidOption,
  FluidSortOrder,
  isNullOrUndefined,
} from '@lmig/fluid-core';

import {
  COMBO_BOX_EXCEEDS_MAX_VALUES,
  COMBO_BOX_INVALID_VALUES,
  COMBO_BOX_MASKING_DISABLED,
} from '../../../constants/constants';
import {
  getOptGroupLabels,
  hasGroupedOptions,
} from '../../../utils/forms/form-method.utils';
import { setInitialElementState } from '../../../utils/forms/form-utils';
import { Utils } from '../../../utils/utils';
import { FluidComboBox } from '../fluid-combo-box';

/**
 * True if browser is Internet Explorer, false otherwise.
 */
const _browserIsMsie: boolean = Utils.browserIsMsie();

/**
 * Used to calculate elapsed time between "scrollMenuTo()" function
 * calls & determine if smooth scroll animation should be disabled
 * for better performance.
 */
let _scrollTimer = 0;

/**
 * Reference to setTimeout for "maskingConfig.blurDelay". Allows
 * timeout to be cancelled if Combo Box receives :focus before
 * callback is executed.
 */
let _maskingDelay;

// ================================================================ //
// -- Form Method Utils

/**
 * Logic for public "setValue()" method. Programmatically sets Combo Box's
 * selected option(s) (replacing any previously selected options) if provided
 * values pass validation.
 * @param host
 * @param value - string / array of string value(s) of option(s) to be selected
 */
export async function setValue(host: FluidComboBox, value: string | string[]) {
  if (host.optionLookup) {
    await host.handleAsyncLookup(parseActiveQueryFromValue(value));
  }
  const validatedValues = validateSelected(
    host,
    !Array.isArray(value) ? [value] : value,
    host._options
  );
  const valueHasChanged = {
    dataPath: host.config?.dataPath || host.controlName,
    changed: host._elementState.value !== validatedValues,
    value: await host.getValue(),
  };

  switch (true) {
    // Value(s) pass validation, so update selected option(s) & return "valueHasChanged"
    case !!value && !!validatedValues: {
      host.touched = false;
      host._elementState = {
        ...host._elementState,
        value: validatedValues,
        touched: host.touched,
      };
      !!host.optionLookup &&
        (host._retainedOptions = gatherRetainedOptions(
          host._options,
          validatedValues
        ));

      host.updateOptions();
      applyMasking(host, true);
      await host.validate();
      return valueHasChanged;
    }
    // Value(s) did NOT pass validation, so end function without changing anything
    // ("validateSelected()" will output a console warning)
    case !!value && !!value.length && !validatedValues:
      return;
    // No value(s) provided, so reset Combo Box & return "valueHasChanged"
    default: {
      await host.reset(true);
      return valueHasChanged;
    }
  }
}

/**
 * Clears all selected options & resets Combo Box to its default state. If "clear"
 * parameter is "false", Combo Box's selected option(s) will be reset to "initialValue".
 * @param host
 * @param clear - clear ALL selected options if true, reset to validated "initialValue" if false
 */
export const reset = (host: FluidComboBox, clear = false) => {
  host._activeQuery = false;
  host._lastTouchedOption = undefined;
  host.touched = false;
  host.resetActiveIndex();
  host.setInputDisplayValue(true);

  if (host.optionLookup) {
    host._retainedOptions = [];

    if (clear) {
      host._elementState = setInitialElementState(undefined, host.controlName);
      host.handleAsyncLookup(null);
    } else {
      host
        .handleAsyncLookup(
          parseActiveQueryFromValue(host._validatedInitialValue)
        )
        .then(() => {
          host._elementState = setInitialElementState(
            host._validatedInitialValue,
            host.controlName
          );
          host._retainedOptions = gatherRetainedOptions(
            host._options,
            host._elementState.value
          );
          host.updateOptions();
          applyMasking(host, true);
        });
    }
  } else {
    host._elementState = setInitialElementState(
      clear ? undefined : host._validatedInitialValue,
      host.controlName
    );
    host.updateOptions();
  }
};

/**
 * Adds or removes FluidOption from Combo Box's selected options &
 * emits the element state upwards via its "valueChange" event emitter.
 */
export const update = (host: FluidComboBox, opt: FluidOption): void => {
  host.touched = true;
  host._elementState = {
    ...host._elementState,
    value: getUpdatedState(host, opt),
    touched: host.touched,
  };
  setRetainedOption(host, opt);
  host.validate().then(() => host.valueChange.emit(host._elementState));
};

// ================================================================ //
// -- Combo Box Async Utilities

/**
 * Parses an active query for the first lookup in an async lookup
 * which has "initialValue" OR "value" set.
 */
export const parseActiveQueryFromValue = (value: string | string[]): string => {
  if (Array.isArray(value)) {
    return value.length === 1 ? (value[0] as string) : '';
  }
  return value as string;
};

/**
 * Finds & returns all FluidOption objects from the "options" param that
 * have a "value" that matches a value in the "retainedOptions" param.
 * Used to populate "_retainedOptions" when "optionLookup" is provided.
 * @param options - "source" array of FluidOption objects to search
 * @param retainedValues - values to find in the "options" array
 */
export const gatherRetainedOptions = (
  options: FluidOption[] = [],
  retainedValues: string[] = []
): FluidOption[] => {
  return options.reduce((retainedOpts: FluidOption[], opt: FluidOption) => {
    if (!retainedValues.includes(opt.value)) return retainedOpts;
    return [
      ...retainedOpts,
      { ...opt, selected: true, _hidden: false, _index: -1 },
    ];
  }, []);
};

/**
 * Adds or removes an option from the "_retainedOptions" array.
 *
 * NOTE: "custom input" options (i.e. options with "_index: -1") are
 * NOT included in "_retainedOptions" when they are PASSED IN to this
 * function via the "opt" parameter, since "custom input" options
 * are NEVER displayed as "selected" in the dropdown menu (& therefore
 * should NOT be included in the "_retainedOptions" array).
 *
 * However, when "standard" options (i.e. NOT "custom input" options)
 * are added to "_retainedOptions", they are assigned an "_index: -1".
 * This is done to differentiate them from "standard" options that are
 * returned from "_debouncedLookup()". Both "retained" options & "custom
 * input" options are handled similarly by Combo Box's other logic, which
 * is why they both have "_index: -1", but "retained" options only have
 * "_index" set to "-1" AFTER they're added to "_retainedOptions".
 * @param host - Combo Box class instance (NOT the "host" HTMLElement)
 * @param opt - the FluidOption object to add or remove from "_retainedOptions"
 * @param selected - true if option should be added, false if should be removed
 */
export const setRetainedOption = (
  host: FluidComboBox,
  opt: FluidOption,
  selected = !opt.selected
) => {
  if (isNullOrUndefined(host.optionLookup) || isNullOrUndefined(opt)) return;

  switch (true) {
    // For single-select, replace previously retained option with new selected option
    // NOTE: if new selected option is "custom input", empty/clear retained options
    case !host.multiSelect:
      host._retainedOptions =
        opt._index !== -1
          ? [{ ...opt, selected: true, _hidden: false, _index: -1 }]
          : [];
      break;
    // For multi-select, add new selected option to retained options (UNLESS it's "custom input")
    case selected && opt._index !== -1:
      host._retainedOptions.push({
        ...opt,
        selected: true,
        _hidden: false,
        _index: -1,
      });
      break;
    // If option was deselected, remove it from retained options
    case !selected:
      host._retainedOptions = host._retainedOptions.filter(
        (retained) => retained.value !== opt.value
      );
      break;
  }
};

// ================================================================ //
// -- Combo Box Utilities

/**
 * Finds & returns the "values" of all FluidOptions with "selected"
 * property set to true.
 * @param options - the array of FluidOptions to iterate through
 */
export const getSelectedOptionValues = (
  options: FluidOption[] = []
): string[] => {
  return options.reduce((a: string[], opt) => {
    return opt.selected ? [...a, opt.value] : a;
  }, []);
};

/**
 * Validates the selected option VALUES provided for Combo Box. Value(s) fail
 * validation if they don't correspond to option value(s) in "options" array &
 * "allowCustomInput" is false, OR if multiple selected values are provided to
 * a single-select Combo Box.
 * @param host
 * @param selectedValues - array of string values to be validated
 * @param options - array of FluidOptions to validate against
 */
export const validateSelected = (
  host: FluidComboBox,
  selectedValues: string[],
  options: FluidOption[] = host.options ?? []
): string[] => {
  const invalidValues = getInvalidOptionValues(options, selectedValues);

  switch (true) {
    // No initial value provided & no options have "selected" property
    case !selectedValues.length:
      return undefined;
    // Initial value contains values NOT in options array & custom input is NOT allowed, so don't select any options
    case !!invalidValues.length && !host.allowCustomInput:
      // Only output console warning if state has been initialized with POPULATED "options" array
      host._stateInitialized &&
        Utils.consoleWarn(host.host, COMBO_BOX_INVALID_VALUES(invalidValues));
      return undefined;
    // Initial value provided for single-select Combo Box contains multiple values, so select the first only
    case !host.multiSelect && selectedValues.length > 1:
      Utils.consoleWarn(
        host.host,
        COMBO_BOX_EXCEEDS_MAX_VALUES(selectedValues[0])
      );
      return [selectedValues[0]];
    // Initial value provided is valid, so select all options
    default:
      return selectedValues;
  }
};

/**
 * If "options" Prop provided to host, returns DUPLICATE array of FluidOptions that is
 * sorted asc/desc (if "sortOrder" provided) for internal derived "_options" State.
 * If "options" Prop contains groups, sorts options consecutively based on their group
 * labels (regardless of "sortOrder" Prop). If "sortOrder" Prop IS provided for grouped
 * options, sorts groups asc/desc AND sorts options within groups asc/desc.
 * If "options" array is undefined, returns empty array.
 */
export const initializeOptions = (host: FluidComboBox): FluidOption[] => {
  if (!host.options?.length) return [];
  const { options, sortOrder } = host;
  const opts = sortOrder ? sortOptions(options, sortOrder) : [...options];

  if (hasGroupedOptions(opts)) {
    host._optGroupLabels = getOptGroupLabels(opts, sortOrder);
    return sortOptionsByGroup(opts, host._optGroupLabels);
  } else {
    host._optGroupLabels = undefined;
    return opts;
  }
};

/**
 * Arranges options consecutively based on their GROUP labels (i.e. pulls options with
 * identical group labels together into a consecutive order). The final order of the returned
 * FluidOption array is determined by the order in the "groupLabels" parameter. Options that
 * are NOT grouped are sorted AFTER grouped options. NOTE: to sort the groups asc/desc, sort
 * the strings in the "groupLabels" array FIRST.
 * @param opts - the array of FluidOption objects (with groups) to be sorted
 * @param groupLabels - array of group label strings (that correlate to group labels in the "opts" array) that dictate sort order
 */
export const sortOptionsByGroup = (
  opts: FluidOption[],
  groupLabels: string[]
): FluidOption[] => {
  return opts.sort((a, b) => {
    switch (true) {
      case !a.group?.label:
        return 1;
      case !b.group?.label:
        return -1;
      default:
        return (
          groupLabels.indexOf(a.group.label) -
          groupLabels.indexOf(b.group.label)
        );
    }
  });
};

/**
 * Sorts array of FluidOptions ascending / descending by LABEL. Returns DUPLICATE
 * array of sorted options.
 * @param opts - array of FluidOptions to be sorted
 * @param sortOrder - ascending / descending specification
 */
export const sortOptions = (
  opts: FluidOption[],
  sortOrder: FluidSortOrder
): FluidOption[] => {
  const isAsc = sortOrder === FluidSortOrder.ASC;
  return [...opts].sort((a, b) => {
    return a.label > b.label ? (isAsc ? 1 : -1) : isAsc ? -1 : 1;
  });
};

/**
 * Determines if current active/highlighted option in Combo Box's dropdown menu
 * is visible - if not, calls function to scroll dropdown menu up/down until
 * active option is visible. Compensates for "sticky" optgroup labels (if they exist).
 * @param host
 * @param optIndex - index of current active/highlighted option
 * @param smoothScroll - whether scrolling should have "smooth" animation
 */
export const scrollOptionIntoView = async (
  host,
  optIndex: number,
  smoothScroll = true
) => {
  if (optIndex === -1) {
    scrollMenuTo(host, 0, false);
    return;
  }

  await Utils.nextTick();

  const listHeight = host._menuRef.scrollHeight;
  const menuHeight = host._menuRef.clientHeight;

  if (listHeight <= menuHeight) return;

  const scrollTop = host._menuRef.scrollTop;
  const scrollBottom = menuHeight + scrollTop;
  const optHeight = host._optionRefs[optIndex].offsetHeight;
  const optTop = host._optionRefs[optIndex].offsetTop;
  const optBottom = optTop + optHeight;
  const optGroupOffset = host._optGroupLabels
    ? host._optionRefs[optIndex]
        .closest('.dropdown-menu-optgroup-container')
        ?.querySelector('.dropdown-menu-optgroup-label')?.offsetHeight ?? 0
    : 0;

  switch (true) {
    case optBottom > scrollBottom:
      scrollMenuTo(host, optBottom - menuHeight, smoothScroll);
      break;
    case optTop - optGroupOffset < scrollTop:
      scrollMenuTo(host, optTop - optGroupOffset, smoothScroll);
      break;
  }
};

/**
 * Sets the <input> element's "aria-activedescendant" attr to the currently active
 * /highlighted option's "id" attr value (used by assistive technology) OR removes
 * the "aria-activedescendant" attr if no option is currently active/highlighted.
 * @param host
 */
export const setActiveDescendantId = (host): void => {
  const activeDescendantId =
    host._activeIndex !== -1
      ? host._optionRefs[host._activeIndex]?.id ?? ''
      : '';

  activeDescendantId
    ? host._elementRef.setAttribute('aria-activedescendant', activeDescendantId)
    : host._elementRef.removeAttribute('aria-activedescendant');
};

/**
 * Outputs "masking disabled" console warning if "maskingConfig" is provided to Combo
 * Box but "allowCustomInput" is false (since masking only applies to custom input).
 * @param host
 */
export const validateMasking = (host): void => {
  if (!!host.maskingConfig && !host.allowCustomInput) {
    Utils.consoleWarn(host.host, COMBO_BOX_MASKING_DISABLED);
  }
};

/**
 * Applies masking function to Combo Box "custom input" & returns the resulting
 * masked string. Returns "undefined" if label parameter is falsy, "custom input"
 * isn't allowed, or if the provided label matches any of the labels in the
 * "options" array (i.e. the label isn't "custom input").
 * @param host
 * @param label - the "custom input" string to be masked
 */
export const getMaskedLabel = (host, label: string): string => {
  if (
    !label ||
    !host.maskingConfig ||
    !host.allowCustomInput ||
    !!host._options.find((opt) => opt.label === label)
  )
    return;
  const { maskingFn } = host.maskingConfig;
  return maskingFn(label);
};

/**
 * Applies masking to selected Combo Box "custom input" options after specified
 * delay. Called when Combo Box loses :focus.
 * @param host
 * @param immediate - skips "blurDelay" timeout when true
 */
export const applyMasking = (host, immediate = false): void => {
  if (
    !host.maskingConfig ||
    !host.allowCustomInput ||
    !host._elementState.value
  )
    return;
  clearMaskingDelay();

  _maskingDelay = setTimeout(
    () => {
      host._maskingActive = true;
    },
    immediate ? 0 : host.maskingConfig.blurDelay ?? 0
  );
};

/**
 * Stops masking delay countdown & prevents masking from being applied to
 * Combo Box "custom input". Called if/when Combo Box regains :focus before
 * "blurDelay" countdown timer expires & executes masking function.
 */
export const clearMaskingDelay = (): void => {
  clearTimeout(_maskingDelay);
};

// ================================================================ //
// -- Combo Box Utilities (Private)

/**
 * Finds & returns invalid option values (if any) in "values" parameter.
 * A value is considered invalid if it is NOT included in any of the
 * FluidOptions in the "options" parameter.
 * @param options - array of FluidOptions to validate against
 * @param values - array of string values to validate
 */
const getInvalidOptionValues = (
  options: FluidOption[],
  values: string[]
): string[] => {
  return values.reduce((a: string[], val) => {
    return options.findIndex((opt) => opt.value === val) === -1
      ? [...a, val]
      : a;
  }, []);
};

/**
 * Determines if a FluidOption should be added or removed from the element state,
 * then returns the updated "_elementState.value" array. For single-select Combo
 * Box, the new selected option always replaces the old option (if it exists) in
 * the element state. For multi-select Combo Box, the new option is added to the
 * element state if it was previously unselected (i.e. "selected" property was
 * "false"), or removed from the element state if previously selected.
 * @param host
 * @param opt - the option to be added/removed from the element state
 */
const getUpdatedState = (host: FluidComboBox, opt: FluidOption): string[] => {
  switch (true) {
    // If single-select Combo Box, replace previously selected option
    case !host.multiSelect:
      return [opt.value];
    // If option was previously unselected (or undefined), add to selected options
    case !opt.selected:
      return [...(host._elementState.value ?? []), opt.value];
    // If option was previously selected, remove from selected options
    case opt.selected: {
      const filtered = host._elementState.value.filter(
        (val) => val !== opt.value
      );
      return filtered.length ? filtered : undefined;
    }
  }
};

/**
 * Vertically scrolls Combo Box dropdown menu to a specific point. Used in
 * conjunction with "scrollOptionIntoView()" to keep the currently active/
 * highlighted option in view. Also calculates time elapsed from its last
 * call to determine whether smooth scrolling should be disabled for better
 * performance (e.g. the up/down arrow key is being held down).
 * @param host
 * @param yPosition - Y-axis position the menu should be scrolled to
 * @param smooth - whether smooth scrolling animation should be applied
 */
const scrollMenuTo = (host, yPosition: number, smooth = true): void => {
  if (!host._menuRef) return;

  const prevTime = _scrollTimer;
  _scrollTimer = performance.now();
  const smoothScroll = smooth && (_scrollTimer - prevTime) / 1000 > 0.1;

  if (smoothScroll && !_browserIsMsie) {
    host._menuRef.scrollTo({ top: yPosition, behavior: 'smooth' });
  } else {
    host._menuRef.scrollTop = yPosition;
  }
};
