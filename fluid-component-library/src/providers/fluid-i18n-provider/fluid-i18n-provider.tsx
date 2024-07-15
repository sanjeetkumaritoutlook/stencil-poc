import { FluidLanguage, getAtPath } from '@lmig/fluid-core';
import { Component, h, Host, Method, Prop, Watch } from '@stencil/core';

import { Utils } from '../../utils/utils';
import {
  FluidI18nStore,
  FluidTranslatableElement,
} from './store/fluid-i18n.store';

/**
 * @displayName i18n Provider
 *
 * @experimental
 */
@Component({
  tag: 'fluid-i18n-provider',
  shadow: true,
})
export class FluidI18nProvider {
  // ================================================================ //
  // -- Store

  store: FluidI18nStore;

  @Method() registerElement(element: FluidTranslatableElement) {
    return Promise.resolve(this.store.registerElement(element));
  }
  @Method() deregisterElement(element: FluidTranslatableElement) {
    return Promise.resolve(this.store.deregisterElement(element._translateId));
  }
  @Method() getStore() {
    return Promise.resolve(this.store);
  }

  // ================================================================ //
  // -- Props

  @Prop({ mutable: true }) translations: any;

  @Prop({ reflect: true }) language: FluidLanguage;

  @Method() async extend(newTranslations: any): Promise<void> {
    this.translations = {
      ...this.translations,
      ...newTranslations,
    };
    this.store.setValue('translations', this.translations);
    return Promise.resolve();
  }

  @Method() async translation<T = string>(path: string): Promise<T> {
    const languagePath = (language: FluidLanguage = this.language) =>
      `${language}.${path}`;
    const translation: T | undefined =
      getAtPath(this.translations, languagePath()) ||
      getAtPath(this.translations, languagePath(FluidLanguage.ENGLISH));
    return Promise.resolve(translation);
  }

  @Method() async setLanguage(language: FluidLanguage): Promise<void> {
    this.language = language;
    return Promise.resolve();
  }

  @Watch('language')
  onLanguageChanged() {
    this.store.setLanguage(this.language);
  }

  /**
   * Run before the component renders.
   */
  connectedCallback(): void {
    this.store = new FluidI18nStore(this.translations, this.language);
    Utils.consoleWarn(
      { tagName: 'i18n Provider' } as HTMLElement,
      'FLUID i18n Provider Initialised',
      false,
      Utils.infoPillStyle
    );
  }

  /**
   * Main Render function
   */
  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
