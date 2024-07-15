import { FluidIconKey, FluidOption, FluidSize } from '@lmig/fluid-core';
import { FunctionalComponent, h } from '@stencil/core';

import { AriaButton } from '../../../common/fluid-common-button.components';
import { CancelInput } from '../../../common/fluid-common-form.components';
import {
  ExpansionToggle,
  InlineLoader,
} from '../../../common/fluid-common-icon.components';
import { FluidFunctionalComponentProps } from '../../../model/functional/fluid-functional-component-props.interface';
import { getMaskedLabel } from '../utils/fluid-combo-box.utils';

interface ComboBoxProps extends FluidFunctionalComponentProps {
  host: any;
  optionsUpdating?: boolean;
  option?: FluidOption;
}

// ================================================================ //
// -- Public Functional Components

/**
 * ComboBoxControls
 */
export const ComboBoxControls: FunctionalComponent<ComboBoxProps> = (
  props: ComboBoxProps
) => {
  const { host, optionsUpdating } = props;
  const buttonTitle = optionsUpdating ? 'Loading Options' : 'Open Menu';
  return (
    <div class="combo-box-controls">
      <InlineLoader
        class="menu-loading"
        doRender={optionsUpdating}
        theme={host.theme}
      />
      <CancelInput host={host} />
      <AriaButton
        class="menu-trigger"
        onClick={() => !optionsUpdating && host.toggleMenu()}
        tabIndex={!host._hasFocus && -1}
        disabled={host.disabled || host.readonly}
        title={buttonTitle}
      >
        <ExpansionToggle
          open={host._menuOpen}
          disabled={host.disabled || host.readonly}
          theme={host.theme}
          doRender={true}
        />
      </AriaButton>
    </div>
  );
};

/**
 * Chip
 */
export const Chip: FunctionalComponent<ComboBoxProps> = (
  props: ComboBoxProps
) => {
  const { host, option } = props;
  const maskedLabel = getMaskedLabel(host, option.label);

  return (
    <div
      key={`${option.value}-chip`}
      data-option-value={option.value}
      class={{
        'option-chip': true,
        'read-only': host.readonly,
        disabled: host.disabled,
      }}
    >
      <span class="chip-label">
        {host._maskingActive && !!maskedLabel ? maskedLabel : option.label}
      </span>
      <ChipDismiss {...props} />
    </div>
  );
};

// ================================================================ //
// -- Private Functional Components

/**
 * Chip Dismiss Button
 */
const ChipDismiss: FunctionalComponent<ComboBoxProps> = (
  props: ComboBoxProps
) => {
  const { host, option } = props;

  return (
    <button
      tabIndex={-1}
      onClick={() => host.handleOptionChange(option, false)}
      aria-label="Remove Option"
      class={{
        'chip-dismiss-button': true,
        'dismiss-hidden': host.disabled || host.readonly,
      }}
    >
      <fluid-icon
        key={`${option.value}-chip-dismiss-icon`}
        config={{
          key: FluidIconKey.DISMISS,
          size: FluidSize.EXTRA_SMALL,
          scale: 20,
          interactive: true,
          theme: host.theme,
          overrideGlobalTheme: true,
        }}
      />
    </button>
  );
};
