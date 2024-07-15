import { FluidI18nStore } from './fluid-i18n-provider/store/fluid-i18n.store';

export type FluidProvider = {
  registerElement: (element: any) => Promise<void>;
  deregisterElement: (element: any) => Promise<void>;
};
export function findRootProvider<T>(providerSelector: string): T | null {
  let currentWindow: Window & typeof globalThis = window;
  let highestInstance: T | null = null;

  const findElement = () => {
    const elements = currentWindow.document.querySelectorAll(providerSelector);
    if (elements.length > 0) {
      highestInstance = elements[0] as unknown as T;
    }
  };

  if (currentWindow === window.top) {
    findElement();
  }

  while (currentWindow !== window.top) {
    findElement();
    currentWindow = currentWindow.parent as Window & typeof globalThis;
  }

  return highestInstance as unknown as T;
}

/**
 * Finds the elements disconnectedCallback, and adds the de-register element
 * call to it.
 * @param element
 * @param store
 */
export function applyDeregisterEvent<T extends HTMLElement>(
  element: T,
  store: FluidI18nStore
) {
  const originalCallBack = Object.getPrototypeOf(element).disconnectedCallback;
  Object.getPrototypeOf(element).disconnectedCallback = () => {
    originalCallBack?.call(element);
    store.deregisterElement(element['_translateId']);
  };
}
