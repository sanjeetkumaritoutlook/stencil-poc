import {
  FluidFormElementConfig,
  FluidFormElementState,
  FluidFormElementType,
  FluidFormState,
  FluidInputType,
  FluidKeyedObject,
  FluidTheme,
  FluidThemeInterface,
  FluidToggleConfig,
} from '@lmig/fluid-core';
import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  Watch,
} from '@stencil/core';

import { hasMethod } from '../../utils/forms/form-method.utils';
import { Utils } from '../../utils/utils';

/**
 * @displayName Form Element
 *
 * @internal
 *
 */
@Component({
  tag: 'fluid-form-element',
  styleUrl: 'fluid-form-element.less',
  shadow: true,
})
export class FluidFormElement
  implements ComponentInterface, FluidThemeInterface
{
  // ================================================================ //
  // -- Own Properties

  _elementRef:
    | HTMLFluidInputFieldElement
    | HTMLFluidRadioGroupElement
    | HTMLFluidSelectElement
    | HTMLFluidToggleElement
    | HTMLFluidDatepickerElement
    | HTMLFluidTextAreaElement
    | HTMLFluidFormArrayElement
    | HTMLFluidAddressFormElement;

  // ================================================================ //
  // -- Host Element

  /**
   * Get a reference to the host element
   */
  @Element() host: HTMLFluidFormElementElement;

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

  @Prop({ mutable: true, reflect: true }) disabled: boolean;

  /**
   * The form element configuration to pass to the final rendered element
   */
  @Prop() config: FluidFormElementConfig;

  /**
   * Watch for config changed, and validate if validators change
   * @param newValue - the new configuration
   * @param oldValue - the old configuration
   */
  @Watch('config') onValidationChange(
    newValue: FluidFormElementConfig,
    oldValue: FluidFormElementConfig
  ) {
    if (!Utils.isEqual(newValue?.validation, oldValue?.validation)) {
      this.markTouchedAndValidate().then(() =>
        this.getValue().then((newState) => this.valueChanged.emit(newState))
      );
    }
  }

  // ================================================================ //
  // -- Events

  /**
   * Proxy form element value to parent
   */
  @Event() valueChanged: EventEmitter;

  // ================================================================ //
  // -- Lifecycle Hooks

  /**
   * Called every time the component is connected to the DOM.
   * @action: setGlobalTheme - updates theme to match global theme & subscribes to changes
   */
  connectedCallback(): void {
    Utils.setGlobalTheme(this);
  }

  // ================================================================ //
  // -- Public Methods (Proxies)

  @Method()
  async setValue(value: any, opts?: FluidKeyedObject<any>): Promise<any> {
    return this.config.elementType === FluidFormElementType.TOGGLE
      ? await (this._elementRef as HTMLFluidToggleElement).setValue(
          value,
          opts?.skipDisabledCheck
        )
      : await this._elementRef.setValue(value);
  }
  @Method() async reset(clear = false) {
    await this._elementRef.reset(clear);
  }
  @Method() async getValue() {
    return await this._elementRef.getValue();
  }
  @Method() async markTouchedAndValidate(): Promise<
    { name: any; errors: string[]; valid: boolean } | FluidFormElementState
  > {
    return await this._elementRef.markTouchedAndValidate();
  }
  @Method() async setParentValue(formState: FluidFormState) {
    await this._elementRef.setParentValue(formState);
  }
  @Method() async setDisabled(disabled: boolean) {
    this.config = { ...this.config, disabled };
  }
  @Method() async setConfig(config: FluidFormElementConfig) {
    this.config = { ...config };
    return this.config;
  }
  @Method() async getConfig() {
    return this.config;
  }
  @Method() async getFormAt(idx: number) {
    if (hasMethod(this._elementRef, 'getFormAt'))
      return this._elementRef['getFormAt'](idx);
  }
  @Method() async getNativeInput() {
    return this._elementRef['getNativeInput']();
  }

  // ================================================================ //
  // -- Local Methods

  renderInputSubtype(props) {
    switch (this.config.type) {
      case FluidInputType.CURRENCY:
        return <fluid-currency-field {...props} />;
      default:
        return <fluid-input-field {...props} />;
    }
  }

  renderElement() {
    const props = {
      ref: (el) => (this._elementRef = el),
      config: {
        ...this.config,
        disabled: this.disabled,
      },
      parentState: this.parentState,
      externalState: this.externalState,
      autoValidateChildren: this.autoValidateChildren,
      _standalone: false,
      disabled: this.disabled || this.config.disabled,
      onValueChange: (value: CustomEvent) =>
        this.valueChanged.emit(value.detail),
    };

    switch (this.config.elementType) {
      case FluidFormElementType.INPUT:
        return this.renderInputSubtype(props);
      case FluidFormElementType.DATEPICKER:
        return <fluid-datepicker {...props} />;
      case FluidFormElementType.RADIO_GROUP:
        return <fluid-radio-group {...props} />;
      case FluidFormElementType.SELECT:
        return <fluid-select {...props} />;
      case FluidFormElementType.TEXTAREA:
        return <fluid-text-area {...props} />;
      case FluidFormElementType.TOGGLE:
        return (
          <fluid-toggle {...props} config={props.config as FluidToggleConfig} />
        );
      case FluidFormElementType.ARRAY:
        return (
          <fluid-form-array
            {...props}
            _updateStrategy={this.config.updateStrategy}
          />
        );
      case FluidFormElementType.ADDRESS_FORM:
        return <fluid-address-form {...props} />;
      case FluidFormElementType.COMBO_BOX:
        return <fluid-combo-box {...props} />;
      case FluidFormElementType.RATING:
        return <fluid-rating {...{ ...this.config, ...props }} />;
      default:
        return this.renderInputSubtype(props);
    }
  }

  // ================================================================ //
  // -- Render (Main)

  render() {
    return <Host>{this.renderElement()}</Host>;
  }

  // ================================================================ //
  // -- Internal Props
  //
  // -- Note: This is not a public API - these properties
  // -- should only be used internally by FLUID components.

  /**
   * @internal
   */
  @Prop() parentState: FluidFormState;

  /**
   * @internal
   */
  @Prop() externalState: Record<string, any>;

  /**
   * @internal
   */
  @Prop() autoValidateChildren: boolean;
}
