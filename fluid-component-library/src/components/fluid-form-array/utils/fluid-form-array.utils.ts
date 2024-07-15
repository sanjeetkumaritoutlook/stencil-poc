import {
  FluidFormArrayItem,
  FluidFormConfig,
  FluidFormElementConfig,
} from '@lmig/fluid-core';

import { setDataAtPath } from '../../fluid-table/internal/fluid-table-data-management.utils';

export const getActiveForms = (_forms: FluidFormArrayItem[]) =>
  _forms.filter((f) => f.active);
export const getActiveFormAt = (_forms: FluidFormArrayItem[], idx: number) =>
  _forms.find((f) => f.activeIdx === idx)?.ref;

/**
 * Returns true if the delete entry button should be down (based on the form not being the last active, the active forms having
 * more than the configured minimum entry constraint and the current form index being greater than the minimum)
 * @param _forms
 * @param activeIdx
 * @param minimumEntries
 * @param isLast
 */
export const showRemoveActionCompute = (
  _forms: FluidFormArrayItem[],
  activeIdx: number,
  minimumEntries = 1,
  isLast: Function
) => {
  return (
    _forms.filter((f) => f.active).length > minimumEntries &&
    !isLast(activeIdx, _forms) &&
    activeIdx + 1 > minimumEntries
  );
};

/**
 * Evaluates if the remove icon will be displayed based on formConfig.allowDeleteForm function
 * @param f
 * @param minimumEntries
 * @param host
 * @returns
 */
export const showRemoveAction = (
  f: FluidFormArrayItem,
  minimumEntries: number,
  host
) => {
  const { allowDeleteForm } = {
    ...(host.config?.formConfig as FluidFormConfig),
  };

  return allowDeleteForm
    ? allowDeleteForm(f.state)
    : showRemoveActionCompute(
        host._forms,
        f.activeIdx,
        minimumEntries,
        isLastActiveForm
      );
};

/**
 * Returns true if the cancel button should be shown (based on the form being the last active, not the first active, and not
 * less that or equal to the configured minimum entry constraint)
 * @param form
 * @param minimumEntries
 * @param isLast
 * @param isFirst
 * @param _forms
 */
export const showCancel = (
  form: FluidFormArrayItem,
  minimumEntries = 1,
  isLast: Function,
  isFirst: Function,
  _forms
) => {
  return (
    isLast(form.activeIdx, _forms) &&
    !isFirst(form.activeIdx, _forms) &&
    form.activeIdx + 1 !== minimumEntries
  );
};

/**
 * Returns booleans for first or last active forms
 * @param idx
 * @param _forms
 */
export const isLastActiveForm = (idx: number, _forms: FluidFormArrayItem[]) =>
  idx === getActiveForms(_forms).length - 1;
export const isFirstActiveForm = (idx: number, _forms: FluidFormArrayItem[]) =>
  idx === getActiveForms(_forms)?.[0]?.activeIdx;

/**
 * Returns true if the maximum configured entry limit is met.
 * @param _forms
 * @param maxEntries
 */
export const maxEntriesMet = (
  _forms: FluidFormArrayItem[],
  maxEntries: number
) => {
  return !!maxEntries && getActiveForms(_forms).length === maxEntries;
};

/**
 * Creates a new form raw value from the form elements, including setting any initial value that exists in the
 * configuration.
 * @param elements
 */
export const emptyForm = (elements) =>
  elements?.reduce((rawValue: {}, currentElement: FluidFormElementConfig) => {
    return setDataAtPath(
      rawValue,
      null,
      currentElement.initialValue,
      currentElement.dataPath
    );
  }, {});
