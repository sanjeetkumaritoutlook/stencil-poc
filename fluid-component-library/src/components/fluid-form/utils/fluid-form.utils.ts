import {
  FluidColumnOptions,
  FluidComponentDefinition,
  FluidFormElementConfig,
  FluidFormItem,
  FluidFormState,
  FluidGridItemSize,
  FluidKeyedObject,
  FluidRowOptions,
  isNumber,
} from '@lmig/fluid-core';

import { spaceCaseToCamelCase } from '../../../tooling/component-prop.utils';
import { Utils } from '../../../utils/utils';
import { getDataAtPath } from '../../fluid-table/internal/fluid-table-data-management.utils';
import { FormColumnConfig } from '../components/fluid-form-layouts.components';
import { FluidForm } from '../fluid-form';

/**
 * ID GENERATORS
 * @param formName
 * @constructor
 */

export const FORM = (formName: string) =>
  ({ tagName: 'fluid-form', id: formName } as HTMLElement);
export const FORM_ELEMENT_ID = (
  formName: string,
  config: FluidFormElementConfig
) => `${spaceCaseToCamelCase(formName)}_${config.controlName}`;
export const FORM_COLUMN_ID = (columnId: number, formName: string) =>
  `fluid-form-column-${columnId}-${spaceCaseToCamelCase(formName)}`;
export const FORM_ROW_COLUMN_ID = (
  columnId: number | string,
  rowId: number,
  formName: string
) =>
  `fluid-form-column-${columnId}-row-${rowId}-${spaceCaseToCamelCase(
    formName
  )}`;
export const FORM_ELEMENT_GRID_ID = (elementId: string, formName: string) =>
  `fluid-element-wrapper-${elementId}-${spaceCaseToCamelCase(formName)}`;
export const FORM_OUTER_GRID = (formName: string) =>
  `fluid-form-outer-grid-${spaceCaseToCamelCase(formName)}`;
export const FORM_ROW_ID = (rowId: number, formName: string) =>
  `fluid-form-row-${rowId}-${spaceCaseToCamelCase(formName)}`;
export const LOADING_SPINNER_ID = (spinnerId: string, type: string) =>
  `fluid-loading-${type}-${spinnerId}`;
/**
 * Add a reference to the rendered element to the form reference store
 * @param host
 * @param dataPath
 * @param el
 */
export const addElementRef = <Host extends FluidForm>(
  host: Host,
  dataPath: string,
  el: HTMLFluidFormElementElement
) => {
  host._elementRefs.push({ dataPath, el });
};

/**
 * Create a style class for the grid depending on whether to show a colourised grid
 * (dev or local only).
 */
export const gridClass = (showGridLayout: boolean) => {
  return {
    'show-grid': showGridLayout && Utils.isDevOrLocal(),
  };
};

/**
 * Collect all the elements in the elements array that match the given columnId
 * @param elements
 * @param columnId
 */
export const collectElementsByColumn = (
  elements: FluidFormElementConfig[],
  columnId: any
): FluidFormElementConfig[] => {
  return elements.filter((el) => el.gridColumn === columnId);
};

/**
 * Collects all the elements into a FluidKeyedObject of where key is row ID and value is the
 * elements for that row.
 * @param elements
 */
export const collectElementsToRows = (
  elements: FluidFormElementConfig[]
): FluidKeyedObject<FluidFormElementConfig[]> => {
  return elements.reduce(
    (
      rowDefinition: FluidKeyedObject<FluidFormElementConfig[]>,
      currentElement: FluidFormElementConfig
    ) => {
      const { gridRow } = currentElement;
      rowDefinition[gridRow] = rowDefinition[gridRow]
        ? [...rowDefinition[gridRow], currentElement]
        : [currentElement];
      return rowDefinition;
    },
    {}
  );
};

/**
 * Determines if a field is hidden from view due to its conditionalOn resolving to false
 * @param elementConfig
 * @param formValue
 * @param externalState
 */
export const conditionalFieldIsHidden = (
  elementConfig: FluidFormElementConfig,
  formValue: any,
  externalState: Record<string, unknown>
) => {
  return elementConfig.conditionalOn
    ? !elementConfig.conditionalOn(formValue, externalState)
    : false;
};

/**
 * Hydrates elementConfig with data from the given formData, if it exists.
 * @param data
 * @param config
 */
export const hydrateConfigFromData = (
  data: any,
  config: FluidFormElementConfig
): FluidFormElementConfig => {
  return data
    ? {
        ...config,
        initialValue: getDataAtPath(
          data,
          null,
          config.dataPath ? config.dataPath : config.controlName
        ),
      }
    : config;
};

/**
 * Validates value provided to "colSpan" or "elementWidth" property is a
 * valid FluidGridItemSize value - if not, returns 12 by default. Used when
 * "colSpan" or "elementWidth" value is being applied to embedded Grid Item.
 * @param width - value provided to "colSpan" or "elementWidth" property
 */
export const getColWidthValue = (width: any): FluidGridItemSize => {
  switch (true) {
    case isNumber(width) && width >= 1 && width <= 12:
    case width === 'auto':
    case width === 'fill':
      return width;
    default:
      return 12;
  }
};

/**
 * NOTE: Only used by "row" layout
 * When all column widths for a single row are numbers: totals all widths, then
 * adds a "filler" COLUMN if the total span doesn't add up to 12. When any column
 * width is "fill" or "auto": automatically adds a "filler" ROW (span 12) after
 * the row to keep it separated from the next row.
 * @param formRow - column definitions for a single Form row
 */
export const applyFillerColumns = (
  formRow: FluidKeyedObject<FormColumnConfig>
): FluidKeyedObject<FormColumnConfig> => {
  const rowValues = Object.values(formRow);

  if (rowValues.some(({ width }) => width === 'fill' || width === 'auto')) {
    // Returns extra "buffer" row (i.e. 12-span column) to offset "fill"/"auto" col sizes
    return { ...formRow, fill: { width: 12, elements: [] } };
  } else {
    const totalForRow = rowValues.reduce((total: number, { width }) => {
      return total + (Number(width) || 0);
    }, 0);
    return totalForRow !== 12
      ? { ...formRow, fill: { width: 12 - totalForRow, elements: [] } }
      : formRow;
  }
};

/**
 * Convert a rowOption definition to a set of column definitions with width and element collection
 * @param rowOption
 * @param elements
 */
export const gatherColumns = (
  rowOption: FluidRowOptions,
  elements: FluidFormElementConfig[]
): FluidKeyedObject<FormColumnConfig> => {
  return rowOption.columnOptions.reduce(
    (
      columnSet: FluidKeyedObject<FormColumnConfig>,
      curr: FluidColumnOptions
    ) => ({
      ...columnSet,
      [curr.columnId]: {
        width: curr.colSpan,
        alignItems: rowOption.alignItems,
        elements: getElementsByRowAndColumn(
          rowOption.rowId,
          curr.columnId,
          elements
        ),
      },
    }),
    {}
  );
};

/**
 * Returns true if a row has any visible elements
 * @param row
 */
export const hasVisibleElements = (row) => {
  const elementsForRow: any[] = Utils.iterate<{
    width: number;
    elements: any[];
  }>(row).reduce((elements: any, curr: { elements: any[] }) => {
    return [...elements, ...curr.elements];
  }, []);
  return elementsForRow.some((el) => !el.hidden);
};

/**
 * Filters the elements array to find the elements belonging to the given gridRow and gridColumn
 * @param gridRow
 * @param gridColumn
 * @param elements
 */
export const getElementsByRowAndColumn = (
  gridRow: number,
  gridColumn: number,
  elements: FluidFormElementConfig[]
) => {
  return elements.filter(
    (el) => el.gridColumn === gridColumn && el.gridRow === gridRow
  );
};

/**
 * Updates a component definitions configuration with any dynamic properties, events or content based on the
 * current form value.
 * @param host
 * @param formState
 * @param config
 */
export const setDynamicComponentProps = (
  host: Partial<FluidForm>,
  formState: FluidFormState,
  config: FluidComponentDefinition
): FluidComponentDefinition => {
  // Set dynamic props based on form value
  if ((config as FluidFormItem).dynamicProps) {
    (config as FluidFormItem).props = {
      ...(config as FluidFormItem).props,
      ...(config as FluidFormItem).dynamicProps(formState.rawValue),
    };
    delete (config as FluidFormItem).dynamicProps;
  }

  // Set dynamic content based on form value
  if ((config as FluidFormItem).dynamicContent) {
    (config as FluidFormItem).content = (
      config as FluidFormItem
    ).dynamicContent(formState.rawValue);
    delete (config as FluidFormItem).dynamicContent;
  }

  // Set dynamic events based on form value
  if ((config as FluidFormItem).dynamicEvents) {
    (config as FluidFormItem).events = [
      ...((config as FluidFormItem).events || []),
      ...(config as FluidFormItem).dynamicEvents(host, formState.rawValue),
    ];
    delete (config as FluidFormItem).dynamicEvents;
  }

  // Set dynamic children based on form state
  if ((config as FluidFormItem).dynamicChildren) {
    (config as FluidFormItem).children = [
      ...(config as FluidFormItem).children,
      ...(config as FluidFormItem).dynamicChildren(formState),
    ];
    delete (config as FluidFormItem).dynamicChildren;
  }
  return config;
};
