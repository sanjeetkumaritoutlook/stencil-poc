import {
  DeprecatedType,
  FluidFieldValidation,
  FluidFormElementState,
  FluidFormElementTranslationOptions,
  FluidFormState,
  FluidLanguage,
  FluidPopoverConfig,
  FluidPrimitive,
  FluidSize,
  FluidTheme,
  FluidThemeInterface,
  isNullOrUndefined,
} from '@lmig/fluid-core';
import { FluidRatingIconSize } from '@lmig/fluid-core/lib/structs/enums/fluid-rating-icon-size.enum';
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

import {
  CancelInput,
  FormLabel,
  Validation,
} from '../../common/fluid-common-form.components';
import { useI18n } from '../../providers/fluid-i18n-provider/adapter/fluid-i18n.adapter';
import { FluidI18nStore } from '../../providers/fluid-i18n-provider/store/fluid-i18n.store';
import {
  getValue,
  markTouchedAndValidate,
  reset,
  setValue,
  update,
  validateElement,
} from '../../utils/forms/form-method.utils';
import {
  elementClass,
  setInitialElementState,
} from '../../utils/forms/form-utils';
import { Utils } from '../../utils/utils';
import {
  RateIconList,
  RateIconListProps,
} from './components/fluid-rating.components';

/**
 * @experimental
 *
 * @displayName Rating
 *
 * @contextData The FLUID Rating component gives users a way to provide feedback quickly & easily in the form of a "star" rating.
 *
 */
@Component({
  tag: 'fluid-rating',
  styleUrl: 'fluid-rating.less',
  shadow: true,
})
export class FluidRating implements ComponentInterface, FluidThemeInterface {
  // ================================================================ //
  // -- Own Properties (Private)
  // ================================================================ //
  // -- Validation Variables

  /**
   * Boolean that tracks whether the form field has received :focus and/or
   * been manipulated since initial page load.
   */
  touched = false;

  /**
   * Reference to the parent FLUID Form state.
   */
  _parentState: FluidFormState;

  /**
   * Reference to the core HTML <input> element.
   */
  _elementRef: HTMLInputElement;

  /**
   * Boolean that tracks whether the form field has received autofocus.
   */
  _autoFocus = false;

  // ================================================================ //
  // -- Host Element

  /**
   * Reference to the host element.
   */
  @Element() host: HTMLFluidRatingElement;

  // ================================================================ //
  // -- States

  /**
   * Derived form field state that tracks value, errors, validity, etc.
   * This common interface is shared among all form fields.
   */
  @State() _elementState: FluidFormElementState;

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
   * A unique name for the field (usually the dataKey for any form using
   * the input element).
   */
  @Prop({ mutable: true }) controlName: string;

  /**
   * Sets the rating value (0 to 5)
   */
  @Prop({ mutable: true }) value: number;
  @Watch('value')
  onValueChanged() {
    if (this.valueEqualsState()) return;
    this._elementState.value = this.validateValue(this.value);
    this.touched = false;
    this.validate().then();
  }

  /**
   * An array of field validation options.
   */
  @Prop({ mutable: true }) validation: FluidFieldValidation[];

  /**
   * If provided, a FLUID Form Label will be rendered above the Input
   * Field with the specified string.
   */
  @Prop({ mutable: true }) label: string;

  /**
   * If true, the Rating will be disabled.
   */
  @Prop({ mutable: true }) disabled: boolean;

  /**
   * If true, the Rating will be in a "readonly" state.
   */
  @Prop({ mutable: true }) readonly: boolean;

  /**
   * If the field is an inline one, remove all margins so it sits
   * nicely in its container.
   */
  @Prop({ mutable: true }) inlineField: boolean;

  /**
   * Default value on first load. NOTE: this Prop is NOT dynamically
   * updated after initial load like the "value" Prop is, & cannot
   * be used to update the form field's value after the first render.
   */
  @Prop({ mutable: true }) initialValue: FluidPrimitive;

  /**
   * Sets the maximum possible value of the rating (default 5).
   */
  @Prop({ mutable: true }) max = 5;

  /**
   * If true, the Rating input will be surrounded by a field border.
   */
  @Prop({ mutable: true }) bordered = false;

  /**
   * If true, displays a "clear" button that resets the form field when
   * clicked. The field's <input> must have a value for button to be
   * visible. Button is NOT displayed when field has "required" validation.
   * NOTE: "bordered" must be true for "clear" button to be visible.
   */
  @Prop({ mutable: true }) allowCancel: boolean;

  /**
   * This sets the icon size, default `md`.
   */
  @Prop({ mutable: true }) iconSize: FluidRatingIconSize = FluidSize.MEDIUM;

  /**
   * If provided, the Form Label will render a "helptext" icon
   * with attached Popover. To render a basic Popover with default
   * Prop values, simply provide the Popover's message as a string
   * value to this Prop. To render a Popover with customized Props,
   * provide a FluidPopoverConfig object to this Prop with the "message"
   * property set. For more information, please see Popover's API
   * documentation.
   */
  @Prop({ mutable: true }) helpText:
    | FluidPopoverConfig
    | DeprecatedType<string>;

  // ================================================================ //
  // -- Events

  /**
   * Emits the element state when its value changes.
   */
  @Event() valueChange: EventEmitter<FluidFormElementState>;

  // ================================================================ //
  // -- Lifecycle Hooks

  /**
   * Called every time the component is connected to the DOM.
   * @action: setGlobalTheme - updates theme to match global theme & subscribes to changes
   */
  connectedCallback(): void {
    Utils.setGlobalTheme(this);
    useI18n.bind(this)({
      language: () => {
        this._lang = this._i18nStore?.getLanguage();
      },
    });
  }

  /**
   * Called every time the component is disconnected from the DOM.
   * @action deregisterElement - removes the element from the i18n Store registry
   */
  disconnectedCallback() {
    this._i18nStore?.deregisterElement(this._translateId);
  }

  /**
   * Called once just after the component is first connected to the DOM.
   */
  componentWillLoad() {
    this.initializeState();
  }

  /**
   * Called when component will be updated due to Prop or State change.
   * @action: updateValue - dynamically update the "value" Prop to match "_elementState.value"
   */
  componentWillUpdate() {
    this.updateValue();
  }

  // ================================================================ //
  // -- Public Methods

  @Method() async setValue(value: number) {
    // If value is undefined, pass along to setValue() so reset() is still called
    return setValue(
      this,
      isNullOrUndefined(value) ? value : this.validateValue(value)
    );
  }

  @Method() async getValue() {
    return getValue(this);
  }

  @Method() async validate() {
    return validateElement(this);
  }

  @Method() async reset(clear = false) {
    return reset(this, clear, () => {
      // If "clear" is true, reset to "0" instead of empty string
      clear && (this._elementState.value = 0);
    });
  }

  @Method() async markTouchedAndValidate() {
    return markTouchedAndValidate(this);
  }

  @Method() async setParentValue(formState: FluidFormState) {
    this._parentState = formState;
  }

  // ================================================================ //
  // -- Local Methods

  /**
   * Determines if "value" parameter is a valid number, is less than or
   * equal to "max", & is greater than or equal to 0. If so, returns
   * the value as a number, if not, returns 0. This ensures that
   * component's values are always numbers (i.e. for "value" Prop &
   * setValue() method).
   * @param value - the value to validate
   */
  validateValue(value: FluidPrimitive): number {
    const parsedValue = parseFloat(value as string);
    return isNaN(parsedValue) || parsedValue > this.max || parsedValue < 0
      ? 0
      : parsedValue;
  }

  /**
   * Returns true if "value" Prop equals "_elementState.value" OR if
   * "_elementState.value" hasn't been initialized (i.e. is undefined) -
   * otherwise, returns false. Used to determine if "value" Prop is
   * out-of-sync with internal state.
   */
  valueEqualsState(): boolean {
    return (
      isNullOrUndefined(this._elementState?.value) ||
      this.value === this._elementState.value
    );
  }

  /**
   * Dynamically updates the "value" Prop to match "_elementState.value".
   * Called every time the component updates/re-renders.
   */
  updateValue(): void {
    if (this.valueEqualsState()) return;
    this.value = this._elementState.value;
  }

  update(value: number) {
    const event = {
      target: {
        value,
      },
    };

    update(this, event);
  }

  resetOrUpdate(value) {
    // skip action for readonly or disabled
    if (this.disabled || this.readonly) return;

    const willReset = value === this._elementState.value;

    if (willReset) {
      this.reset(true);
      this.update(0);
    }

    if (!willReset) {
      this.update(value);
    }
  }

  /**
   * Determines Input Field's default value (if provided), sets up the
   * form field's internal state, & triggers update to "value" Prop.
   */
  initializeState(): void {
    this.initialValue = this.validateValue(this.initialValue ?? this.value);
    this._elementState = setInitialElementState(
      this.initialValue,
      this.controlName
    );
    this.updateValue();
  }

  // ================================================================ //
  // -- Render (Main)

  render() {
    const length = isNaN(this.max) ? 5 : this.max;
    const size = this.iconSize ? this.iconSize : FluidSize.MEDIUM;
    const otherClasses = {
      disabled: this.disabled,
      readonly: this.readonly,
    };

    const styles = elementClass(
      'fluid-rating',
      this.theme,
      this._elementState,
      this.inlineField,
      this.touched,
      otherClasses
    );

    const ratingContainerStyle = {
      ['input-wrapper']: !(this.readonly || !this.bordered),
      ['rating-container']: true,
      ['disabled']: this.disabled,
    };
    const props: RateIconListProps = {
      type: 'star', // TODO icon face and heart support
      value: this._elementState.value,
      disabled: this.disabled,
      readonly: this.readonly,
      length,
      size,
      onClickHandler: (value) => this.resetOrUpdate(value),
    };

    return (
      <div class={styles.componentWrapper}>
        <div class={styles.formGroupClass}>
          <FormLabel host={this} resetPosition={!this.bordered} />
          <div
            class={ratingContainerStyle}
            role="slider"
            tabindex="0"
            aria-valuemin="0"
            aria-valuemax={length}
            aria-valuenow={this._elementState.value}
          >
            <input
              type="hidden"
              name={this._elementState.name}
              value={this._elementState.value}
              ref={(el) => (this._elementRef = el)}
            />
            <RateIconList {...props} />
            {this.bordered && <CancelInput host={this} />}
          </div>
          <Validation host={this} fluidTranslate={this.fluidTranslate} />
        </div>
      </div>
    );
  }

  // ================================================================ //
  // -- Internationalisation

  /* @internal */
  @Prop() fluidTranslate: FluidFormElementTranslationOptions;
  private _translateId: string;
  private _i18nStore: FluidI18nStore | undefined;
  @State() _lang: FluidLanguage = FluidLanguage.ENGLISH;
}
