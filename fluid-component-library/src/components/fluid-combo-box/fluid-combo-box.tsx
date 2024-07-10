import {
  FluidAlignment,
  FluidComboBoxConfig,
  FluidFieldValidation,
  FluidFormElementState,
  FluidFormElementTranslationOptions,
  FluidFormState,
  FluidInputMaskingConfig,
  FluidKeyedObject,
  FluidLanguage,
  FluidOption,
  FluidOptionLookupConfig,
  FluidPopoverConfig,
  FluidSortOrder,
  FluidTextOverflow,
  FluidTheme,
  FluidThemeInterface,
  isNullOrUndefined,
} from '@lmig/fluid-core';
import {
  escapeRegExp,
  generateUniqueId,
} from '@lmig/fluid-core/lib/helpers/string.helpers';
import { createPopper, Instance } from '@popperjs/core';
import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Listen,
  Method,
  Prop,
  State,
  Watch,
  writeTask,
} from '@stencil/core';

import {
  FocusIndicator,
  FormElementWrapper,
} from '../../common/fluid-common-form.components';
import {
  DropdownMenu,
  DropdownMenuOptionsList,
} from '../../common/fluid-dropdown-menu.components';
import {
  translateOptions,
  translateProperty,
  useI18n,
} from '../../providers/fluid-i18n-provider/adapter/fluid-i18n.adapter';
import { FluidI18nStore } from '../../providers/fluid-i18n-provider/store/fluid-i18n.store';
import {
  ARROW_DOWN,
  ARROW_UP,
  BACKSPACE,
  DELETE,
  ENTER,
  ESCAPE,
  EventUtils,
  TAB,
} from '../../utils/events/event-utils';
import {
  getFormInputId,
  getValue,
  handleAutoFocus,
  markTouchedAndValidate,
  resetFocus,
  validateElement,
} from '../../utils/forms/form-method.utils';
import { setInitialElementState } from '../../utils/forms/form-utils';
import { togglePopperListeners } from '../../utils/popperjs/popperjs.utils';
import { Utils } from '../../utils/utils';
import { hasError } from '../../utils/validation/validation.utils';
import {
  Chip,
  ComboBoxControls,
} from './components/fluid-combo-box.components';
import {
  applyMasking,
  clearMaskingDelay,
  gatherRetainedOptions,
  getMaskedLabel,
  getSelectedOptionValues,
  initializeOptions,
  parseActiveQueryFromValue,
  reset,
  scrollOptionIntoView,
  setActiveDescendantId,
  setValue,
  update,
  validateMasking,
  validateSelected,
} from './utils/fluid-combo-box.utils';

/**
 * @displayName Combo Box
 *
 * @contextData FLUID Combo Box is a Form Element that can best be described as a hybrid between a text input & a select element (i.e. dropdown menu). It differs from a text input in that it has a defined list of options to choose from that are displayed in a dropdown menu. It also differs from a select element in that it allows dropdown menu options to be filtered dynamically and can allow multiple options to be selected simultaneously (if multiSelect Prop is true).
 * <br/><br/>
 * FLUID Combo Box should be used instead of FLUID Select when more than 10-15 options are available to choose from that could be difficult to navigate via scrolling alone. It should also be used when multiple options need to be selected simultaneously, or when arbitrary input needs to be accepted in addition to the pre-defined dropdown menu options.
 */
@Component({
  tag: 'fluid-combo-box',
  styleUrl: 'fluid-combo-box.less',
  shadow: true,
})
export class FluidComboBox implements ComponentInterface, FluidThemeInterface {
  // ================================================================ //
  // -- Own Properties

  /**
   * If true, all @Watch methods are temporarily disabled to allow
   * "Utils.selectiveMapConfigToLocal()" to run without triggering
   * unintended re-renders.
   */
  private _disableWatch = true;

  /**
   * Unique IDs for dropdown menu accessibility.
   */
  private _menuId: string = generateUniqueId();
  private _listId: string = generateUniqueId();

  /**
   * PopperJS instance for dropdown menu.
   */
  private _popperInstance: Instance;

  /**
   * Reference to the dropdown menu container element (NOTE: "@ts-ignore"
   * is required because the reference is set externally via a functional
   * component & read externally in Combo Box's utils).
   */
  //@ts-ignore
  private _menuRef: HTMLElement;

  /**
   * Reference to the component's outer container that holds the embedded
   * input. Used by PopperJS as "reference" element.
   */
  private _containerRef: HTMLElement;

  /**
   * Object containing references to all option elements within the dropdown
   * menu. Each key is an option's relative index (i.e. index respective to
   * visibility), and each value is an option's HTMLElement reference.
   */
  private _optionRefs: FluidKeyedObject<HTMLElement> = {};

  /**
   * The current number of options visible in the dropdown menu. Fluctuates
   * based on number of options that match the active query string (i.e.
   * the value typed into the <input>).
   */
  private _visibleOptionCount = 0;

  /**
   * If true, characters have been manually typed into Combo Box's <input>.
   * Indicates that user is actively filtering options shown in dropdown menu.
   */
  _activeQuery = false;

  /**
   * The last option to be interacted with in the dropdown menu (i.e. the
   * currently active/highlighted option). Only relevant to multi-select Combo
   * Box. Used to retain the current "active" position in the dropdown menu when
   * an option is unselected (otherwise, the active position would "jump" to the
   * last selected option).
   */
  _lastTouchedOption: FluidOption;

  /**
   * Array that stores the value(s) of initially selected option(s) AFTER
   * validation. Used in "reset" method when "clear" param is false.
   */
  _validatedInitialValue: string[];

  /**
   * If grouped options exist, stores string values of each group label.
   * Used to render option groups.
   */
  _optGroupLabels: string[];

  /**
   * Boolean that indicates whether "initializeState()" has been run with a
   * populated "options" array (i.e. options.length > 0). If "options" array
   * is empty/undefined on first render, this Prop will cause "initializeState()"
   * to be run again (instead of "updateState()") when "options" array changes.
   */
  _stateInitialized = false;

  /**
   * Debounced function that calls "optionLookup.lookup()" to dynamically
   * populate an Async Combo Box's options.
   */
  _debouncedLookup: Function;

  /**
   * Array of FluidOption objects that represent the currently selected
   * options in an Async Combo Box (i.e. "optionLookup" is defined). Selected
   * options are added to this array to separate them from the "_options" array
   * & prevent them from being cleared/overwritten when new options are pulled
   * in from "_debouncedLookup()". Retained options in "_retainedOptions" are
   * displayed within the dropdown menu when there is no "active query" (i.e.
   * the embedded <input> element is empty), & are also used to "highlight"
   * options in the dropdown menu when there IS an "active query".
   */
  _retainedOptions: FluidOption[] = [];

  /**
   * String of user input characters from the last "active query". Used
   * by Async Combo Box to prevent <input> & dropdown menu jumps/glitches.
   */
  _retainedInputValue = '';

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
   * Reference to the core HTML <input/> element.
   */
  _elementRef: HTMLInputElement;

  /**
   * Boolean that tracks whether the form field has received autofocus
   */
  _autoFocus = false;

  // ================================================================ //
  // -- Host Element

  /**
   * Reference to the host element.
   */
  @Element() host: HTMLFluidComboBoxElement;

  // ================================================================ //
  // -- Internationalisation

  /* @internal */
  @Prop() fluidTranslate: FluidFormElementTranslationOptions & {
    emptyListMessage?: string;
  };
  private _translateId: string;
  private _i18nStore: FluidI18nStore | undefined;
  @State() _lang: FluidLanguage = FluidLanguage.ENGLISH;

  // ================================================================ //
  // -- States

  /**
   * Derived form field state that tracks value, errors, validity, etc.
   * This common interface is shared among all form fields.
   */
  @State() _elementState: FluidFormElementState;

  /**
   * Derived state of "options" array. This allows us to manipulate
   * option properties (e.g. visibility, selected status, etc.) without
   * actually changing the original Prop array.
   */
  @State() _options: FluidOption[];

  /**
   * Boolean that tracks whether the dropdown menu is open or closed.
   */
  @State() _menuOpen = false;

  /**
   * Boolean that tracks whether the form field currently has :focus.
   */
  @State() _hasFocus = false;

  /**
   * Number that tracks the index of option that currently has :focus when
   * navigating via keyboard. Necessary to simulate :focus since the
   * dropdown menu options can't actually receive :focus. Negative number
   * indicates that none of the options has :focus.
   */
  @State() _activeIndex = -1;

  /**
   * Boolean that controls whether masking is currently applied to <input>
   * value (single-select) or "custom input" chips (multi-select).
   */
  @State() _maskingActive = false;

  @State() _optionsUpdating = false;

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
   * The valid options available to the form field. Rendered in a list
   * within the dropdown menu. Must be provided for component to function.
   */
  @Prop({ mutable: true }) options: FluidOption[];

  @Watch('options')
  onOptionsChanged(newOpts: FluidOption[], oldOpts: FluidOption[]) {
    // Disable while "Utils.selectiveMapConfigToLocal()" is running so that we can
    // control the timing of when "initializeState()" or "updateState()" is called.
    if (this._disableWatch) return;

    switch (true) {
      // If the new "options" array is equal (deep equality) to the old "options" array, terminate
      case Utils.isEqual(newOpts, oldOpts):
        return;
      // If the "options" array is being populated for the first time, re-run "initializeState()"
      case !this._stateInitialized && !this._elementState?.value:
        this.initializeState();
        return;
      // If none of the other cases are true, update the form field state with the new options
      default:
        this.updateState();
    }
  }

  /**
   * Sets up async lookup functionality
   */
  @Prop({ mutable: true }) optionLookup: FluidOptionLookupConfig;

  @Watch('optionLookup')
  onOptionLookupChanged(
    newValue: FluidOptionLookupConfig,
    oldValue: FluidOptionLookupConfig
  ) {
    if (!Utils.isEqual(newValue, oldValue)) {
      this.createAsyncLoader();
    }
  }

  /**
   * If true, multiple options can be selected simultaneously. If false,
   * only one option can be selected at a time.
   */
  @Prop({ mutable: true }) multiSelect = false;

  /**
   * Whether Combo Box will accept arbitrary input that is not included
   * in the array of available options.
   */
  @Prop({ mutable: true }) allowCustomInput = false;

  /**
   * TODO: Remove "internal" flag after usage examples & walkthrough guide are created
   * TODO: Add changelog update after "internal" flag is removed
   *
   * When provided, adds additional criteria to Combo Box's default filtering
   * algorithm (i.e. filter by "label" & "group.label" only). The callback
   * provided to this Prop will be run against every option in the dropdown
   * menu each time a key press occurs within the embedded input element. The
   * callback receives the current value of the embedded input (activeQuery)
   * & the current option that is being tested (option), & should return a
   * boolean value that will determine whether the option is hidden or
   * shown in the dropdown menu.
   * @internal
   */
  @Prop({ mutable: true }) customFilter: (
    activeQuery: string,
    option: FluidOption
  ) => boolean;

  /**
   * If provided, applies masking function to selected "custom input"
   * option(s) when Combo Box loses :focus after specified delay. Masking is
   * applied visually to either the value displayed within the <input>
   * (single-select) or the text displayed within selected "custom input"
   * chips (multi-select). Masking is ONLY applied to "custom input", so
   * `allowCustomInput` Prop MUST be true.
   */
  @Prop({ mutable: true }) maskingConfig: FluidInputMaskingConfig;

  /**
   * If specified, options will be displayed in ascending/descending order
   * in the dropdown list rather than being displayed in the order they're
   * specified in the options Prop.
   */
  @Prop({ mutable: true }) sortOrder: FluidSortOrder;

  @Watch('sortOrder')
  onSortOrderChanged() {
    this._options = initializeOptions(this);
    this.updateOptions();
  }

  /**
   * A unique name for the field (usually the dataKey for any form using
   * the input element).
   */
  @Prop({ mutable: true }) controlName: string;

  /**
   * Values of the option(s) that should be selected by default. If a
   * string is provided, it will be converted into a single-item array.
   * *NOTE: default selected options can also be specified using the
   * "selected" property of the FluidOptions provided to the "options" Prop.
   */
  @Prop({ mutable: true }) initialValue: string | string[];

  /**
   * Combo Box's current value. This Prop is dynamically updated to
   * reflect the form element's current state - it can be used as a
   * "synchronous" alternative to the public async "getValue()" method.
   * When provided on first load, this Prop will set Combo Box's default
   * selected option. After the component has been rendered, changes to this Prop will
   * update the form field's value (similar to "setValue()" method). NOTE:
   * "initialValue" will override this Prop on first load if both Props
   * are provided.
   */
  @Prop({ mutable: true }) value: string | string[];

  @Watch('value')
  async onValueChanged() {
    if (this._disableWatch) return;

    if (!!this.optionLookup && !this._stateInitialized) {
      await this.handleAsyncLookup(parseActiveQueryFromValue(this.value));
    }

    switch (true) {
      // If "value" Prop is equal to "_elementState.value" (or "_stateInitialized" is false), terminate
      case this.valueEqualsState():
        return;
      // If "value" Prop is null, undefined, or is an empty string/array, reset the form field
      case isNullOrUndefined(this.value, true) || !this.value.length:
        this.reset(true);
        break;
      // Otherwise, validate that value is associated with an existing option & update "_elementState.value"
      default: {
        if (this.optionLookup) {
          await this.handleAsyncLookup(parseActiveQueryFromValue(this.value));
        }
        const validatedValues = validateSelected(
          this,
          !Array.isArray(this.value) ? [this.value] : this.value,
          this._options
        );

        this.touched = false;
        this._elementState = {
          ...this._elementState,
          value: validatedValues,
          touched: this.touched,
        };
        !!this.optionLookup &&
          (this._retainedOptions = gatherRetainedOptions(
            this._options,
            validatedValues
          ));

        this.updateOptions();
        applyMasking(this, true);
        this.validate().then();
      }
    }
  }

  /**
   * If provided, a FLUID Form Label will be rendered above the Combo Box
   * with the specified string.
   */
  @Prop({ mutable: true }) label: string;

  /**
   * Sets the Form Label's text overflow behavior. By default, overflowing
   * label text will be truncated with ellipsis.
   */
  @Prop({ mutable: true }) labelTextOverflow: FluidTextOverflow;

  /**
   * If provided, a supplementary muted label will be displayed after the
   * primary Form Label.
   */
  @Prop({ mutable: true }) supplementaryLabel: string;

  /**
   * Optional placeholder text to display within Combo Box's <input>.
   */
  @Prop({ mutable: true }) placeholder: string;

  /**
   * If true, Combo Box's <input> & dropdown menu will be disabled.
   */
  @Prop({ mutable: true }) disabled = false;

  /**
   * If true, Combo Box's <input> will be "readonly" & dropdown menu
   * will be disabled.
   */
  @Prop({ mutable: true }) readonly = false;

  /**
   * An array of field validation options. Combo Box currently supports
   * "required" & "custom" field validation. **NOTE: Combo Box's
   * "form element state" stores selected option values in an array. When
   * using "custom" validation, the "value" parameter of "validatorFn" will
   * be an array (NOT a string).**
   */
  @Prop({ mutable: true }) validation: FluidFieldValidation[];

  /**
   * If provided, Combo Box's Form Label will render a "helptext" icon
   * with attached Popover. To render a basic Popover with default
   * Prop values, simply provide the Popover's message as a string
   * value to this Prop. To render a Popover with customized Props,
   * provide a FluidPopoverConfig object to this Prop with the "message"
   * property set. For more information, please see Popover's API
   * documentation.
   */
  @Prop({ mutable: true }) helpText: string | FluidPopoverConfig;

  /**
   * Removes the form field's default bottom margin.
   */
  @Prop({ mutable: true }) inlineField: boolean;

  /**
   * If true, displays a "clear" button that resets the form field when
   * clicked. At least one option must be selected for button to be visible.
   * Button is NOT displayed when field has "required" validation.
   */
  @Prop({ mutable: true }) allowCancel = true;

  /**
   * When true, default auto-highlight functionality is disabled
   * (i.e. the first option in the dropdown list will NOT automatically
   * be highlighted for selection when menu opens & while typing).
   */
  @Prop({ mutable: true }) disableAutoHighlight = false;

  /**
   * When true, Combo Box's dropdown menu will dynamically expand its
   * width based on the text content of its options (i.e. the menu's
   * width is allowed to extend past the edge of the component). When
   * false, the dropdown menu's width will match the overall width of
   * the component, regardless of the size of its options. NOTE: this
   * Prop is automatically enabled when Combo Box is used within FLUID Table.
   */
  @Prop({ mutable: true }) dynamicMenuWidth = false;

  /**
   * If true, this field will automatically have focus on page load.
   * Note: only one form field should have "autoFocus" set to true
   * on a page. Multiple fields with "autoFocus: true" can/will cause
   * unexpected behavior.
   */
  @Prop({ mutable: true }) autoFocus = false;

  /**
   * Message displayed when none of Combo Box's options match the
   * current user input (i.e. all options have been "filtered out"
   * of the dropdown menu).
   */
  @Prop({ mutable: true }) emptyListMessage = 'No Results';

  /**
   * Allows Combo Box Props to be set via a single configuration object.
   */
  @Prop() config: FluidComboBoxConfig;

  @Watch('config')
  onConfigChanged() {
    const existingOpts = this.options;
    const existingValue = this.value;

    // NOTE: sets "_disableWatch: true" under the hood
    Utils.selectiveMapConfigToLocal(this, this.config, ['value']);

    // Re-enable @Watch() methods
    this._disableWatch = false;

    // Since @Watch() methods are disabled while "selectiveMapConfigToLocal()" runs
    // (i.e. to control timing of "initializeState()" or "updateState()"), we need
    // to manually run "onOptionsChanged()" AFTER mapping is done.
    this.onOptionsChanged(this.options, existingOpts);

    // If "config.value" has been updated, manually run "onValueChanged()" AFTER
    // "onOptionsChanged()" is done to ensure that the new "options" are in place.
    !Utils.isEqual(this.value, existingValue) && this.onValueChanged();
  }

  // ================================================================ //
  // -- Events

  /**
   * Emits the element state when its value changes
   */
  @Event() valueChange: EventEmitter<FluidFormElementState>;

  // ================================================================ //
  // -- Lifecycle Hooks

  /**
   * Called every time the component is connected to the DOM.
   * @action: selectiveMapConfigToLocal - set local Props to "config" values
   * @action: setGlobalTheme - Sets the global theme
   * @action: setZIndex - Set component z-index relative to global base value
   */
  connectedCallback(): void {
    Utils.selectiveMapConfigToLocal(this, this.config, ['value']);
    Utils.setGlobalTheme(this);
    Utils.setZIndex(this.host);
    useI18n.bind(this)({
      init: () => this.applyTranslations(),
      language: () => this.applyTranslations(),
    });
  }

  /**
   * Called once just after the component is first connected to the DOM.
   * @action: initializeState - sets the initial form element state on first load
   */
  async componentWillLoad() {
    this.createAsyncLoader();
    if (!!this.optionLookup && (!!this.initialValue || !!this.value)) {
      await this.handleAsyncLookup(
        parseActiveQueryFromValue(this.initialValue ?? this.value)
      );
    }
    this.initializeState();
    this._autoFocus = this.autoFocus;
    this.resetActiveIndex();
    validateMasking(this);
  }

  /**
   * Called once just after the component fully loaded and the first render() occurs.
   * @action: _disableWatch - re-enable @Watch methods
   * @action: createPopperInstance - initialize PopperJS
   */
  componentDidLoad() {
    this._disableWatch = false;
    this.createPopperInstance();
  }

  /**
   * Called AFTER every render().
   */
  componentDidRender() {
    handleAutoFocus(this);
  }

  /**
   * Called when component will be updated due to Prop or @State change.
   * @action: clear all references to option elements before re-render
   * @action: updateValue - dynamically update the "value" Prop to match "_elementState.value"
   * @action: createPopperInstance - initialize PopperJS (if not already initialized)
   * @action: update - update PopperJS instance before upcoming render
   */
  componentWillUpdate() {
    this._optionRefs = {};
    this.updateValue();

    !this._popperInstance
      ? this.createPopperInstance()
      : this._popperInstance?.update().then();
  }

  /**
   * Called just after the component updates. It's never called during the first render().
   * @action: _disableWatch - re-enable @Watch methods
   * @action: setActiveDescendantId - set "aria-activedescendant" attr on <input>
   */
  componentDidUpdate() {
    this._disableWatch = false;
    setActiveDescendantId(this);
  }

  /**
   * Called every time the component is disconnected from the DOM.
   * @action: destroy - remove PopperJS instance
   * @action: deregisterElement - removes the element from the i18n Store registry
   */
  disconnectedCallback() {
    this._popperInstance?.destroy();
    delete this._popperInstance;
    this._i18nStore?.deregisterElement(this._translateId);
  }

  // ================================================================ //
  // -- Event Listeners

  /**
   * Listener for :focus events WITHIN Combo Box that sets internal :focus state
   * of component. Triggered when any descendant of Combo Box host (e.g. text input,
   * buttons, etc.) receives :focus. This is distinct from a :focus listener in that
   * it's only triggered when a descendant FIRST receives :focus, and then is NOT
   * triggered again when :focus changes between descendant elements.
   */
  @Listen('focusin')
  onFocus() {
    if (this.disabled || this.readonly) return;
    clearMaskingDelay();
    this._hasFocus = true;
    this._maskingActive = false;
  }

  /**
   * Listener for blur events that validates Combo Box state, resets the active
   * query, & closes the dropdown menu. Triggered when ALL Combo Box descendants
   * lose :focus. This is distinct from a blur listener in that it isn't triggered
   * on INTERNAL blur events fired when :focus changes between descendants.
   */
  @Listen('focusout')
  onBlur() {
    this.markTouchedAndValidate().then(() => {
      this._hasFocus = false;
      this._activeQuery = false;
      this._retainedInputValue = '';
      this.setInputDisplayValue();
      applyMasking(this);
      !this.optionLookup && this.updateOptions();
      this.toggleMenu(false);
    });
  }

  /**
   * Listener for keydown events that determines the action that should be taken
   * based on the key pressed.
   */
  @Listen('keydown')
  onKeyDown(e: KeyboardEvent) {
    if (this.disabled || this.readonly) return;
    EventUtils.preventDefault(e, [ESCAPE, ARROW_UP, ARROW_DOWN]);

    switch (true) {
      // If enter key pressed, select the current "active" (i.e. highlighted) option in dropdown list
      case EventUtils.isKey(e, ENTER):
        this.handleOptionChange(this.getActiveOption());
        break;
      // If arrow key pressed, change "active" option in dropdown list (i.e. navigate forward/backward)
      case EventUtils.isKey(e, [ARROW_UP, ARROW_DOWN]):
        this.handleNavigation(e);
        break;
      // If escape key pressed, close the dropdown menu (if open)
      case EventUtils.isKey(e, ESCAPE):
        this.toggleMenu(false);
        break;
      // If tab key pressed, reset the active index since dropdown menu is losing :focus
      // Prevents unintentional option selection when using "clear" or "menu" buttons
      case EventUtils.isKey(e, TAB):
        Utils.nextTick().then(() => {
          Utils.getActiveElement() === this._elementRef
            ? this.resetActiveIndex()
            : (this._activeIndex = -1);
        });
        break;
      // If "control key" pressed (e.g. ctrl, alt, shift, etc.) OTHER than backspace/delete, do nothing
      case !EventUtils.isCharacterKey(e) &&
        !EventUtils.isKey(e, [BACKSPACE, DELETE]):
        break;
      // If "character key" (i.e. alphanumeric) OR backspace/delete pressed, handle accordingly
      default:
        this.handleKeyPress(e);
    }
  }

  // ================================================================ //
  // -- Public Methods

  @Method() async setValue(value: string | string[]) {
    return setValue(this, value);
  }
  @Method() async getValue() {
    return getValue(this);
  }
  @Method() async validate() {
    return validateElement(this);
  }
  @Method() async reset(clear = false) {
    return reset(this, clear);
  }
  @Method() async markTouchedAndValidate() {
    return markTouchedAndValidate(this);
  }
  @Method() async setParentValue(formState: FluidFormState) {
    this._parentState = formState;
  }
  @Method() async getNativeInput() {
    return this._elementRef;
  }
  @Method() async triggerValueChange() {
    this.valueChange.emit(this._elementState);
  }

  // ================================================================ //
  // -- Local Methods

  /**
   * Applies translations to options before refreshing the component.
   */
  applyTranslations() {
    this.options = translateOptions(
      this.options,
      this._i18nStore,
      this.fluidTranslate?.options
    );
    this._lang = this._i18nStore?.getLanguage();
  }

  /**
   * If optionLookup is defined, creates the debounced async loader
   * from configuration.
   */
  createAsyncLoader() {
    if (isNullOrUndefined(this.optionLookup)) return;

    this._debouncedLookup = Utils.asyncDebounce(async (value) => {
      return new Promise<void>((resolve) => {
        this.optionLookup.lookup(value, (newOptions: FluidOption[]) => {
          // Reset selected option(s) IF & ONLY IF "retainSelections" is explicitly false
          if (
            this.optionLookup.retainSelections === false &&
            !!this._elementState?.value
          ) {
            this._retainedOptions = [];
            this._elementState = { ...this._elementState, value: undefined };
            this._lastTouchedOption = undefined;
            this.resetActiveIndex();
            this.valueChange.emit(this._elementState);
            !!this._retainedInputValue &&
              writeTask(() => {
                this._elementRef.value = this._retainedInputValue;
              });
          }

          this.options = newOptions;
          this._optionsUpdating = false;
          resolve();
        });
      });
    }, this.optionLookup.debounceTime || 500);
  }

  /**
   * Sets reference to dropdown menu element.
   */
  setMenuRef(el: HTMLElement): void {
    this._menuRef = el;
  }

  /**
   * Adds individual option element reference to the internal registry.
   */
  setOptionRef(el: HTMLElement, index: number): void {
    if (!el) return;
    this._optionRefs[index] = el;
  }

  /**
   * Creates PopperJS instance for dropdown menu edge detection.
   */
  createPopperInstance(): void {
    if (!!this._popperInstance || !this._menuRef || !this._containerRef) return;

    this._popperInstance = createPopper(this._containerRef, this._menuRef, {
      strategy: 'absolute',
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'eventListeners',
          enabled: this._menuOpen,
        },
        {
          name: 'flip',
          options: {
            fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
            padding: 8,
          },
        },
        {
          name: 'offset',
          options: {
            offset: [0, 4],
          },
        },
      ],
    });
  }

  /**
   * Determines whether the "Select '<my_custom_input>'" option for
   * custom/arbitrary input is currently displayed within the dropdown
   * menu. Returns true if custom input IS allowed & <input> is not empty
   * during an "active query".
   */
  customInputOptionVisible(): boolean {
    return (
      this.allowCustomInput &&
      this._activeQuery &&
      !this._optionsUpdating &&
      !!this._elementRef?.value
    );
  }

  /**
   * Determines whether the "Begin Typing to Search" message is displayed
   * in the dropdown menu for Async Combo Box. Returns true if <input>
   * element is empty, no options are selected, & there is no "active query"
   * (i.e. displayed when user first interacts with Async Combo Box if not
   * "initialValue" / "value" is provided).
   */
  asyncLookupMessageVisible(): boolean {
    return (
      !!this.optionLookup &&
      !this._optionsUpdating &&
      !this._visibleOptionCount &&
      !this._activeQuery &&
      (this.multiSelect ? !this._elementRef?.value : true)
    );
  }

  /**
   * Determines whether the "No Results" message is displayed in the
   * dropdown menu. Returns true if no options are displayed in the dropdown
   * menu due to the current "active query" & "custom input" is NOT allowed.
   */
  noResultsMessageVisible(): boolean {
    return (
      !this._optionsUpdating &&
      !this._visibleOptionCount &&
      !this.customInputOptionVisible() &&
      (this.optionLookup ? !!this._activeQuery : true)
    );
  }

  /**
   * Returns true if "value" Prop equals "_elementState.value" OR if
   * "options" Prop has not been populated yet (i.e. is undefined) -
   * otherwise, returns false. Used to determine if "value" Prop is
   * out-of-sync with internal state.
   */
  valueEqualsState(): boolean {
    return !this._stateInitialized || this.value === this._elementState?.value;
  }

  /**
   * Dynamically updates the "value" Prop to match "_elementState.value".
   * Called every time the component updates/re-renders.
   */
  updateValue(): void {
    if (this.valueEqualsState() || this._optionsUpdating) return;
    this.value = this._elementState.value;
  }

  /**
   * Determines & executes appropriate action for arrow key events. Navigates
   * forward/backward through options in dropdown menu.
   * @param e - the arrow key keydown event
   */
  handleNavigation(e: KeyboardEvent): void {
    const activeIdx = this._activeIndex;
    const lastIndex = this.customInputOptionVisible()
      ? this._visibleOptionCount
      : this._visibleOptionCount - 1;

    switch (true) {
      // If menu isn't already open, open it & terminate function
      case !this._menuOpen:
        this.toggleMenu(true);
        return;
      // Dropdown menu is empty, so terminate function
      case lastIndex === -1:
        return;
      // Navigate forwards or loop to the beginning of the list (if at end of list)
      case EventUtils.isKey(e, ARROW_DOWN):
        this._activeIndex =
          activeIdx === -1 || activeIdx >= lastIndex ? 0 : activeIdx + 1;
        break;
      // Navigate backwards or loop to the end of the list (if at beginning of list)
      case EventUtils.isKey(e, ARROW_UP):
        this._activeIndex = activeIdx <= 0 ? lastIndex : activeIdx - 1;
        break;
    }

    this._lastTouchedOption = this.getActiveOption();
    scrollOptionIntoView(this, this._activeIndex);
  }

  /**
   * Determines & executes appropriate action for alphanumeric, backspace,
   * or delete key events. Responsible for removing multi-select "chips" on
   * backspace, opening menu (if closed), & setting "active query".
   * @param e - the character, backspace, or delete keydown event
   */
  handleKeyPress(e: KeyboardEvent): void {
    switch (true) {
      // Multi-select <input> is empty, so remove last selected chip (if one exists)
      case EventUtils.isKey(e, BACKSPACE) &&
        this.multiSelect &&
        !this._elementRef.value:
        this.handleOptionChange(this.getLastSelectedOption(), false);
        break;
      // Single-select <input> is empty, so do nothing
      case EventUtils.isKey(e, BACKSPACE) && !this._elementRef.value:
        return;
      // Character key pressed, so open menu (if closed) & set "active query" status
      default:
        this._activeQuery = true;
        this.toggleMenu(true);
    }
  }

  /**
   * Resets index of "active" / highlighted option in the dropdown menu to
   * either 0 (i.e. first option highlighted by default) OR -1 (i.e. NO
   * option highlighted) if "disableAutoHighlight: true".
   */
  resetActiveIndex(): void {
    this._activeIndex = !this.disableAutoHighlight && this._menuOpen ? 0 : -1;
  }

  /**
   * Sets index of "active" / highlighted option in the dropdown menu.
   * Attempts to restore highlight to "last touched" option first - if
   * undefined, sets index to last selected option. If neither exist,
   * resets index to 0 (default) OR -1 if "disableAutoHighlight: true".
   */
  setActiveIndex(): void {
    const lastTouched = this.getOption(this._lastTouchedOption?.value); // Refresh object reference
    const lastSelected = this.getLastSelectedOption();

    switch (true) {
      // If element with :focus is NOT Combo Box's <input>, no option should be highlighted
      case Utils.getActiveElement() !== this._elementRef:
        this._activeIndex = -1;
        break;
      // Set to "last touched" option (retains highlight when query changes / prevents "jumping")
      case !!lastTouched && lastTouched._index !== -1:
        this._activeIndex = lastTouched._index;
        break;
      // If no "last touched" option exists, set to last selected option (e.g. menu is reopened after being closed)
      case !!lastSelected &&
        !lastSelected._hidden &&
        lastSelected._index !== -1:
        this._activeIndex = lastSelected._index;
        break;
      // If none of the previous conditions have been hit, reset index to -1 or 0
      default:
        this.resetActiveIndex();
    }

    scrollOptionIntoView(this, this._activeIndex, false);
  }

  /**
   * Returns the option with index matching the active index OR a new "custom input"
   * option created from the current <input> value.
   */
  getActiveOption(): FluidOption {
    switch (true) {
      // No option is currently active, so terminate
      case this._activeIndex === -1:
        return;
      // "Custom input" option is active, so return <input> value
      case this.customInputOptionVisible() &&
        this._activeIndex === this._visibleOptionCount:
        return this.getOption(this._elementRef.value);
      // Find & return the option that matches the current active index (or undefined if none match)
      default:
        return this._options.find((opt) => opt._index === this._activeIndex);
    }
  }

  /**
   * Initial setup for the Combo Box state. Ensures options are provided, processes
   * & validates default selected options, initializes form field state object,
   * sorts options (if "sortOrder" provided), & creates internal options state array.
   */
  initializeState(): void {
    let selectedValues;

    switch (true) {
      // First, check for "initialValue" - convert it to an array if it's a string
      case !!this.initialValue:
        selectedValues = !Array.isArray(this.initialValue)
          ? [this.initialValue]
          : this.initialValue;
        break;
      // "initialValue" wasn't provided, so check "value" Prop next (convert to array if necessary)
      case !!this.value:
        selectedValues = !Array.isArray(this.value) ? [this.value] : this.value;
        break;
      // No initial value was provided, so check all options for "selected" property (if options provided)
      default:
        selectedValues = getSelectedOptionValues(this.options); // Returns [] if no selected option found
    }

    this._activeQuery = !!this._elementRef?.value;
    this._lastTouchedOption = undefined;
    // Async Combo Box (i.e. "optionLookup" is defined) doesn't need to wait for options to be populated
    // Otherwise, if "options" array is undefined/empty, we'll need to run "initializeState()" again
    this._stateInitialized = !!this.optionLookup || !!this.options?.length;
    this._validatedInitialValue = validateSelected(this, selectedValues);
    this._elementState = setInitialElementState(
      this._validatedInitialValue,
      this.controlName
    );
    this._options = initializeOptions(this);
    this.updateOptions(this._elementRef?.value ?? '');
    this.updateValue();

    if (this.optionLookup) {
      this._retainedOptions = gatherRetainedOptions(
        this._options,
        this._validatedInitialValue
      );
    }
  }

  /**
   * Updates Combo Box state when "options" Prop changes. Selected values will be retained
   * UNLESS the new "options" array doesn't contain the value OR the option's "selected"
   * property is explicitly set to "false" in the new array.
   */
  updateState(): void {
    if (isNullOrUndefined(this._elementState)) return;
    // Get all selected values from the new "options" array
    // Validate that new # of selected options is compatible with the "multiSelect" Prop
    const selectedValues = validateSelected(
      this,
      getSelectedOptionValues(this.options)
    );

    const updatedState = this._elementState.value?.filter((value) => {
      const existingOpt = this.getOption(value);
      const matchedOpt = this.options.find((opt) => opt.value === value);
      const isRetained = !!this._retainedOptions?.find(
        (opt) => opt.value === value
      );

      switch (true) {
        // If value is falsy OR if "allowCustomInput" has changed from true to false, remove it
        case !existingOpt:
          return false;
        // If value is custom/arbitrary input OR option is "retained" from async lookup, keep it
        case existingOpt._index === -1 || isRetained:
          return true;
        // If the new "options" array doesn't contain a FluidOption with the value, remove it
        case !matchedOpt:
          return false;
        // If the new "options" array DOES contain the value, but its "selected" property is false, remove it
        case !isNullOrUndefined(matchedOpt.selected) && !matchedOpt.selected:
          return false;
        // The value exists in new "options" array & its "selected" property is either true or undefined, so keep it
        default:
          return true;
      }
    });

    if (!this.multiSelect) {
      this._elementState.value =
        selectedValues ?? (updatedState?.length ? updatedState : undefined);
    } else {
      const selectedUnion = [
        ...new Set([...(updatedState || []), ...(selectedValues || [])]),
      ];
      this._elementState.value = selectedUnion?.length
        ? selectedUnion
        : undefined;
    }

    this._options = initializeOptions(this);

    if (!this.optionLookup) {
      this._activeQuery = false;
      this._lastTouchedOption = undefined;
      this.updateOptions();
    } else {
      this.updateOptions(this._elementRef?.value ?? '');
    }
  }

  /**
   * Updates each option in the "_options" array each time the component
   * updates. Sets "selected" status based on selected options in
   * "_elementState.value", & sets "hidden" status based on current "query
   * string" typed into the component's <input>. Also resets "_lastTouchedOption"
   * if it doesn't partially/fully match the query string, & enumerates the
   * total number of visible options in the dropdown menu.
   * @param queryValue - value by which to filter options in the dropdown menu
   */
  updateOptions(queryValue = ''): void {
    const query = new RegExp(escapeRegExp(queryValue), 'i');
    let visibleOptIndex = 0;

    this._options = this._options.map((opt) => {
      const queryMatch =
        query.test(opt.label) ||
        (!!opt.group?.label && query.test(opt.group.label)) ||
        (!isNullOrUndefined(this.customFilter)
          ? this.customFilter(queryValue, opt)
          : false);

      // Reset "_lastTouchedOption" if it doesn't match current query (i.e. it's hidden)
      if (this._lastTouchedOption?.value === opt.value && !queryMatch) {
        this._lastTouchedOption = undefined;
      }

      return {
        ...opt,
        selected: this._elementState.value?.includes(opt.value) ?? false,
        _hidden: !queryMatch,
        _index: queryMatch ? visibleOptIndex++ : undefined,
      };
    });

    this._visibleOptionCount = visibleOptIndex;
    this.setActiveIndex();
  }

  /**
   * Returns the FluidOption associated with a given "value" string. If custom input is
   * allowed & the provided value is NOT found in "_elementState.value", then creates &
   * returns a new FluidOption (not included in "_options") based on the value.
   * @param value - the "value" string associated with a FluidOption
   */
  getOption(value: string): FluidOption {
    if (!value) return;

    const matchedOpt = this._options.find((opt) => opt.value === value);
    const retainedOpt = this._retainedOptions?.find(
      (opt) => opt.value === value
    );
    const customOpt = { label: value, value, _index: -1 };

    switch (true) {
      // If a match is found in "_options", return the matching option
      case !!matchedOpt:
        return matchedOpt;
      // If option is "retained" from async lookup, return the option from "_retainedOptions"
      case !!retainedOpt:
        return retainedOpt;
      // If a match is NOT found in "_options" & custom input is NOT allowed, terminate the function
      case !this.allowCustomInput:
        return;
      // If custom input IS allowed & value is found in _elementState, return the value as SELECTED option
      case this._elementState.value?.includes(value):
        return { ...customOpt, selected: true };
      // If custom input IS allowed & value is NOT found in _elementState, return the value as UNSELECTED option
      default:
        return { ...customOpt, selected: false };
    }
  }

  /**
   * Returns the last option to be selected (i.e. added to "_elementState.value").
   * This will either be a FluidOption provided via the "options" Prop, or a FluidOption
   * generated from custom input that is NOT in the "options" array.
   */
  getLastSelectedOption(): FluidOption {
    if (!this._elementState?.value) return;
    return this.getOption(
      this._elementState.value[this._elementState.value.length - 1]
    );
  }

  /**
   * Returns text to be rendered in a single-select Combo Box's <input>. This will either
   * be the "label" of the last option to be selected, or "undefined" (i.e. the <input>
   * will be empty). If "maskingConfig" is provided & the last selected option was "custom
   * input", returned string will have masking applied.
   */
  getInputDisplayValue(): string {
    if (this.multiSelect || !this._elementState?.value) return;
    const lastSelectedLabel = this.getLastSelectedOption()?.label;
    const maskedLabel = getMaskedLabel(this, lastSelectedLabel);
    return this._maskingActive && !!maskedLabel
      ? maskedLabel
      : lastSelectedLabel;
  }

  /**
   * Sets the text displayed in the component's <input> element. This
   * will be the "label" of the last selected option for a single-select
   * Combo Box, OR empty string for a multi-select Combo Box OR a
   * single-select Combo Box with no option selected.
   * @param clear - true if the <input> should be empty, false if the <input> MAY display a value
   */
  setInputDisplayValue(clear: boolean = this.multiSelect): void {
    this._elementRef.value = clear ? '' : this.getInputDisplayValue() ?? '';
  }

  /**
   * Opens or closes the dropdown menu. If method is called without
   * setting the "open" parameter, the menu will be set to the opposite
   * of its current state (e.g. a closed dropdown menu will be opened).
   * Also sets active/highlighted option when the dropdown menu is opened,
   * & resets the active/highlighted option when the menu is closed.
   * @param open - true if dropdown menu should be open, false if it should be closed
   */
  toggleMenu(open = !this._menuOpen): void {
    if (open === this._menuOpen || this.readonly) return;

    this._menuOpen = open;
    togglePopperListeners(this._popperInstance, this._menuOpen);

    if (!open) {
      this.resetActiveIndex();
      this._lastTouchedOption = undefined;

      if (this.optionLookup) {
        this._menuRef.addEventListener(
          'animationend',
          () => {
            this.handleAsyncLookup(null);
          },
          { once: true }
        );
      }
    } else {
      this.setActiveIndex();
    }
  }

  /**
   * Highlights text value within component's <input> when it receives :focus
   * & resets the active/highlighted option.
   */
  handleInputFocus(): void {
    if (this.disabled || this.readonly) return;
    this._elementRef.setSelectionRange(0, this._elementRef.value.length);
    this.resetActiveIndex();
  }

  /**
   * Initiates "filtering" of options in the dropdown menu when value is
   * typed into component's <input>, OR resets single-select Combo Box's
   * "selected" option when <input> value is cleared, OR triggers "option
   * lookup" for Async Combo Box. Called when "Input" event is fired on
   * component's embedded <input> element.
   */
  handleInputChange(): void {
    const inputValue: string = this._elementRef.value;
    this._retainedInputValue = inputValue;

    // If single-select Combo Box's <input> is cleared when an option is selected...
    if (!inputValue && !this.multiSelect && this._elementState.value) {
      this.reset(true);
      this.validate().then(() =>
        this.valueChange.emit({
          ...this._elementState,
          cleared: true,
        })
      );
    } else {
      const queryValue = this._activeQuery ? inputValue : '';
      !inputValue && !queryValue && (this._lastTouchedOption = undefined);

      isNullOrUndefined(this.optionLookup)
        ? this.updateOptions(queryValue)
        : this.handleAsyncLookup(queryValue || null);
    }
  }

  /**
   * Triggers call to "_debouncedLookup()" that dynamically populates
   * an Async Combo Box's options OR clears unselected options shown in
   * the dropdown menu & replaces them with the currently selected
   * options stored in "_retainedOptions". Returns a Promise that's
   * resolved within "_debouncedLookup()" so that other local methods
   * can be paused while options are retrieved.
   * @param inputValue - query string for "_debouncedLookup()" OR null (to clear unselected options)
   */
  async handleAsyncLookup(inputValue = ''): Promise<void> {
    if (isNullOrUndefined(this.optionLookup)) return;

    !this._debouncedLookup && this.createAsyncLoader();

    if (isNullOrUndefined(inputValue)) {
      this.options = this._retainedOptions;
      this.updateOptions();
      return Promise.resolve();
    } else {
      this._optionsUpdating = true;
      return this._debouncedLookup(inputValue);
    }
  }

  /**
   * Handles adding or removing an option from "_elementState.value".
   * Called when an option in the dropdown menu is clicked, the "enter"
   * key is pressed (while an option is highlighted in the dropdown menu),
   * or multi-select "chip" is dismissed (via "x" button OR backspace).
   * Also closes single-select dropdown menu, updates multi-select "last
   * touched option", resets "active query", & brings :focus to <input>.
   * @param opt - the FluidOption to be added/removed from "_elementState.value"
   * @param updateTouched - whether the "last touched option" should be updated
   */
  handleOptionChange(opt: FluidOption, updateTouched = true): void {
    if (!opt || !!opt.disabled) return;
    update(this, opt);

    if (!this.multiSelect) {
      this.toggleMenu(false);
    } else if (updateTouched && this._menuOpen) {
      this._lastTouchedOption = opt;
    }

    this.setInputDisplayValue();
    // Keep options in Async Combo Box's dropdown menu the same to prevent "jumpy" behavior
    this.updateOptions(this.optionLookup ? this._retainedInputValue : '');
    this._activeQuery = false;
    this._elementRef.focus();

    // If Async Combo Box's only selected option has been deselected...
    if (!!this.optionLookup && !this._elementState.value) {
      this.handleAsyncLookup(null);
    }
  }

  /**
   * Handles adding "custom input" option to "_elementState.value".
   * Called when "custom input" option is selected in the dropdown menu.
   */
  handleCustomInput(): void {
    this.handleOptionChange(this.getOption(this._elementRef.value), false);
  }

  // ================================================================ //
  // -- Render (Partials)

  renderChips(): HTMLElement[] {
    if (!this.multiSelect || !this._elementState?.value?.length) return;

    return this._elementState.value.map((val) => {
      return <Chip host={this} option={this.getOption(val)} />;
    });
  }

  // ================================================================ //
  // -- Render (Main)

  render() {
    return (
      <FormElementWrapper host={this}>
        <div
          role="combobox"
          id={`${this.config?.id}-container`}
          ref={(el: HTMLElement) => (this._containerRef = el)}
          onMouseDown={(event) => resetFocus(this, event)}
          aria-label={translateProperty.bind(this)('label') ?? 'Combo Box'}
          aria-expanded={String(this._menuOpen)}
          aria-owns={this._listId}
          aria-haspopup="listbox"
          class={{
            'combo-box-container': true,
            'allow-cancel': this.allowCancel,
            'has-focus': this._hasFocus,
            'has-selected': !!this._elementState.value?.length,
            'has-error': hasError(this._elementState, this.touched),
            'read-only': this.readonly,
            disabled: this.disabled,
          }}
        >
          {this.renderChips()}
          <input
            type="text"
            id={getFormInputId(this.config?.id, this.controlName)}
            name={this._elementState.name}
            value={this.getInputDisplayValue()}
            placeholder={translateProperty.bind(this)('placeholder')}
            disabled={this.disabled}
            readOnly={this.readonly}
            ref={(el: HTMLInputElement) => (this._elementRef = el)}
            onFocus={() => this.handleInputFocus()}
            onClick={() => this.toggleMenu(true)}
            onInput={() => this.handleInputChange()}
            aria-autocomplete="list"
            aria-controls={this._listId}
            class={{
              'combo-box-input': true,
              'has-focus': this._hasFocus,
              'read-only': this.readonly,
              disabled: this.disabled,
            }}
          />
          <ComboBoxControls
            host={this}
            optionsUpdating={this._optionsUpdating}
          />
          <FocusIndicator host={this} hasFocus={this._hasFocus} />
        </div>
        <DropdownMenu
          host={this}
          menuId={this._menuId}
          menuOpen={this._menuOpen}
          menuAlignment={FluidAlignment.CENTER}
          zIndex={this.zIndex}
          preventFocus={true}
          dynamicWidth={this.dynamicMenuWidth}
        >
          <DropdownMenuOptionsList
            host={this}
            listId={this._listId}
            options={this._options}
            emptyListMessage={translateProperty.bind(this)('emptyListMessage')}
          />
        </DropdownMenu>
      </FormElementWrapper>
    );
  }

  // ================================================================ //
  // -- Internal Props
  //
  // -- Note: This is not a public API - these properties
  // -- should only be used internally by FLUID components.

  /**
   * Overrides default CSS z-index value for dropdown menu.
   * @internal
   */
  @Prop() zIndex: number;

  /**
   * @internal
   */
  @Prop() _standalone = true;

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

  /**
   * @internal
   */
  @Prop({ mutable: true }) externalState: Record<string, any>;
}
