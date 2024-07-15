# FLUID Translate

FLUID Translate is the translation solution for LM apps that is designed and developed by the 
FLUID team, and integrates with FLUID components automatically, allowing developers to configure 
their apps with translations keys (guide to follow), even if the translations do not exist yet.

## Adding i18n to Components

This guide outlines how internationalisation can be added to currently existing components,
along with an outline of the utilities create in order to facilitate the translations.

New components, will have internationalisation utilities added automatically by the component 
generator.

### Step 1: Adds the i18n Properties to the component

The following properties should be added to any component that has translatable text items, or 
translatable accessibility items.

For convenience, and consistency, they should be added underneath the declaration of the host 
element, and before the rest of the prop declarations. (_Note that placement of the props has 
little bearing on the functionality, but keeps consistency between components_).

> ```
> // ================================================================ //
> // -- Internationalisation
> 
> /* @internal */
> @Prop() fluidTranslate: { content?: string };
> private _translateId: string = generateUniqueId();
> private _i18nStore: FluidI18nStore | undefined;
> ```

The items added are as follows;

### `fluidTranslate`

This is the property exposed to the consumer that dictates which properties they can apply 
translation keys to.

In this example, for `fluid-text`, the only translatable property is the `content`, which is 
used in a translatable slot.

In `fluid-section-detail`, for example, where both the `content` (slot) and the `sectionTitle` 
are translatable, the prop declaration may look like this;

```
/* @internal */
@Prop() fluidTranslate: { content?: string, sectionTitle?: string };
```

Note that the props, for now, are marked as `/* @internal */` - this keeps them hidden from 
the public API while we work through the rest of the components.

### `_translateId`

This private variable is set to a unique ID when the component connects to the DOM, and exists so 
we can de-register the element from the store when it is disconnected from the DOM, freeing up 
memory resources, and helping improve performance.

### `_i18nStore`

The `i18nStore` is a reactive key/value store that is responsible for translation look-ups and notifying 
components of language or translation changes. We will instantiate it in the next step.

### Step 2: Register the component with the i18n Store.

In order to activate translations in your component, you must first register the component instance with 
the i18n store.

This is done in the `connectedCallback()` lifecycle hook by adding the `usei18n` adapter as in the 
example below;

```
useI18n.bind(this)();
```

This should only be called once, when the component connects to the DOM, and the store takes care 
of the rest (registering the element, flattening dictionaries, etc);

For components that have simple flat translatable structures, you do not need to add any further parameters 
at this stage. However, for more complex translations, for example in a component which as translatable 
menu items, the `useI18n` adapter provides a `callbacks` parameter, which allows you to subscribe to 
changes to any of the store properties.

A good example of this is in `fluid-header`, where we need to translate the `links` array whenever the 
language changes. Using the `callbacks` parameter, we can listen for changes to the store for changes 
to the `language` property, and call the `translateMenu` utility as follows;

```
useI18n.bind(this)({
  language: () => (this.links = translateMenu(this.links, this._i18nStore)),
});
```

Here, we tell the store that when language changes, re-assign the local `links` property with the result 
of `translateMenu` with the `links` property.

### Step 3: Apply the de-register callback.

As part of the store connection process, the component is registered with an internal registry so it can 
update every connected component with any changes to the global language.

In order to preserve memory, and improve performance, we should deregister the component whenever 
it disconnects from the DOM, and therefore has no need to be translated anymore.

This is done in the `disconnectedCallback()` lifecycle hook, and is added as follows;

```
this._i18nStore?.deregisterElement(this._translateId);
```

This tells the store to remove the component with the given `_translateId` from the registry 
and cease communication with it. 

### Step 4: Apply translations to translatable nodes.

The final step, is to add the calls to the stores `translate` method anywhere you need a value 
translated.

The `translate` method will handle applying the global language, and doing the dictionary look-up 
and returning the translated text.

If no translation exists for the current language, it will attempt to use the English dictionary, and 
if no English translation exists, it will attempt to use the fallback.

For components that have `content` slots that need translated, a functional utility - `<TranslatableSlot />` -
exists to facilitate. It requires two props - the `i18nStore` and the `translationKey` it should attempt 
to translate.

For other translations, a direct call to `i18nStore?.translate()` with the translation key will 
run the translation. For example, `fluid-button`'s label property can be translated as follows;

```
label={this._i18nStore?.translate(this.fluidTranslate?.label) || this.label}
```

In this case, the label will be translated if a translation exists for the global language, fall back to English 
if none exists for the current language, and if no translations exist at all, falls back to the configured 
`label` property.

Please see [this PR](https://github.com/lmigtech/fluid/pull/967) for an example of adding i18n to a component.

### Step 5: Documentation

This guide will be continued as more components are added, and more utilities are developed.