import {
  FluidAlignment,
  FluidButtonType,
  FluidFormControlConfig,
  FluidFormControlType,
  FluidFormState,
} from '@lmig/fluid-core';
import { EventEmitter, h } from '@stencil/core';

import { FluidDataLayerUtils } from '../../fluid-data-layer/fluid-data-layer.utils';

/**
 * Configuration interface for the form control set.
 */
export interface FluidFormControlSetProps {
  submitConfig?: FluidFormControlConfig;
  cancelConfig?: FluidFormControlConfig;
  additionalActions?: FluidFormControlConfig[];
  actionClicked?: EventEmitter;
  reset?: Function;
  disabled?: boolean;
  formState?: FluidFormState;
  removeSpacing?: boolean;
  formValid?: boolean;
  controlsAlignment?: FluidAlignment;
  onActionClicked?: (action: FluidFormControlConfig) => void;
}

/**
 * Configuration interface for a single control (extends control set props
 * to drill emitters and functions through)
 */
export interface FluidFormControlProps extends FluidFormControlSetProps {
  config?: any;
  type?: FluidFormControlType;
  isLast?: boolean;
}

/**
 * Renders a set of form controls, if any are configured
 * @param props
 * @constructor
 */
export const FormControls = (props: FluidFormControlSetProps) => {
  const {
    submitConfig,
    cancelConfig,
    removeSpacing,
    controlsAlignment,
    onActionClicked,
    disabled,
  } = props;
  if (submitConfig || cancelConfig) {
    return (
      <fluid-grid removeSpacing={removeSpacing}>
        <fluid-grid-item
          colSm={12}
          alignItems={controlsAlignment || FluidAlignment.LEFT}
        >
          <FormControl
            config={submitConfig}
            disabled={disabled}
            type={FluidFormControlType.SUBMIT}
            {...props}
            isLast={!cancelConfig}
            onActionClicked={onActionClicked}
          />
          <FormControl
            config={cancelConfig}
            disabled={disabled}
            type={FluidFormControlType.CANCEL}
            {...props}
            isLast={true}
            onActionClicked={onActionClicked}
          />
        </fluid-grid-item>
      </fluid-grid>
    );
  }
};

/**
 * Renders a single form control based on the given props
 * @param props
 * @constructor
 */
export const FormControl = (props: FluidFormControlProps) => {
  const {
    reset,
    type,
    formState,
    formValid,
    isLast,
    onActionClicked,
    disabled,
  } = props;
  let { config } = props;

  let analyticsConfig = config?.analyticsConfig;

  if (type === FluidFormControlType.CANCEL && !!config) {
    config = { ...config, preClick: reset };
  }

  const isSubmit: boolean = type === FluidFormControlType.SUBMIT;

  if (!!analyticsConfig && analyticsConfig.trackEvents?.click) {
    analyticsConfig = FluidDataLayerUtils.supplementPayload(
      analyticsConfig,
      formState.rawValue,
      'click'
    );
  }

  const onClick = (config: FluidFormControlConfig) => {
    if (config.preClick) {
      config.preClick()?.then(() => onActionClicked(config));
    } else {
      onActionClicked(config);
    }
  };

  const enable = (element: HTMLFluidButtonElement) =>
    element.removeAttribute('disabled');
  const disable = (element: HTMLFluidButtonElement) =>
    element.setAttribute('disabled', 'disabled');

  const setDisabled = (element: HTMLFluidButtonElement) =>
    shouldBeDisabled(formState, config, disabled)
      ? disable(element)
      : enable(element);

  const shouldBeDisabled = (
    formState: FluidFormState,
    config: FluidFormControlConfig,
    disabled: boolean
  ) => {
    return (
      disabled ||
      (config.disableIf && config.disableIf(formState)) ||
      (isSubmit &&
        !formValid &&
        !(config.enabledIf && config.enabledIf(formState)))
    );
  };

  return config ? (
    <fluid-button
      type={isSubmit ? FluidButtonType.PRIMARY : FluidButtonType.SECONDARY}
      id={config.identifier}
      disabled={disabled}
      analyticsConfig={analyticsConfig}
      removeHorizontalMargin={isLast}
      ref={(el) => setDisabled(el)}
      label={config.actionText || config.label}
      config={config}
      onClick={() => {
        onClick(config);
      }}
    />
  ) : undefined;
};
