import {
  element,
  FluidAlignment,
  FluidColumnOptions,
  FluidConfirmationDialogConfig,
  FluidDataLayerComponentConfiguration,
  FluidDependentFieldValidation,
  FluidFieldValidation,
  FluidFieldValidationType,
  FluidFormConfig,
  FluidFormControlConfig,
  FluidFormElementConfig,
  FluidFormElementState,
  FluidFormItem,
  FluidFormLayout,
  FluidFormState,
  FluidKeyedObject,
  FluidRowOptions,
  FluidTheme,
  FluidThemeInterface,
  FluidUpdateStrategy,
  setAtPath,
} from '@lmig/fluid-core';
import { generateUniqueId } from '@lmig/fluid-core/lib/helpers/string.helpers';
import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Method,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import { timer } from 'rxjs';

import {
  FORM_GRID_CONFIG_ERROR,
  INVALID_CONFIG,
  MISSING_GRID_COLUMN_CONFIG,
  MISSING_GRID_ROW_CONFIG,
  NO_CONTROL_NAME,
} from '../../constants/constants';
import { FormItem } from '../../model/typings/fluid-generic.type';
import {
  toControlName,
  validateElement,
} from '../../utils/forms/form-method.utils';
import {
  isComponentDefinition,
  valueChangeShouldEmit,
} from '../../utils/forms/form-utils';
import { Utils } from '../../utils/utils';
import { FluidDataLayerUtils } from '../fluid-data-layer/fluid-data-layer.utils';
import {
  getDataAtPath,
  setDataAtPath,
} from '../fluid-table/internal/fluid-table-data-management.utils';
import {
  FluidFormProps,
  GridLayout,
  GridRowLayout,
  HorizontalLayout,
  RowColumnLayout,
  VerticalLayout,
} from './components/fluid-form-layouts.components';
import {
  applyCacheStates,
  checkDisabledUpdateForCache,
  clearDisabledStateCache,
  clearElementConfigCache,
  DISABLED_CACHE,
  ELEMENT_CACHE,
  FluidFormStateCache,
  formStateCache,
  HIDDEN_FIELDS_CACHE,
  isHiddenCache,
  setInitialCacheAtRender,
  toggleCache,
  updateCache,
} from './util/fluid-form.cache';
import {
  addElementRef,
  conditionalFieldIsHidden,
} from './util/fluid-form.utils';

/**
 * @displayName Form
 *
 * @analyticsAware ['valueChange']
 */
@Component({
  tag: 'fluid-form',
  styleUrl: 'fluid-form.less',
  shadow: true,
})
export class FluidForm implements FluidThemeInterface, ComponentInterface {
  // ================================================================ //
  // -- Own Properties (Private)

  /**
   * Maintains a cache of form states between renders. Used for disabling fields
   * between renders if a field has been manually disabled by consuming application
   */
  _formStateCache: FluidFormStateCache = formStateCache;

  // ================================================================ //
  // -- Host Element

  /**
   * Get a reference to the host element
   */
  @Element() host: HTMLFluidFormElement;

  // ================================================================ //
  // -- States

  @State() _confirmationDialogOpen = false;

  /**
   * Maintains the form state
   */
  @State() _formState: FluidFormState = {};
  @State() _formValid: boolean;
  _stateUpdated: boolean;

  /**
   * Maintain a list of element references for elements in the form. We need this
   * so we can use an overall reset() method, which calls reset() on each individual
   * element
   */
  @State() _elementRefs: {
    el: HTMLFluidFormElementElement;
    dataPath: string;
  }[] = [];

  /**
   * Checks if the form configuration is valid - if not, throws a warning and doesn't
   * render the form. (all elements must have a controlName so we can track form state)
   */
  @State() _formConfigValid: boolean;

  // ================================================================ //
  // -- Props

  /**
   * What theme settings should the component use?
   */
  @Prop({ mutable: true }) theme: FluidTheme = FluidTheme.CORP;

  /**
   * If FluidThemeProvider is used, should this component override the
   * global theme with its local theme?
   */
  @Prop({ mutable: true }) overrideGlobalTheme: boolean;

  /**
   * If we want the form elements in the form to have initial values set
   * from an object, pass that object through this prop - useful for editing
   * objects in an iteration
   */
  @Prop() fromData: object;
  @Watch('fromData')
  async watchFromDataHandler(newValue: object, oldValue: object) {
    if (!this.enableWatchers.fromData) return;
    if (!Utils.isEqual(newValue, oldValue)) {
      await this.setFormValue(newValue);
    }
  }

  /**
   * Optionally enable watchers
   */
  @Prop() enableWatchers?: { fromData: boolean } = { fromData: false };

  /**
   * Overall configuration for the form elements, including form layout
   */
  @Prop({ mutable: true }) config: FluidFormConfig<FormItem>;

  /**
   * If true, the entire form will be disabled, including actions. Please note, when this is
   * set to true, using `setDisabled(false)` on the instance will NOT override. This prop takes
   * precedence over cache and instance methods.
   */
  @Prop({ mutable: true, reflect: true }) disabled: boolean;

  /**
   * A unique name for the form, to be used as part of element IDs, etc
   */
  @Prop() formName: string = generateUniqueId();

  /**
   * What layout should the form use.
   */
  @Prop() layout: FluidFormLayout;

  /**
   * If using grid layout, this prop defines the number of columns and their width
   */
  @Prop() columnOptions?: FluidColumnOptions[];

  /**
   * If using row layout, this prop defines the number of rows and their columnOptions
   */
  @Prop() rowOptions?: FluidRowOptions[];

  /**
   * The elements to include in the form
   */
  @Prop({ mutable: true }) elements: FluidFormItem[];

  /**
   * Configuration values for the submit button
   */
  @Prop() submitConfig?: FluidFormControlConfig;

  /**
   * Configuration values for the submit button
   */
  @Prop() cancelConfig?: FluidFormControlConfig;

  /**
   * Confirmation Dialog default values
   */
  @Prop() confirmationDialogCancelConfig?: FluidConfirmationDialogConfig = {
    confirmationDialogTitle: 'Are you sure?',
    message: 'The information entered will be lost',
    confirmLabel: 'Ok',
    cancelLabel: 'Cancel',
  };

  /**
   * Controls alignment of the submit/cancel buttons
   */
  @Prop() controlsAlignment: FluidAlignment;

  /**
   * If true, the grid layout will be colourised to aid debugging
   * (NB: Will NOT be shown on non-local environment)
   */
  @Prop() showGridLayout: boolean;

  /**
   * If true, the form will get its state and emit it on first render
   */
  @Prop() emitOnRender = true;

  /**
   * Allows the form to be given external state, perhaps from another form,
   * where it can read information from for dynamic config, values, etc.
   */
  @Prop() externalState: FluidKeyedObject<unknown>;

  // ================================================================ //
  // -- Events

  /**
   * Emits the element state of a single element within in the form
   * whenever it changes
   */
  @Event() valueChanged: EventEmitter;

  /**
   * Emits the entire form state whenever an element within changes it,
   * this form state includes raw value, as well as element state for each
   * changed element, overall form validity, and a list of errors if invalid.
   */
  @Event() formChanged: EventEmitter;

  /**
   * Emits when one of the form action buttons is clicked. Forms are limited
   * to a SUBMIT or a CANCEL action, which each have a FLUID-defined function,
   * but actionKey and button text are configurable to allow parent component
   * to react if either is clicked.
   */
  @Event() actionClicked: EventEmitter;

  // ================================================================ //
  // -- Lifecycle Hooks

  /**
   * Called every time the component is connected to the DOM.
   * @action: setGlobalTheme - updates theme to match global theme & subscribes to changes
   */
  connectedCallback(): void {
    Utils.setGlobalTheme(this);
    this.validateElements();
  }

  /**
   * Called once just after the component is first connected to the DOM.
   * When component will load, selectively map config, and set
   * the cache with initial config so undefined cache doesn't
   * override configured values.
   */
  componentWillLoad(): Promise<void> | void {
    Utils.selectiveMapConfigToLocal(this.host, this.config);
    this.validateElements();
    setInitialCacheAtRender(this);
  }

  /**
   * Called once just after the component fully loaded and the first render() occurs.
   */
  componentDidLoad() {
    if (this.emitOnRender) {
      this.updateFormValue();
    }
    this.setupAnalytics();
  }

  /**
   * Called BEFORE every render().
   */
  componentWillRender() {
    this.setDynamicConfig();
    this.setDynamicValues();
    Utils.selectiveMapConfigToLocal(this.host, this.config);
    this.validateElements();
    this._elementRefs = [];
  }

  /**
   * Called AFTER every render().
   */
  componentDidRender() {
    if (this.emitOnRender && this._stateUpdated) {
      this.getFormRawValue().then((formValue) => {
        const { value, rawValue, errors } = formValue;
        this.formChanged.emit({
          value,
          rawValue,
          errors,
          redactedValue: this.getRedactedValue(Utils.iterate(value)),
          valid: Object.keys(errors).length === 0,
          touched: Utils.iterate<FluidFormElementState>(value)
            .map((v) => v.touched)
            .some((t) => t),
        } as FluidFormState);
        this._stateUpdated = false;
      });
    }
  }

  // ================================================================ //
  // -- Public Methods

  /**
   * Utility method to set a forms config from above, once it has already been set via
   * a prop
   * @param newConfig
   */
  @Method()
  async setFormConfig(newConfig: FluidFormConfig<FormItem>) {
    this.config = { ...newConfig };
  }

  /**
   * Resets each individual element (using their own reset() method), clears the
   * _elementRefs state array (restored when the form re-renders due to state change)
   * and resets the forms state.
   */
  @Method()
  async reset(clear = false) {
    await this._elementRefs.forEach((elRef) => elRef.el.reset(clear));
    this._elementRefs = [];
    this._formState = {
      ...this._formState,
      value: {},
      rawValue: {},
      partialValue: {},
    };
  }

  /**
   * Forcefully refreshes the form, and its state.
   */
  @Method()
  async refresh() {
    this._formState = { ...this._formState };
  }

  /**
   * Returns the underlying HTML element for a particular form element, by configured dataPath
   * @param dataPath
   */
  @Method() async getNativeInput(dataPath: string) {
    return this._elementRefs
      .find((el) => el.dataPath === dataPath)
      ?.el?.getNativeInput();
  }

  /**
   * Marks every element in the form as touched before running the configured validation on
   * each, and displaying whatever validation errors occur.
   */
  @Method()
  async markTouchedAndValidate() {
    this._stateUpdated = true;
    await Promise.all(
      this._elementRefs.map((elRef) => elRef.el.markTouchedAndValidate())
    );
    this.updateFormValue();
    return this.getFormState();
  }

  /**
   * Sets the overall form value to the given data. Uses recursive function to get information at
   * nested levels in the data object, based on the dataPath of each element.
   * @param fromData
   */
  @Method()
  async setFormValue(fromData: any) {
    this.fromData = fromData;
    await Promise.all(
      this._elementRefs.map((elRef) =>
        elRef.el.setValue(getDataAtPath(fromData, null, elRef.dataPath))
      )
    );
  }

  /**
   * Sets the value of a specific element (based on the dataPath) to the given value
   * @param dataPath
   * @param value
   */
  @Method()
  async setElementValue(dataPath: string, value: any) {
    const el = this._elementRefs.find((el) => el.dataPath === dataPath);
    await el?.el.setValue(value);
    this._formState = await this.getFormRawValue();
    this.updateHiddenFields(this._formState);
    return Promise.resolve(this._formState);
  }

  /**
   * Allows to get the inner reference to one of the forms elements, so that you can treat
   * it as a standalone reference, whilst still in the context of the parent form (for executing
   * methods, listening to events, etc)
   * @param dataPath
   * @advancedTechnique
   */
  @Method()
  async getElementRef(dataPath): Promise<HTMLFluidFormElementElement> {
    return this._elementRefs.find((elRef) => elRef.dataPath === dataPath)?.el;
  }

  /**
   * Updates the configuration for a specific element (based on the dataPath) to either a single key/value,
   * or, for more than one property at a time, using a partial configuration object.
   * @param dataPath
   * @param key
   * @param value
   * @param configObj
   * @param andValidate
   */
  @Method()
  async setElementConfig(
    dataPath: string,
    key: string,
    value: any,
    configObj?: Partial<FluidFormElementConfig>,
    andValidate = false
  ): Promise<Partial<FluidFormElementConfig>> {
    const elementRef = this._elementRefs.find((el) => el.dataPath === dataPath);
    const configUpdate = configObj ? configObj : { [key]: value };
    const currentConfig = await elementRef?.el.getConfig();
    const newConfig = { ...currentConfig, ...configUpdate };

    await elementRef?.el.setConfig(newConfig);

    if (andValidate) {
      await timer(500);
      await elementRef.el.markTouchedAndValidate();
      await this.updateFormValue();
    }
    toggleCache(this, ELEMENT_CACHE, true);
    updateCache(this, elementRef.dataPath, ELEMENT_CACHE, newConfig);
    checkDisabledUpdateForCache(
      this,
      key,
      value,
      configObj,
      elementRef.dataPath
    );
    return Promise.resolve(newConfig);
  }

  /**
   * Returns the current form state.
   * @param id
   */
  @Method()
  async getFormState(id?: number) {
    const { value, rawValue, errors, partialValue, redactedValue } =
      await this.getFormRawValue();
    return {
      id,
      value,
      rawValue,
      errors,
      partialValue,
      redactedValue,
      valid: Object.keys(errors).length === 0,
    } as FluidFormState;
  }

  /**
   * Sets the entire form, or a specific element (based on dataPath) as either disabled, or
   * enabled based on the first parameter.
   * @param disabled
   * @param dataPath
   */
  @Method()
  async setDisabled(disabled: boolean, dataPath?: string) {
    toggleCache(this, DISABLED_CACHE, true);

    if (dataPath) {
      const elementRef = this._elementRefs.find(
        (el) => el.dataPath === dataPath
      );
      updateCache(this, dataPath, DISABLED_CACHE, disabled);
      return elementRef?.el?.setDisabled(disabled);
    } else {
      this._elementRefs.forEach((elRef) => {
        updateCache(this, elRef.dataPath, DISABLED_CACHE, disabled);
        elRef.el?.setDisabled(disabled);
      });
    }
  }

  @Method()
  async validateAllElements() {
    await this._elementRefs.map((elRef) => validateElement(elRef.el));
    this.updateFormValue();
    return this.getFormState();
  }

  /**
   * Returns the form to its original configured state, removing any updates to element
   * config (unless retainConfigUpdates parameter is true) and disabled state.
   * @param retainConfigUpdates
   */
  @Method()
  async restoreOriginalConfiguration(retainConfigUpdates?: boolean) {
    if (!retainConfigUpdates) {
      toggleCache(this, ELEMENT_CACHE, false);
      this.elements = clearElementConfigCache(this);
    }
    toggleCache(this, DISABLED_CACHE, false);
    this.elements = clearDisabledStateCache(this);
  }

  // ================================================================ //
  // -- Local Methods

  /**
   * Returns the external state to use for dynamic config
   * and values, where applicable
   * @param element
   */
  getExternalState(element: FluidFormElementConfig) {
    return (
      element.externalState || this.config?.externalState || this.externalState
    );
  }

  /**
   * Updates any element who has dynamicConfig with the result
   * of its function based on current formstate.
   */
  setDynamicConfig() {
    const newConfig = {
      ...this.config,
      elements:
        this.config?.elements?.map((el: FluidFormItem) => {
          if (!isComponentDefinition(el) && !!el.dynamicConfig) {
            return element({
              ...el,
              ...el.dynamicConfig(
                this._formState?.rawValue,
                this.getExternalState(el)
              ),
            });
          } else {
            return el;
          }
        }) || [],
    };
    this.config = newConfig as FluidFormConfig;
  }

  /**
   * Updates any elements value with the result of its dynamicValue function
   * if it exists - note, this will only work on readonly or disabled fields, by design.
   */
  setDynamicValues() {
    this.config?.elements.forEach((el: FluidFormItem) => {
      if (!isComponentDefinition(el) && !!el.dynamicValue) {
        const elRef = this._elementRefs.find(
          (elRef) => elRef.dataPath === el.dataPath
        )?.el;
        if (elRef && (el.readonly || el.disabled)) {
          const newValue = el.dynamicValue(this._formState?.rawValue);
          elRef.getValue().then((elementState: FluidFormElementState) => {
            if (elementState.value != newValue) {
              elRef.getValue().then((elementState: FluidFormElementState) => {
                const newValue = el.dynamicValue(
                  this._formState?.rawValue,
                  this.getExternalState(el)
                );
                if (elementState.value !== newValue) {
                  elRef
                    .setValue(newValue, { skipDisabledCheck: true })
                    .then(() => {
                      this.getFormRawValue().then((formState) => {
                        this.formChanged.emit(formState);
                      });
                    });
                }
              });
            }
          });
        }
      }
    });
  }

  /**
   * Applies a control name to whatever elements don't.
   */
  validateElements() {
    this.elements = (this.elements || []).map(
      (element: FluidFormElementConfig) => {
        if (!isComponentDefinition(element)) {
          element.controlName = this.deriveControlName(element);
          if (!element.dataPath) {
            element.dataPath = element.controlName;
          }
        }
        return element;
      }
    );
  }

  deriveControlName(element: FluidFormElementConfig) {
    const warnAndReturn = (
      returnType: string,
      element: FluidFormElementConfig,
      valueUsed: string,
      skipWarning?: boolean
    ) => {
      if (!skipWarning) {
        Utils.consoleWarn(
          this.host,
          NO_CONTROL_NAME(returnType, element, valueUsed)
        );
        if (returnType === 'random') {
          Utils.consoleWarn(this.host, INVALID_CONFIG);
        }
      }
      return valueUsed;
    };
    switch (true) {
      case !!element.controlName:
        return element.controlName;
      case !!element.dataPath:
        return warnAndReturn('dataPath', element, element.dataPath, true);
      case !!element.label:
        return warnAndReturn('label', element, toControlName(element.label));
      default:
        return warnAndReturn('random', element, generateUniqueId());
    }
  }

  validateDependentFields(changedField: string) {
    this.elements
      .filter((el: FluidFormElementConfig) => {
        return el.validation?.some((val: FluidFieldValidation) => {
          return (
            val.type === FluidFieldValidationType.DEPENDENT &&
            (val as FluidDependentFieldValidation).dependentField
              .controlName === changedField
          );
        });
      })
      .forEach((dependent: FluidFormElementConfig) => {
        const elementRef = this._elementRefs.find(
          (ref) => ref.dataPath === dependent.dataPath
        );
        elementRef?.el.markTouchedAndValidate();
      });
  }

  /**
   * If any output formatting exists in the configuration, run it when outputting the value to the
   * form state.
   * @param value
   * @param dataPath
   */
  applyOutputFormatting(value: unknown, dataPath: string) {
    const config = (
      this.elements.filter(
        (el) => !isComponentDefinition(el)
      ) as FluidFormElementConfig[]
    ).find((el) => {
      return el.dataPath === dataPath;
    });
    return this.shouldApplyFormatting(config, config?.updateStrategy)
      ? config.outputFormat.formatter(value)
      : value;
  }

  /**
   * Determine whether to apply the formatting at this level - if applyInline is true, the formatting will
   * already have been applied at the component level.
   * @param config
   * @param updateStrategy
   */
  shouldApplyFormatting(
    config: FluidFormElementConfig,
    updateStrategy: FluidUpdateStrategy
  ) {
    return (
      config &&
      config.outputFormat &&
      config.outputFormat.formatter &&
      (!config.outputFormat.applyInline ||
        updateStrategy?.toUpperCase() !== FluidUpdateStrategy.BLUR)
    );
  }

  getFormRawValue(): Promise<FluidFormState> {
    return Promise.all(this._elementRefs.map((ref) => ref.el?.getValue())).then(
      (values: FluidFormElementState[]) => {
        let rawValue = {};
        let partialValue = {};
        const value = {};
        let errors: FluidKeyedObject<string[]> = this._formState.errors || {};
        values.forEach((elementState: FluidFormElementState) => {
          const formattedValue = this.applyOutputFormatting(
            elementState.value,
            elementState.dataPath
          );
          rawValue = setDataAtPath(
            rawValue,
            null,
            formattedValue,
            elementState.dataPath
          );
          value[elementState.name] = {
            ...elementState,
            value: formattedValue,
            hidden: isHiddenCache(this, elementState.dataPath),
          };
          errors = this.setFormErrors(elementState, errors);
          if (elementState.value) {
            partialValue = setDataAtPath(
              partialValue,
              null,
              formattedValue,
              elementState.dataPath
            );
          }
        });
        this._formValid = Object.keys(errors).length === 0;
        return {
          rawValue,
          value,
          errors,
          partialValue,
          redactedValue: this.getRedactedValue(values),
          valid: Object.keys(errors).length === 0,
          touched: values.map((v) => v.touched).some((t) => t),
        };
      }
    );
  }

  getRedactedValue(values: FluidFormElementState[]): Record<string, unknown> {
    const getValue = (dataPath: string) =>
      values.find((val) => val.dataPath === dataPath);
    return this.elements.reduce(
      (redactedValue: {}, element: FluidFormElementConfig) => {
        if (
          !isHiddenCache(this, element.dataPath) &&
          !isComponentDefinition(element)
        ) {
          const formattedValue = this.applyOutputFormatting(
            getValue(element.dataPath)?.value,
            element.dataPath
          );
          redactedValue = setAtPath(
            redactedValue,
            formattedValue,
            element.dataPath
          );
        }
        return redactedValue;
      },
      {}
    );
  }

  /**
   * Updates the forms value.
   */
  updateFormValue() {
    this.getFormRawValue().then((formState) => {
      this.updateHiddenFields(formState);
      this.getFormRawValue().then((formState) => {
        this.setStateAndEmit(
          formState.value,
          formState.rawValue,
          formState.errors,
          formState.redactedValue
        );
      });
    });
  }

  /**
   * Update the hidden field cache whenever a value changes in the
   * form that may affect the visibility of the field
   * @param formState
   */
  updateHiddenFields(formState: FluidFormState) {
    this.elements.forEach((element: FluidFormElementConfig) => {
      if (!isComponentDefinition(element)) {
        updateCache(
          this,
          element.dataPath,
          HIDDEN_FIELDS_CACHE,
          conditionalFieldIsHidden(
            element,
            formState.rawValue,
            this.getExternalState(element)
          )
        );
      }
    });
  }

  setStateAndEmit(
    value: { [key: string]: FluidFormElementState },
    rawValue: Record<string, unknown>,
    errors: FluidKeyedObject<string[]>,
    redactedValue: Record<string, unknown>
  ) {
    this._formState = {
      ...this._formState,
      value,
      rawValue,
      redactedValue,
      errors,
      valid: Object.keys(errors).length === 0,
    };
    this.formChanged.emit(this._formState);
    if (!this.autoValidateChildren) {
      this._elementRefs.forEach((ref) =>
        ref.el.setParentValue(this._formState)
      );
    }
  }

  setFormErrors(
    elementState: FluidFormElementState,
    errors: FluidKeyedObject<string[]>
  ) {
    if (elementState.errors?.length > 0) {
      errors[elementState.name] = elementState.errors;
    } else {
      delete errors[elementState.name];
    }
    return this.clearConditionalFieldErrors(errors);
  }

  /**
   * Removes any validation errors thrown by conditional fields who are not currently considered
   * in the form due their conditionalOn resolving to false;
   * @param errors
   */
  clearConditionalFieldErrors(errors: FluidKeyedObject<string[]>) {
    const hiddenConditionalFields = this.elements.filter(
      (e: FluidFormElementConfig) => isHiddenCache(this, e.dataPath)
    );
    return Object.keys(errors).reduce(
      (final: FluidKeyedObject<string[]>, key: string) => {
        if (
          !hiddenConditionalFields.find(
            (e: FluidFormElementConfig) =>
              e.controlName === key || e.dataPath === key
          )
        ) {
          final[key] = errors[key];
        }
        return final;
      },
      {}
    );
  }

  validateGridLayout() {
    const hasOptionsConfigured = !!this.columnOptions;
    const allElementsHaveGridColumn = this.elements.every(
      (el) => !!el.gridColumn
    );
    switch (false) {
      case hasOptionsConfigured:
        Utils.consoleWarn(this.host, FORM_GRID_CONFIG_ERROR);
        break;
      case allElementsHaveGridColumn:
        Utils.consoleWarn(this.host, MISSING_GRID_COLUMN_CONFIG);
        break;
    }
    return hasOptionsConfigured && allElementsHaveGridColumn;
  }

  /**
   * Collect all the props we need for our functional layout components.
   */
  getFormProps() {
    return {
      formValue: this._formState.rawValue,
      disabled: this.disabled,
      autoValidateChildren: this.autoValidateChildren,
      elements: applyCacheStates(this, this.elements),
      fromData: this.fromData,
      showGridLayout: this.config?.showGridLayout,
      onValueChanged: (event: CustomEvent<FluidFormElementState>) =>
        this.onValueChanged(event),
      addElementRef: (el: HTMLFluidFormElementElement, dataPath: string) =>
        addElementRef(this, dataPath, el),
      columnOptions: this.columnOptions,
      rowOptions: this.rowOptions,
      formName: this.formName,
      updateStrategy: this.config?.updateStrategy,
      reset: () => {
        if (!this.cancelConfig?.displayDialogBeforeAction) {
          return this.reset(this.cancelConfig?.clearForm);
        }
        if (this.cancelConfig?.displayDialogBeforeAction) {
          this._confirmationDialogOpen = true;
        }
      },
      onActionClicked: (action: FluidFormControlConfig) => {
        this.getFormRawValue().then((updatedValue) => {
          this.actionClicked.emit({
            actionKey: action.actionKey,
            data: updatedValue,
          });
        });
      },
      actionClicked: this.actionClicked,
      formState: this._formState,
      submitConfig: this.submitConfig,
      cancelConfig: this.cancelConfig,
      formValid: this._formValid,
      host: this.host as HTMLFluidFormElement,
      controlsAlignment: this.controlsAlignment,
      externalState: this.externalState,
      getExternalState: (element) => this.getExternalState(element),
    } as FluidFormProps;
  }

  configUsesRows() {
    const allElementsHaveRows = this.elements.every((e) => !!e.gridRow);
    if (this.elements.some((e) => !!e.gridRow) && !allElementsHaveRows) {
      Utils.consoleWarn(this.host, MISSING_GRID_ROW_CONFIG);
    }
    return allElementsHaveRows;
  }

  onValueChanged(valueChange: CustomEvent<FluidFormElementState>) {
    if (
      !valueChangeShouldEmit(
        valueChange.detail,
        this._formState?.value?.[valueChange.detail.name]
      )
    ) {
      this._stateUpdated = true;
      const { name, dataPath } = valueChange.detail;
      this.validateDependentFields(dataPath || name);
      this.updateFormValue();
      this.valueChanged.emit(valueChange.detail);
    }
  }

  // ================================================================ //
  // -- Render (Partials)

  /**
   * Renders a grid layout, so long as the config has columnOptions, otherwise, will default
   * to a vertical (stacked) form
   */
  renderGridLayoutForm() {
    if (this.validateGridLayout()) {
      return this.configUsesRows() ? (
        <GridRowLayout {...this.getFormProps()} disabled={this.disabled} />
      ) : (
        <GridLayout {...this.getFormProps()} disabled={this.disabled} />
      );
    } else {
      return (
        <VerticalLayout {...this.getFormProps()} disabled={this.disabled} />
      );
    }
  }

  renderForm() {
    if (!this.config || this.elements.length === 0) {
      Utils.selectiveMapConfigToLocal(this.host, this.config);
    } else {
      switch (this.layout) {
        case FluidFormLayout.VERTICAL:
          return (
            <VerticalLayout {...this.getFormProps()} disabled={this.disabled} />
          );
        case FluidFormLayout.HORIZONTAL:
          return (
            <HorizontalLayout
              {...this.getFormProps()}
              disabled={this.disabled}
            />
          );
        case FluidFormLayout.GRID:
          return this.renderGridLayoutForm();
        case FluidFormLayout.ROW:
          return (
            <RowColumnLayout
              {...this.getFormProps()}
              disabled={this.disabled}
            />
          );
        default:
          return (
            <VerticalLayout {...this.getFormProps()} disabled={this.disabled} />
          );
      }
    }
  }

  // ================================================================ //
  // -- Render (Main)

  render() {
    const componentWrapper = {
      'fluid-form': true,
      [this.theme]: true,
      inline: this.inline,
    };

    const {
      message,
      confirmationDialogTitle,
      cancelLabel,
      confirmLabel,
      fluidTranslate,
    } = this.confirmationDialogCancelConfig;
    return (
      <div class={componentWrapper}>
        {this.renderForm()}
        {this.cancelConfig?.displayDialogBeforeAction && (
          <fluid-confirmation-dialog
            open={this._confirmationDialogOpen}
            message={message}
            fluidTranslate={fluidTranslate}
            cancelLabel={cancelLabel}
            confirmLabel={confirmLabel}
            onCancelled={() => {
              this._confirmationDialogOpen = false;
            }}
            onConfirmed={() => {
              this._confirmationDialogOpen = false;
              this.reset(this.cancelConfig?.clearForm);
            }}
            title={confirmationDialogTitle}
          ></fluid-confirmation-dialog>
        )}
      </div>
    );
  }

  // ================================================================ //
  // -- Internal Props
  //
  // -- Note: This is not a public API - these properties
  // -- should only be used internally by FLUID components.

  /**
   * If the element should be configured at a component level for the FLUID data layer,
   * this configuration dictates how it should be instrumented
   * @internal
   * @experimental
   */
  @Prop() analyticsConfig: FluidDataLayerComponentConfiguration;
  parentLayerId: string;
  setupAnalytics() {
    this.parentLayerId = FluidDataLayerUtils.getClosestDataLayer(this.host)?.id;
  }

  /**
   * If true, margin will be removed as form is inline with
   * another element
   * @internal
   */
  @Prop() inline = false;

  /**
   * If true, anytime the parent form state changes, the children will
   * auto force validation.
   */
  @Prop() autoValidateChildren = false;
}
