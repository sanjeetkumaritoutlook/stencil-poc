import {
  FluidConfirmationDialogConfig,
  FluidFieldCustomValidation,
  FluidFlexAlignment,
  FluidFormArrayConfig,
  FluidFormArrayItem,
  FluidFormArrayTranslationOptions,
  FluidFormConfig,
  FluidFormElementInterface,
  FluidFormElementState,
  FluidFormState,
  FluidKeyedObject,
  FluidTheme,
  FluidThemeInterface,
  FluidUpdateStrategy,
} from '@lmig/fluid-core';
import { generateUniqueId } from '@lmig/fluid-core/lib/helpers/string.helpers';
import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Method,
  Prop,
  State,
  VNode,
  Watch,
} from '@stencil/core';

import { InlineInfo } from '../../common/fluid-common-warning.components';
import { useI18n } from '../../providers/fluid-i18n-provider/adapter/fluid-i18n.adapter';
import { FluidI18nStore } from '../../providers/fluid-i18n-provider/store/fluid-i18n.store';
import { EventUtils } from '../../utils/events/event-utils';
import { getValue, validateEntries } from '../../utils/forms/form-method.utils';
import { setInitialElementState } from '../../utils/forms/form-utils';
import { Utils } from '../../utils/utils';
import {
  AddForm,
  CancelNewForm,
  DeleteForm,
  EntryLegend,
  FormErrors,
  SectionTitle,
} from './components/fluid-form-array.components';
import {
  emptyForm,
  getActiveFormAt,
  getActiveForms,
  isFirstActiveForm,
  isLastActiveForm,
  maxEntriesMet,
  showCancel,
  showRemoveAction,
} from './utils/fluid-form-array.utils';

/**
 * @displayName Form Array
 *
 * @contextData A form array can be used when you need to add repeating data entry to a form.
 */
@Component({
  tag: 'fluid-form-array',
  styleUrl: 'fluid-form-array.less',
  shadow: true,
})
export class FluidFormArray
  implements FluidThemeInterface, FluidFormElementInterface
{
  // ================================================================ //
  // -- Host Element

  /**
   * Get a reference to the host element
   */
  @Element() host: HTMLFluidFormArrayElement;

  // ================================================================ //
  // -- Props

  @Prop() config: FluidFormArrayConfig;

  /**
   * Confirmation Dialog default values
   * @default
   */
  @Prop() confirmationDialogCancelConfig: FluidConfirmationDialogConfig;

  // ================================================================ //
  // -- Component State

  @State() _elementState: FluidFormElementState;

  @State() _confirmationDialogOpen = false;

  // ================================================================ //
  // -- Component Events

  /**
   * Emits the element state when its value changes
   */
  @Event() valueChange: EventEmitter<FluidFormElementState>;

  // ================================================================ //
  // -- Validation Variables

  touched = false;
  _parentState: FluidFormState;
  _elementRef: HTMLFluidFormElement;

  /**
   * Watch for config changes on the parent config - if it changes,
   * refresh each form instance.
   * @param newConfig
   * @param oldConfig
   */
  @Watch('config') onConfigChanged(newConfig, oldConfig) {
    if (!Utils.isEqual(newConfig, oldConfig)) {
      Object.keys(this._formRefs).forEach(async (formRef) => {
        await this.refreshFormInstanceAfterConfigChange(formRef, newConfig);
      });
    }
  }

  /**
   * After a config change from above, sets the new updated config and any
   * external state on the child form references, before validating.
   * @param formReference
   * @param newConfig
   */
  async refreshFormInstanceAfterConfigChange(
    formReference: string,
    newConfig: FluidFormArrayConfig
  ) {
    await this._formRefs[formReference]?.setFormConfig({
      ...this.config.formConfig,
      externalState: newConfig.externalState,
    });
    await this._formRefs[formReference]?.markTouchedAndValidate();
    await validateEntries(
      this.host,
      this._elementState,
      this._forms,
      this.entryValidation,
      this._parentState,
      this.config?.externalState
    );
  }

  // ================================================================ //
  // -- Publicly Exposed Methods

  @Method() async setValue(value: any[] = []) {
    if (!Array.isArray(value)) {
      console.debug(
        '🧪 Non-array value passed to setValue in form array',
        value
      );
      value = [];
    }
    value.forEach((newValue, idx: number) => {
      const activeFormId: string = this._forms.find(
        (f) => f.activeIdx === idx
      )?.id;
      if (activeFormId) {
        this._formRefs[activeFormId]
          ?.setFormValue(newValue)
          .then(() => this._formRefs[activeFormId].markTouchedAndValidate());
      } else {
        this.addNewForm(newValue);
      }
    });
    this.refreshElementState();
    return {
      dataPath: this.dataPath,
      changed: true,
      value: this._elementState,
    };
  }

  @Method() async getValue() {
    return getValue(this);
  }
  @Method() async getFormAt(idx: number) {
    return getActiveFormAt(this._forms, idx);
  }

  @Method() async validate() {
    this._elementState = {
      ...this._elementState,
      errors: [],
    };
    return {
      name: this.dataPath,
      errors: (
        await validateEntries(
          this.host,
          this._elementState,
          this._forms,
          this.entryValidation,
          this._parentState,
          this.config?.externalState
        )
      ).errors,
      valid: (this._elementState.errors || []).length === 0,
    };
  }

  @Method() async reset(clear = false) {
    await this.applyMethodToActiveForms('reset', [clear]);
    this._forms.forEach((f, idx) => {
      if (idx !== 0) this.deleteForm(f.id);
    });
    this._elementState = setInitialElementState(
      this.getInitialValue(),
      this.dataPath
    );
    this.setValue(this._elementState.value).then();
    return this._elementState;
  }

  @Method() async markTouchedAndValidate() {
    await this.applyMethodToActiveForms('markTouchedAndValidate', []);
    return this._elementState;
  }

  @Method() async setParentValue(formState: FluidFormState) {
    this._parentState = formState;
  }

  @Method() async getNativeInput() {
    return this._elementRef;
  }

  @State() _forms: FluidFormArrayItem[] = [];
  _formRefs: FluidKeyedObject<HTMLFluidFormElement> = {};

  /**
   * Called every time the component is connected to the DOM.
   * @action: setGlobalTheme - updates theme to match global theme & subscribes to changes
   */
  connectedCallback(): void {
    this._node = undefined;
    Utils.selectiveMapConfigToLocal(this, this.config);
    useI18n.bind(this)({
      init: () => (this._i18nBound = true),
    });
    Utils.setGlobalTheme(this);
    this._elementState = setInitialElementState(
      this.getInitialValue(),
      this.dataPath
    );
    this.setValue(this._elementState.value).then();
  }

  /**
   * Called every time the component is disconnected from the DOM.
   * @action deregisterElement - removes the element from the i18n Store registry
   */
  disconnectedCallback() {
    this._i18nStore?.deregisterElement(this._translateId);
  }

  /**
   * Gets the configured initial value for the form array - if none set, uses the miniumum entry
   * constraint configured to spawn empty form(s) to meet the minimum (default 1)
   */
  getInitialValue() {
    const minimumEntries = this.config?.constraints?.minimumEntries || 1;
    return this.initialValue && !Utils.isEmpty(this.initialValue)
      ? this.initialValue
      : Utils.arrayOf(minimumEntries).map(() =>
          emptyForm(this.config?.formConfig?.elements)
        );
  }

  /**
   * Shorthand to apply any given method, with arguments, to the active forms in the array
   * @param methodName
   * @param args
   */
  async applyMethodToActiveForms(methodName, args) {
    return Promise.all(
      getActiveForms(this._forms)?.map((f) =>
        this._formRefs?.[f.id]?.[methodName](...args)
      )
    );
  }

  /**
   * Adds a new active form to the end of the array
   * @param fromValue
   * @param firstAdded
   * @param count
   */
  addNewForm(fromValue?: object, firstAdded = false, count = 1) {
    const newForm = () => {
      const formId = generateUniqueId();
      return {
        id: formId,
        ref: this.createForm(formId, fromValue, this.config?.entryEvents),
        active: true,
        activeIdx: undefined,
        state: {} as FluidFormState,
      };
    };
    this._forms = [
      ...this._forms,
      ...Utils.arrayOf(count).map(() => newForm()),
    ];
    this.refreshElementState(!firstAdded);
  }

  /**
   * Spawns a new form instance, including reference handling, set state, and event hijacking.
   * @param formId
   * @param fromValue
   * @param eventConfig
   */
  createForm(
    formId,
    fromValue,
    eventConfig?: FluidKeyedObject<Function>
  ): HTMLFluidFormElement {
    const config: FluidFormConfig = {
      ...this.config?.formConfig,
      updateStrategy: this.config?.updateStrategy || FluidUpdateStrategy.INPUT,
      submitConfig: undefined,
      cancelConfig: undefined,
    };
    return (
      <fluid-form
        config={config}
        id={formId}
        fromData={fromValue}
        externalState={this.config?.externalState}
        ref={(formRef) => (this._formRefs[formId] = formRef)}
        onValueChanged={(event) => {
          EventUtils.stopEvent(
            EventUtils.hijackEvent(event, eventConfig, this._formRefs[formId])
          );
        }}
        onFormChanged={(formState) => {
          EventUtils.stopEvent(
            EventUtils.hijackEvent(
              formState,
              eventConfig,
              this._formRefs[formId]
            )
          );
          this.setStateById(formId, formState.detail);
        }}
      />
    );
  }

  /**
   * Sets the given formId to inactive in the array.
   * @param formId
   */
  deleteForm(formId: string) {
    this._forms = this._forms.map((f) => ({
      ...f,
      active: f.id === formId ? false : f.active,
    }));
    this.refreshElementState(true);
  }

  /**
   * Sets the state of the form with the given formId
   * @param formId
   * @param state
   */
  setStateById(formId: any, state: FluidFormState) {
    this._forms = this._forms.map((f) => ({
      ...f,
      state: f.id === formId ? state : f.state,
    }));
    this.refreshElementState(
      this._forms.map((f) => f.state).some((s) => this.anyFieldTouched(s.value))
    );
  }

  /**
   * Returns true if any field in the given form state has been touched.
   * @param value
   */
  anyFieldTouched(value: FluidKeyedObject<FluidFormElementState>) {
    return Utils.iterate<FluidFormElementState>(value)
      .map((v) => v.touched)
      .some((touched) => touched);
  }

  /**
   * Update the element state for this form array element.
   * @param touched
   */
  refreshElementState(touched?: boolean) {
    this.refreshActiveIndex();
    this._elementState = {
      ...this._elementState,
      touched,
      value: getActiveForms(this._forms).map((f) => f.state.redactedValue),
    };
    validateEntries(
      this.host,
      this._elementState,
      this._forms,
      this.entryValidation,
      this._parentState,
      this.config?.externalState
    ).then((newElementState) => {
      this._elementState = { ...newElementState };
      this.valueChange.emit(this._elementState);
    });
  }

  /**
   * Refreshes the active index of the form (i.e, active forms are indexed in order)
   */
  refreshActiveIndex() {
    let activeIdx = 0;
    this._forms = this._forms.map((f) => {
      const mapped = { ...f, activeIdx: f.active ? activeIdx : undefined };
      if (f.active) {
        activeIdx++;
      }
      return mapped;
    });
  }

  /**
   * Main Render function
   */
  render() {
    const componentWrapper = {
      'fluid-form-array': true,
      [this.theme]: true,
    };

    const minimumEntries = this.config?.constraints?.minimumEntries || 1;
    const formStyle = (active) => ({ display: !active && 'none' });
    const lastActiveId = getActiveForms(this._forms)[
      getActiveForms(this._forms).length - 1
    ]?.id;
    const addDisabled =
      this.config?.controlConfig?.add?.disabledByState &&
      this.config?.controlConfig?.add?.disabledByState(this._forms);

    const disabledByInvalidState =
      this.disableAddUntilValid && !this._elementState.valid;

    const controlColSize: number =
      !!this.config?.controlConfig?.add?.label ||
      !!this.config?.controlConfig?.remove?.label ||
      !!this.config?.controlConfig?.cancel?.label
        ? 2
        : 1;
    const formColSize: number = 12 - controlColSize;

    const confirmationDialogStrategy = (open: boolean, id) => {
      if (open) {
        this._confirmationDialogOpen = true;
      } else {
        this.deleteForm(id);
      }
    };

    return (
      <div class={componentWrapper}>
        {/* Form Array Section Title */}
        <SectionTitle
          label={
            this._i18nStore?.translate(this.fluidTranslate?.label) ||
            this.config?.label
          }
          helpText={
            this._i18nStore?.translate(this.fluidTranslate?.helpText) ||
            this.config?.helpText
          }
          sectionDetail={
            this._i18nStore?.translate(this.fluidTranslate?.sectionDetail) ||
            this.config?.sectionDetail
          }
          theme={this.theme}
        />

        {/* Iterate forms in array */}
        {this._forms.map((f) => {
          const lastActiveItem = isLastActiveForm(f.activeIdx, this._forms);
          return [
            <fieldset class="form-array-fieldset" style={formStyle(f.active)}>
              {/* Form Entry Label */}
              <EntryLegend
                entryLabel={this.config?.entryLabel}
                fluidTranslate={this.fluidTranslate}
                index={f.activeIdx}
                i18nStore={this._i18nStore}
                formState={f.state}
              />

              {/* Form Entry */}
              <fluid-grid removeSpacing={true}>
                {/* Form Element(s) */}
                <fluid-grid-item colSm={formColSize}>{f.ref}</fluid-grid-item>

                <fluid-grid-item
                  colSm={controlColSize}
                  class="fieldset-controls"
                >
                  {/* Remove Entry Button */}
                  {!lastActiveItem && (
                    <DeleteForm
                      allowDeleteForm={showRemoveAction(
                        f,
                        minimumEntries,
                        this
                      )}
                      deleteForm={(id) => {
                        confirmationDialogStrategy(
                          !!this.confirmationDialogCancelConfig ||
                            !!this.fluidTranslate?.confirmationDialog,
                          id
                        );
                      }}
                      form={f}
                      fluidTranslate={
                        this.fluidTranslate?.controlConfig?.remove
                      }
                      buttonConfig={this.config?.controlConfig?.remove}
                      theme={this.theme}
                    />
                  )}

                  {/* Cancel Button */}
                  {lastActiveItem && (
                    <CancelNewForm
                      showCancel={() =>
                        showCancel(
                          f,
                          minimumEntries,
                          isLastActiveForm,
                          isFirstActiveForm,
                          this._forms
                        )
                      }
                      form={f}
                      cancelLastForm={() => {
                        confirmationDialogStrategy(
                          !!this.confirmationDialogCancelConfig,
                          lastActiveId
                        );
                      }}
                      theme={this.theme}
                      fluidTranslate={
                        this.fluidTranslate?.controlConfig?.cancel ??
                        this.fluidTranslate?.controlConfig?.remove
                      }
                      buttonConfig={
                        this.config?.controlConfig?.cancel ??
                        this.config?.controlConfig?.remove
                      }
                    />
                  )}
                </fluid-grid-item>
              </fluid-grid>
              {(this.confirmationDialogCancelConfig ||
                this.fluidTranslate?.confirmationDialog) && (
                <fluid-confirmation-dialog
                  open={this._confirmationDialogOpen}
                  message={
                    this._i18nStore?.translate(
                      this.fluidTranslate?.confirmationDialog?.message
                    ) || this.confirmationDialogCancelConfig?.message
                  }
                  cancelLabel={
                    this._i18nStore?.translate(
                      this.fluidTranslate?.confirmationDialog?.cancelLabel
                    ) || this.confirmationDialogCancelConfig?.cancelLabel
                  }
                  confirmLabel={
                    this._i18nStore?.translate(
                      this.fluidTranslate?.confirmationDialog?.confirmLabel
                    ) || this.confirmationDialogCancelConfig?.confirmLabel
                  }
                  fluidTranslate={
                    this.fluidTranslate?.confirmationDialog ||
                    this.confirmationDialogCancelConfig?.fluidTranslate
                  }
                  onCancelled={() => {
                    this._confirmationDialogOpen = false;
                  }}
                  onConfirmed={() => {
                    this._confirmationDialogOpen = false;
                    this.deleteForm(f.id);
                  }}
                  title={
                    this._i18nStore?.translate(
                      this.fluidTranslate?.confirmationDialog?.modalTitle
                    ) ||
                    this.confirmationDialogCancelConfig?.confirmationDialogTitle
                  }
                ></fluid-confirmation-dialog>
              )}
            </fieldset>,

            <fluid-grid removeSpacing={true} style={formStyle(f.active)}>
              {/* Form Errors, Warnings & Info */}
              <fluid-grid-item
                colSm={formColSize}
                alignSelf={FluidFlexAlignment.CENTER}
              >
                <FormErrors
                  showErrors={
                    isLastActiveForm(f.activeIdx, this._forms) &&
                    this._elementState.touched
                  }
                  errors={this._elementState.errors}
                  onShowErrors={() => this.markTouchedAndValidate()}
                />
                <InlineInfo
                  show={
                    addDisabled?.disabled &&
                    !!addDisabled?.showWarning &&
                    isLastActiveForm(f.activeIdx, this._forms)
                  }
                  info={addDisabled?.showWarning}
                />
              </fluid-grid-item>

              <fluid-grid-item
                colSm={controlColSize}
                class="form-array-controls"
              >
                {/* Add New Form Button */}
                <AddForm
                  maxEntriesMet={maxEntriesMet(
                    this._forms,
                    this.config?.constraints?.maximumEntries
                  )}
                  isLast={isLastActiveForm}
                  form={f}
                  fluidTranslate={this.fluidTranslate?.controlConfig?.add}
                  forms={this._forms}
                  addNewForm={() => this.addNewForm()}
                  disabledByState={
                    disabledByInvalidState || addDisabled?.disabled
                  }
                  buttonConfig={this.config?.controlConfig?.add}
                  theme={this.theme}
                />
              </fluid-grid-item>
            </fluid-grid>,
          ];
        })}
      </div>
    );
  }

  // ================================================================ //
  // -- Shadowed Properties

  /**
   * What theme settings should the component use?
   * @type {string}
   */
  @Prop() overrideGlobalTheme: boolean;

  /**
   * If FluidThemeProvider is used, should this component override the
   * global theme with its local theme?
   */
  @Prop() theme: FluidTheme = FluidTheme.CORP;

  /**
   * Is the element disabled
   */
  @Prop() disabled: boolean;

  /**
   * The initial value of the form array - if populated, editable table will be
   * populated, but master form will remain empty.
   */
  @Prop() initialValue: any;

  /**
   * Validators that are applied to the entire active entry set.
   */
  @Prop() entryValidation: FluidFieldCustomValidation[] = [];

  /**
   * If true, the add button will be disabled until the form array is valid.
   * If the form array is valid, but becomes invalid, the add button will disable
   * until it becomes valid again.
   */
  @Prop() disableAddUntilValid: boolean;

  /**
   * The path to the element value in the parent form.
   */
  @Prop({ mutable: true }) dataPath: string;

  /**
   * Displays as a popover on the add button when the inner form has errors to address.
   */
  @Prop() addButtonErrorMessage: string;

  /**
   * @internal - Unused
   */
  _node: VNode;

  /**
   * @internal
   */
  @Prop() _standalone = true;

  /**
   * @internal
   */
  @Prop() _updateStrategy: FluidUpdateStrategy = FluidUpdateStrategy.INPUT;

  /**
   * @internal
   */
  @Prop() parentState: FluidFormState;

  /**
   * @internal
   */
  @Prop() autoValidateChildren: boolean;

  @Watch('parentState') async onParentStateChange(newState: FluidFormState) {
    this._parentState = newState;
    if (this.autoValidateChildren) {
      await this.validate();
    }
  }

  // ================================================================ //
  // -- Internationalisation

  /* @internal */
  @Prop({ mutable: true }) fluidTranslate: FluidFormArrayTranslationOptions;
  private _translateId: string;
  private _i18nStore: FluidI18nStore | undefined;
  @State() _i18nBound: boolean;
}
