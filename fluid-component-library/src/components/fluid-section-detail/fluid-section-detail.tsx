import {
  FluidPopoverConfig,
  FluidSectionDetailTranslationOptions,
  FluidTheme,
  FluidThemeInterface,
} from '@lmig/fluid-core';
import { Component, Element, h, Prop, State } from '@stencil/core';

import { InfoPopover } from '../../common/fluid-common-icon.components';
import { useI18n } from '../../providers/fluid-i18n-provider/adapter/fluid-i18n.adapter';
import { FluidI18nStore } from '../../providers/fluid-i18n-provider/store/fluid-i18n.store';
import { Utils } from '../../utils/utils';

/**
 * @displayName Section Detail
 * @contextData The FLUID Section detail component should be used when summarising a section of a page, such as a form. The body of
 * the component should only contain text, and if necessary, other FLUID text nodes (such as fluid-link). It is not intended to be
 * used for more complex interaction, and should be considered read-only information.
 */
@Component({
  tag: 'fluid-section-detail',
  styleUrl: 'fluid-section-detail.less',
  shadow: true,
})
export class FluidSectionDetail implements FluidThemeInterface {
  // ================================================================ //
  // -- Host Element

  /**
   * Get a reference to the host element
   */
  @Element() host: HTMLElement;

  // ================================================================ //
  // -- Props

  /**
   * What theme settings should the component use?
   * @type {string}
   */
  @Prop({ mutable: true }) overrideGlobalTheme: boolean;

  /**
   * If FluidThemeProvider is used, should this component override the
   * global theme with its local theme?
   */
  @Prop({ mutable: true }) theme: FluidTheme = FluidTheme.CORP;

  /**
   * The title for the section
   */
  @Prop() sectionTitle: string;

  /**
   * The 'h' level for the section heading
   */
  @Prop() titleLevel = 3;

  /**
   * If true, no gutter will be applied to the bottom.
   */
  @Prop() disableGutters: boolean;

  /**
   * If the title should have an info icon with popover, provide the
   * popover text with this prop
   */
  @Prop() infoPopover: string | FluidPopoverConfig;

  /**
   * Called every time the component is connected to the DOM.
   * @action: setGlobalTheme - updates theme to match global theme & subscribes to changes
   */
  connectedCallback(): void {
    Utils.setGlobalTheme(this);
    useI18n.bind(this)({ init: () => (this._i18nBound = true) });
  }

  disconnectedCallback() {
    this._i18nStore?.deregisterElement(this._translateId);
  }

  /**
   * Main Render function
   */
  render() {
    const componentWrapper = `fluid-section-detail ${this.theme}`;
    const themeProps = {
      overrideGlobalTheme: this.overrideGlobalTheme,
      theme: this.theme,
    };
    const titleStyle = {
      paddingRight: !!this.infoPopover && '0.5em',
    };

    const title =
      this._i18nStore?.translate(this.fluidTranslate?.title) ||
      this.sectionTitle;

    return (
      <div class={componentWrapper}>
        <fluid-title
          fluidTranslate={this.fluidTranslate}
          level={this.titleLevel.toString()}
          disableGutters={true}
          {...themeProps}
        >
          <span style={titleStyle}>{title}</span>
          <InfoPopover
            helpText={this.infoPopover}
            fluidTranslate={this.fluidTranslate?.infoPopover}
          ></InfoPopover>
        </fluid-title>
        <div class={'section-summary'}>
          <fluid-text
            muted={true}
            disableGutters={true}
            {...themeProps}
            fluidTranslate={this.fluidTranslate}
          >
            <slot />
          </fluid-text>
        </div>
      </div>
    );
  }

  // ================================================================ //
  // -- Internal Props
  //
  // -- Note: This is not a public API - these properties
  // -- should only be used internally by FLUID components.

  // ================================================================ //
  // -- Internationalisation

  /* @internal */
  @Prop() fluidTranslate: FluidSectionDetailTranslationOptions;

  private _translateId: string;
  private _i18nStore: FluidI18nStore | undefined;
  @State() _i18nBound: boolean;
}
