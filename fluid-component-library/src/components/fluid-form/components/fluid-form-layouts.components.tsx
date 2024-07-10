import {
  FluidAlignment,
  FluidColumnOptions,
  FluidComponentDefinition,
  FluidFlexAlignment,
  FluidFormControlConfig,
  FluidFormElementConfig,
  FluidFormElementType,
  FluidFormState,
  FluidGridItemSize,
  FluidKeyedObject,
  FluidRowOptions,
  FluidSize,
  FluidUpdateStrategy,
} from '@lmig/fluid-core';
import { EventEmitter, h } from '@stencil/core';

import { FluidComponent } from '../../../common/fluid-component-rendering.components';
import { FORM_HORIZONTAL_CONFIG_ERROR } from '../../../constants/constants';
import { isComponentDefinition } from '../../../utils/forms/form-utils';
import { Utils } from '../../../utils/utils';
import {
  applyFillerColumns,
  collectElementsToRows,
  conditionalFieldIsHidden,
  FORM,
  FORM_COLUMN_ID,
  FORM_ELEMENT_GRID_ID,
  FORM_ELEMENT_ID,
  FORM_OUTER_GRID,
  FORM_ROW_COLUMN_ID,
  FORM_ROW_ID,
  gatherColumns,
  getColWidthValue,
  getElementsByRowAndColumn,
  gridClass,
  hasVisibleElements,
  hydrateConfigFromData,
  setDynamicComponentProps,
} from '../util/fluid-form.utils';
import { FormControls } from './fluid-form-controls.components';

// ================================================================ //
// -- Interfaces

export interface FluidFormProps {
  formName?: string;
  disabled?: boolean;
  elements?: FluidFormElementConfig[];
  showGridLayout?: boolean;
  columnOptions?: FluidColumnOptions[];
  rowOptions?: FluidRowOptions[];
  fromData?: any;
  formState?: FluidFormState;
  updateStrategy?: FluidUpdateStrategy;

  onValueChanged?: Function;
  addElementRef?: Function;
  reset?: Function;

  submitConfig?: FluidFormControlConfig;
  cancelConfig?: FluidFormControlConfig;
  additionalActions?: FluidFormControlConfig[];
  controlsAlignment?: FluidAlignment;

  onActionClicked?: (action: FluidFormControlConfig) => void;
  actionClicked?: EventEmitter;

  formValid?: boolean;
  gridId?: string;

  host?: HTMLFluidFormElement;
  externalState?: FluidKeyedObject<any>;
  autoValidateChildren?: boolean;
  getExternalState?: (element) => FluidKeyedObject<any>;
}

export interface FluidFormElementProps extends FluidFormProps {
  elementWidth?: FluidGridItemSize;
  hidden?: boolean;
  config?: FluidFormElementConfig;
  type?: FluidFormElementType;
  externalState?: FluidKeyedObject<any>;
  alignItems?: FluidFlexAlignment;
}

/**
 * Config for single column within "row" layout (i.e. entire Form's rows
 * are stored as array of FluidKeyedObject<FormColumnConfig>).
 */
export interface FormColumnConfig {
  width: FluidGridItemSize;
  elements: FluidFormElementConfig[];
  alignItems?: FluidFlexAlignment;
}

// ================================================================ //
// -- Functional Components

export const RowColumnLayout = (props: FluidFormProps) => {
  const {
    elements,
    showGridLayout,
    rowOptions,
    onValueChanged,
    fromData,
    addElementRef,
    formName,
    formState,
    host,
    externalState,
    autoValidateChildren,
    getExternalState,
    disabled,
  } = props;

  const rows: FluidKeyedObject<FormColumnConfig>[] = rowOptions.map((row) =>
    gatherColumns(row, elements)
  );

  const fields = (columnConfig: FormColumnConfig) => {
    const { elements, alignItems } = columnConfig;

    return elements.map((el: FluidFormElementConfig) => {
      const hydratedConfig = hydrateConfigFromData(fromData, el);
      return (
        <FormItem
          onValueChanged={(event) => onValueChanged(event)}
          config={hydratedConfig}
          autoValidateChildren={autoValidateChildren}
          externalState={externalState}
          getExternalState={getExternalState}
          formName={formName}
          disabled={disabled}
          gridId={FORM_ROW_COLUMN_ID(el.gridColumn, el.gridRow, formName)}
          host={host}
          elementWidth={hydratedConfig.elementWidth}
          addElementRef={addElementRef}
          formState={formState}
          alignItems={alignItems}
        />
      );
    });
  };

  return [
    <fluid-grid key="row-layout" class={gridClass(showGridLayout)}>
      {rows.map(
        (formRow: FluidKeyedObject<FormColumnConfig>, rowId: number) => {
          const filled = applyFillerColumns(formRow);

          return Object.keys(filled).map((columnId) => {
            const column: FormColumnConfig = filled[columnId];
            const dataAttrFluidId = FORM_ROW_COLUMN_ID(
              columnId,
              rowId + 1,
              formName
            );

            return column.elements?.length !== 1 ? (
              <fluid-grid-item
                col={12}
                colSm={getColWidthValue(column.width)}
                data-fluid-id={dataAttrFluidId}
                class={{
                  'has-multiple-elements': !!column.elements?.length,
                  'filler-column': columnId === 'fill',
                  hidden: !hasVisibleElements(formRow),
                }}
              >
                {fields(column)}
              </fluid-grid-item>
            ) : (
              fields({
                ...column,
                elements: column.elements.map((el) => ({
                  ...el,
                  elementWidth: column.width,
                })),
              })
            );
          });
        }
      )}
    </fluid-grid>,
    <FormControls {...props} />,
  ];
};

/**
 * Renders a grid layout with configured rows, each with the same
 * column options, which are defined at form configuration level.
 *
 * Array order matters in columns, but not rows, nor overall.
 *
 * ie.
 *  { name: 'Element One', gridColumn: 3, gridRow: 3 },
 *  { name: 'Element Two', gridColumn: 1, gridRow: 2 },
 *  { name: 'Element Three', gridColumn: 2, gridRow: 3 },
 *  { name: 'Element Four', gridColumn: 1, gridRow: 1 },
 *  { name: 'Element Five', gridColumn: 3, gridRow: 2 }
 *
 * Elements one and three will be rendered in row 3, in columns 3 and 2 respectively,
 * despite element one being first in the array.
 *
 * Element four will be rendered in row 1, in column 1 (essentially, the first element),
 * despite being fourth in the array.
 *
 * Elements two and five will be rendered in row 2, in columns 1, and 3 respectively. Column
 * 2 will be left blank.
 *
 * @param props: FluidFormProps
 *
 * @constructor
 */
export const GridRowLayout = (props: FluidFormProps) => {
  const {
    elements,
    showGridLayout,
    columnOptions,
    onValueChanged,
    fromData,
    addElementRef,
    formName,
    formState,
    host,
    externalState,
    autoValidateChildren,
    getExternalState,
  } = props;

  return [
    Utils.arrayOf(Object.keys(collectElementsToRows(elements)).length + 1).map(
      (_, idx) => {
        return (
          idx > 0 && (
            <fluid-grid
              key="grid-row-layout"
              data-fluid-id={FORM_ROW_ID(idx, formName)}
              class={{
                ...gridClass(showGridLayout),
                'no-vertical-margin': true,
              }}
            >
              {columnOptions.map((column: FluidColumnOptions) => {
                return (
                  <fluid-grid-item
                    col={12}
                    colLg={getColWidthValue(column.colSpan)}
                    data-fluid-id={FORM_ROW_COLUMN_ID(
                      column.columnId,
                      idx,
                      formName
                    )}
                  >
                    <fluid-grid class={gridClass(showGridLayout)}>
                      {getElementsByRowAndColumn(
                        idx,
                        column.columnId,
                        elements
                      ).map((element) => {
                        const hydratedConfig = hydrateConfigFromData(
                          fromData,
                          element
                        );
                        return (
                          <FormItem
                            externalState={externalState}
                            autoValidateChildren={autoValidateChildren}
                            onValueChanged={(event) => onValueChanged(event)}
                            config={hydratedConfig}
                            getExternalState={getExternalState}
                            formName={formName}
                            host={host}
                            elementWidth={hydratedConfig.elementWidth}
                            addElementRef={addElementRef}
                            formState={formState}
                          />
                        );
                      })}
                    </fluid-grid>
                  </fluid-grid-item>
                );
              })}
            </fluid-grid>
          )
        );
      }
    ),
    <FormControls {...props} />,
  ];
};

/**
 * Renders a grid layout form, with elements defined by column - array order
 * matters within column arrays, but not overall.
 *
 * ie.
 *  { name: 'Element One', gridColumn 3 },
 *  { name: 'Element Two', gridColumn 1 },
 *  { name: 'Element Three', gridColumn 2 },
 *  { name: 'Element Four', gridColumn 1 },
 *  { name: 'Element Five', gridColumn 3 }
 *
 *  Elements one and five, will be rendered in that order, in column 3, despite
 *  element one being first in the array.
 *
 *  Elements two and four, will be rendered in that order, in column 1, despite
 *  not being at the start of the array.
 *
 *  Element three will be rendered in column 2.
 *
 * @param props: FluidFormProps
 *
 * @constructor
 */
export const GridLayout = (props: FluidFormProps) => {
  const {
    elements,
    showGridLayout,
    columnOptions,
    onValueChanged,
    fromData,
    addElementRef,
    formName,
    formState,
    host,
    externalState,
    autoValidateChildren,
    getExternalState,
  } = props;

  const getElementsByColumn = (gridColumn: number) =>
    elements.filter((el) => el.gridColumn === gridColumn);

  return [
    <fluid-grid
      key="grid-column-layout"
      data-fluid-id={FORM_OUTER_GRID(formName)}
      class={gridClass(showGridLayout)}
    >
      {columnOptions.map((column: FluidColumnOptions) => {
        return (
          <fluid-grid-item
            col={12}
            colLg={getColWidthValue(column.colSpan)}
            data-fluid-id={FORM_COLUMN_ID(column.columnId, formName)}
          >
            <fluid-grid class={gridClass(showGridLayout)}>
              {getElementsByColumn(column.columnId).map(
                (element: FluidFormElementConfig) => {
                  const hydratedConfig = hydrateConfigFromData(
                    fromData,
                    element
                  );
                  return (
                    <FormItem
                      onValueChanged={(event) => onValueChanged(event)}
                      config={hydratedConfig}
                      getExternalState={getExternalState}
                      autoValidateChildren={autoValidateChildren}
                      externalState={externalState}
                      formName={formName}
                      host={host}
                      elementWidth={hydratedConfig.elementWidth}
                      addElementRef={addElementRef}
                      formState={formState}
                    />
                  );
                }
              )}
            </fluid-grid>
          </fluid-grid-item>
        );
      })}
    </fluid-grid>,
    <FormControls {...props} />,
  ];
};

/**
 * Validates that every element is configured with an elementWidth, then renders
 * a horizontal form, where each element follows the other, unless no room left
 * on current row, in which case, move to next row.
 *
 * If some elements aren't configured with elementWidth, throw a warning and
 * render a vertical form instead.
 *
 * @param props: FluidFormProps;
 *
 * @constructor
 */
export const HorizontalLayout = (props: FluidFormProps) => {
  const { elements, showGridLayout, formName } = props;
  if (
    elements.every((element: FluidFormElementConfig) => !!element.elementWidth)
  ) {
    return [
      <fluid-grid
        key="horizontal-layout"
        class={gridClass(showGridLayout)}
        data-fluid-id={FORM_OUTER_GRID(formName)}
      >
        <FormElementSet {...props} />
      </fluid-grid>,
      <FormControls {...props} removeSpacing />,
    ];
  } else {
    Utils.consoleWarn(FORM(formName), FORM_HORIZONTAL_CONFIG_ERROR);
    return <VerticalLayout {...props} />;
  }
};

/**
 * Renders a vertical layout form, where each element is given an elementWidth
 * of 12, so the entire form stacks.
 * @param props
 * @constructor
 */
export const VerticalLayout = (props: FluidFormProps) => {
  const { showGridLayout } = props;
  const toVertical = (elements) =>
    elements.map((el) => ({ ...el, elementWidth: 12 }));
  return [
    <fluid-grid
      key="vertical-layout"
      class={gridClass(showGridLayout)}
      grid-item-spacing={FluidSize.XX_SMALL}
    >
      <FormElementSet {...props} elements={toVertical(props.elements)} />
    </fluid-grid>,
    <FormControls {...props} removeSpacing />,
  ];
};

/**
 * Hydrates each elements config with any applicable data from the given model, then iterates
 * and renders a FormElement for each.
 * @param props
 * @constructor
 */
export const FormElementSet = (props: FluidFormProps) => {
  const {
    elements,
    onValueChanged,
    fromData,
    addElementRef,
    formName,
    formState,
    host,
    updateStrategy,
    externalState,
    autoValidateChildren,
    getExternalState,
    disabled,
  } = props;
  return elements.map((element) => {
    const hydratedConfig = hydrateConfigFromData(fromData, element);
    return (
      <FormItem
        externalState={externalState}
        onValueChanged={(event) => onValueChanged(event)}
        autoValidateChildren={autoValidateChildren}
        updateStrategy={updateStrategy || hydratedConfig.updateStrategy}
        config={hydratedConfig}
        getExternalState={getExternalState}
        formName={formName}
        host={host}
        disabled={disabled}
        elementWidth={hydratedConfig.elementWidth}
        addElementRef={addElementRef}
        formState={formState}
      />
    );
  });
};

/**
 * Determines if the current element is a component definition (i.e non-form element) or a form element configuration
 * and returns the appropriate render function.
 * @param props
 * @constructor
 */
export const FormItem = (props: FluidFormElementProps) => {
  return isComponentDefinition(props.config) ? (
    <RenderedComponent {...props} />
  ) : (
    <FormElement {...props} />
  );
};

/**
 * Creates a non-form element from a component definition (applying any elementWidth or conditionalOn functions
 * as if it were a form element)
 * @param props
 * @constructor
 */
export const RenderedComponent = (props: FluidFormElementProps) => {
  const {
    elementWidth,
    config,
    formName,
    formState,
    gridId,
    host,
    getExternalState,
    alignItems,
  } = props;

  const elementStyle = {
    [`align-items align-items-${alignItems}`]: !!alignItems,
    hidden: conditionalFieldIsHidden(
      config,
      formState.rawValue,
      getExternalState(config)
    ),
  };

  const dataAttrFluidId =
    gridId ?? FORM_ELEMENT_GRID_ID(FORM_ELEMENT_ID(formName, config), formName);

  return (
    <fluid-grid-item
      col={12}
      colSm={getColWidthValue(elementWidth)}
      class={elementStyle}
      data-fluid-id={dataAttrFluidId}
    >
      <FluidComponent
        definition={setDynamicComponentProps(
          host,
          formState,
          config as FluidComponentDefinition
        )}
      />
    </fluid-grid-item>
  );
};

/**
 * Renders the grid item, applying any hidden class to the field if it is configured
 * with a conditionalOn which resolves to false.
 */
export const FormElement = (props: FluidFormElementProps) => {
  const {
    elementWidth,
    config,
    onValueChanged,
    addElementRef,
    formName,
    formState,
    gridId,
    updateStrategy,
    externalState,
    autoValidateChildren,
    getExternalState,
    alignItems,
    disabled,
  } = props;

  const hydrateConfig = () =>
    formName
      ? {
          ...config,
          updateStrategy,
          id: FORM_ELEMENT_ID(formName, config),
        }
      : config;

  /**
   * If the element hasn't got external state already configured,
   * use the form level external state if it exists
   * @param config
   */
  const applyExternalState = (config: FluidFormElementConfig) => {
    if (!config.externalState) {
      config.externalState = externalState;
    }
    return config;
  };

  const alignment =
    alignItems ??
    (config.elementType === FluidFormElementType.TOGGLE &&
      FluidFlexAlignment.CENTER);

  const elementStyle = {
    [`align-items align-items-${alignment}`]: !!alignment,
    hidden:
      config.elementType === FluidFormElementType.HIDDEN ||
      conditionalFieldIsHidden(
        config,
        formState.rawValue,
        getExternalState(config)
      ),
  };

  const dataAttrFluidId =
    gridId ?? FORM_ELEMENT_GRID_ID(FORM_ELEMENT_ID(formName, config), formName);

  return (
    <fluid-grid-item
      col={12}
      colSm={getColWidthValue(elementWidth)}
      class={elementStyle}
      data-fluid-id={dataAttrFluidId}
    >
      <fluid-form-element
        ref={(el) => addElementRef(el, config.dataPath)}
        parentState={formState}
        disabled={disabled || config.disabled}
        autoValidateChildren={autoValidateChildren}
        config={applyExternalState(hydrateConfig())}
        onValueChanged={(valueChange: CustomEvent) =>
          onValueChanged(valueChange)
        }
      />
    </fluid-grid-item>
  );
};
