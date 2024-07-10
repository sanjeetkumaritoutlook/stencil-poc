import {
  convertToCamel,
  FluidElementState,
  FluidKeyedObject,
  FluidThemeInterface,
  isNullOrUndefined,
} from '@lmig/fluid-core';
import { ComponentInterface } from '@stencil/core';
import { isEqual, isMatch } from 'lodash';
import { timer } from 'rxjs';
import { takeWhile, timeout } from 'rxjs/operators';
import Timeout = NodeJS.Timeout;

import { BASE_ZINDEX, ZINDEX_MAGNITUDES } from '../constants/constants';
import { ElementRegistry } from './elements/element-registry.utils';

export const TOKEN_OPEN = '<~';
export const TOKEN_CLOSE = '~>';

/**
 * Utility type for function receiving a parameter of type T
 * and returning a Boolean value.
 */
export type BooleanReturn<T> = (param: T) => boolean;
export type StringReturn<T> = (param: T) => string;

export function FluidEvent<T>(value: T): CustomEvent<T> {
  return { detail: value } as CustomEvent<T>;
}

export class Utils {
  static pillStyle =
    'font-size: 9.5px;' +
    'font-weight: bold;' +
    'padding: 2px 6px;' +
    'border-radius: 3px;';

  static warningPillStyle =
    Utils.pillStyle + 'background-color: #ffd000; color: #4E3E00;';

  static infoPillStyle =
    Utils.pillStyle + 'background-color: #78e1e1; color: #04363E;';

  static boldStyle = 'font-weight: bold; text-decoration: underline;';

  static devUrl = 'https://dev3-iunderwrite.lmig.com';
  static maxRefreshTimeout = 15000;

  /**
   * Performs a deep comparison between two values to determine
   * if they are equivalent.
   */
  static isEqual(valueOne: any, valueTwo: any) {
    return isEqual(valueOne, valueTwo);
  }

  /**
   * Performs a partial deep comparison between "obj" and "src"
   * to determine if object contains equivalent property values.
   * @param obj - The object to inspect
   * @param src - The object of property values to match
   */
  static isMatch(obj: object, src: object) {
    return isMatch(obj, src);
  }

  static isEmptyObject(obj: object) {
    return Object.keys(obj).length === 0;
  }

  static getHost(
    hostName = window.location.hostname,
    protocol = window.location.protocol
  ): string {
    let url = `${protocol}//${hostName}`;
    if (hostName.indexOf('localhost') > -1) {
      url = this.devUrl;
    }
    return url;
  }

  static isDevTestLocalPerfStage(hostName = window.location.hostname): boolean {
    return (
      hostName.indexOf('stage') > -1 ||
      hostName.indexOf('perf') > -1 ||
      hostName.indexOf('dev3') > -1 ||
      hostName.indexOf('test') > -1 ||
      hostName.indexOf('localhost') > -1
    );
  }

  static isDevOrLocal(hostName = window.location.hostname): boolean {
    return (
      hostName.indexOf('localhost') > -1 ||
      hostName.indexOf('dev3') > -1 ||
      hostName.indexOf('stackblitz.io') > -1
    );
  }

  static watchAttr = (
    attr: string | string[],
    host: HTMLElement,
    callback: MutationCallback
  ): MutationObserver => {
    const observer = new MutationObserver(callback);
    observer.observe(host, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: Array.isArray(attr) ? attr : [attr],
    });
    return observer;
  };

  static watchChildContent = (
    host: HTMLElement,
    callback: MutationCallback,
    options?: MutationObserverInit
  ): MutationObserver => {
    const defaultConfig = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    };

    const config = options ? { ...options } : defaultConfig;

    const observer = new MutationObserver(callback);
    observer.observe(host, config);
    return observer;
  };

  static querySelector = <T extends HTMLElement = HTMLElement>(
    host: T,
    selector: string
  ) => {
    return host.shadowRoot
      ? host.shadowRoot.querySelector(selector)
        ? host.shadowRoot.querySelector(selector)
        : host.querySelector(selector)
      : host.querySelector(selector);
  };

  static querySelectorAll = (host: HTMLElement, selector: string) => {
    return host.shadowRoot
      ? host.shadowRoot.querySelectorAll(selector)
        ? host.shadowRoot.querySelectorAll(selector)
        : host.querySelectorAll(selector)
      : host.querySelectorAll(selector);
  };

  /**
   * Traverses the "host" element & and its parents (heading toward the
   * document root) until it finds a node that matches the specified CSS
   * selector. Differs from default JS "closest()" method in that it
   * traverses slots (named & unnamed) & crosses Shadow DOM boundaries.
   * @param host - the target element
   * @param selector - the target CSS selector to match
   */
  static closestAncestor = (host: HTMLElement, selector: string) => {
    const _closest = (el: Element, newContext = false): Element => {
      if (!el || el === document.body) return null;

      switch (true) {
        case newContext && !!el.closest(selector):
          return el.closest(selector);
        case !!el.assignedSlot:
          return _closest(
            el.assignedSlot.parentElement ?? el.assignedSlot,
            true
          );
        case !!el.parentElement:
          return _closest(el.parentElement);
        default:
          return _closest((el.getRootNode() as ShadowRoot).host, true);
      }
    };

    return _closest(host, true);
  };

  static asyncFunction = (fn) => Promise.resolve().then(fn);

  /**
   * Returns Theme Provider element from Element Registry (if one exists).
   * If Theme Provider element does not exist in registry because it hasn't
   * loaded yet, subscribes to "themeProviderState$" BehaviorSubject &
   * returns the element when it becomes available (then unsubscribes itself
   * via the "takeWhile" operator OR times out & unsubscribes after 2.5s).
   * If no Theme Provider element exists at all, returns a rejected Promise.
   */
  static async getThemeProvider(): Promise<HTMLFluidThemeProviderElement> {
    return (
      ElementRegistry.themeProviderElement ??
      new Promise<HTMLFluidThemeProviderElement>((resolve, reject) => {
        ElementRegistry.themeProviderState$
          .pipe(
            takeWhile((state) => !state, true),
            timeout(2500)
          )
          .subscribe({
            next: (themeProvider: FluidElementState) => {
              if (!themeProvider) return;
              resolve(themeProvider.element as HTMLFluidThemeProviderElement);
            },
            error: () => reject(),
          });
      })
    );
  }

  /**
   * Sets a component's local theme to match the "global" theme (i.e. the
   * theme set on FLUID Theme Provider). Subscribes to Element Registry's
   * "themeProviderState$" BehaviorSubject, which becomes available as soon
   * as Theme Provider is connected to the DOM (i.e. on Theme Provider's
   * "connectedCallback()"). Also "hijacks" the component's
   * "disconnectedCallback" method & attaches "Utils.removeGlobalTheme()",
   * which unsubscribes from Element Registry's BehaviorSubject & removes
   * the local variable from memory.
   * @param host - a component instance that supports theming
   */
  static setGlobalTheme = (host: ComponentInterface & FluidThemeInterface) => {
    if (host.overrideGlobalTheme) return;
    host._themeSubscription$ = ElementRegistry.themeProviderState$.subscribe(
      (themeProvider: FluidElementState) => {
        if (!themeProvider?.dataStore || !!host.overrideGlobalTheme) return;
        host.theme = themeProvider.dataStore.theme;
        host.themePalette = themeProvider.dataStore.themePalette;
      }
    );

    // Hijack component's "disconnectedCallback()" & attach "Utils.removeGlobalTheme()"
    const { disconnectedCallback } = host;
    host.disconnectedCallback = function () {
      Utils.removeGlobalTheme(host);
      return disconnectedCallback?.call(this);
    };
  };

  /**
   * If component is receiving updates to the global theme, unsubscribes
   * from Element Registry's "themeProviderState$" BehaviorSubject & removes
   * the local variable from memory (prevents RxJS memory leaks).
   * @param host - a component instance that supports theming
   */
  static removeGlobalTheme = (
    host: ComponentInterface & FluidThemeInterface
  ) => {
    if (!host._themeSubscription$) return;
    host._themeSubscription$.unsubscribe();
    delete host._themeSubscription$;
  };

  static setZIndex = (host: { zIndex?: number; tagName: string }) => {
    const setHostZIndex = (baseZIndex) =>
      (host.zIndex =
        host.zIndex ??
        baseZIndex + ZINDEX_MAGNITUDES[convertToCamel(host.tagName)]);

    Utils.getThemeProvider()
      .then((themeProvider) => {
        setHostZIndex(themeProvider.baseZIndex ?? BASE_ZINDEX);
      })
      .catch(() => setHostZIndex(BASE_ZINDEX));
  };

  static setTabIndex = (isTabbable: boolean) => {
    return isTabbable ? 0 : -1;
  };

  static isShadowNode = (node: Node) =>
    node?.toString() === '[object ShadowRoot]';

  static getChildrenOfType = (host: HTMLElement, type: string) => {
    const children = [];
    host.querySelectorAll(type).forEach((v) => children.push(v));
    return children;
  };

  /**
   * Returns all direct children of a component's named/unnamed Slot
   *
   * @param {HTMLElement} host - Host element containing the target Slot
   * @param {string}      name - Slot name (targets unnamed Slot if omitted)
   */
  static getSlotChildren = (host: HTMLElement, name = ''): HTMLElement[] => {
    let slotChildren: HTMLElement[] = [];

    // TODO: TEST THIS!

    if (host.shadowRoot) {
      const slotQuery = name ? `slot[name="${name}"]` : 'slot';
      const slotEl = host.shadowRoot.querySelector(
        slotQuery
      ) as HTMLSlotElement;
      slotChildren = Utils.toHtmlArray(slotEl?.assignedElements());
    } else {
      const tagName = host.tagName.toLowerCase();
      const slotQuery = name
        ? `[slot="${name}"]`
        : `.sc-${tagName}-s > *:not([slot])`;
      const matchedNodes = Array.from(host.querySelectorAll(slotQuery));
      slotChildren = matchedNodes
        .filter((n) => n.nodeType === Node.ELEMENT_NODE)
        .map((n) => n as HTMLElement);
    }

    return slotChildren;
  };

  static browserIsMsie = () => {
    const userAgent = window.navigator.userAgent;
    const msie = userAgent.indexOf('MSIE ');
    return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
  };

  static deprecationWarning = (
    component: HTMLElement,
    context: string,
    oldProp: string,
    newProp: string,
    propInterface: string,
    oldPropType?: string,
    extraInfo?: string
  ) => {
    if (!Utils.isDevOrLocal()) return;

    const oldPropMessage = oldPropType
      ? `${oldProp} as ${oldPropType}`
      : oldProp;

    console.warn(
      `%c${component.tagName}%c ${context}:

        %c${oldPropMessage}%c is deprecated.

        Please use %c${newProp} as ${propInterface}%c instead.

        ${extraInfo ? extraInfo : ''}

        Visit %chttps://fluid-test.lmig.com/fluid-documentation/development/deprecation%c
        for more info on deprecation in FLUID.`,
      Utils.warningPillStyle,
      '',
      Utils.boldStyle,
      '',
      Utils.boldStyle,
      '',
      Utils.boldStyle,
      ''
    );
  };

  static consoleWarn = (
    component: HTMLElement,
    message: string,
    devOnly = false,
    pillColor = Utils.warningPillStyle
  ) => {
    const warning = () =>
      console.warn(`🧪 %c${component.tagName}%c ${message}`, pillColor, '');
    if (devOnly) {
      if (Utils.isDevOrLocal()) {
        warning();
      }
    } else {
      warning();
    }
  };

  /**
   * Wait for next global animation frame to be rendered
   * Useful for pausing a function while component renders updates
   * before accessing the newly rendered properties / attributes
   */
  static async nextTick() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      let didChange = false;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          didChange = true;
          resolve(didChange);
        });
      });
      // Fallback
      setTimeout(() => {
        if (!didChange) resolve(didChange);
      }, 1000 / 60); // 60fps
    });
  }

  /**
   * Shorthand for timer().subscribe
   * Allows you to delay execution of the given callback by the
   * number of milliseconds provided.
   * @param timeInMilliseconds
   * @param callback
   */
  static delayBy(timeInMilliseconds = 300, callback: Function) {
    timer(timeInMilliseconds).subscribe(() => {
      callback();
    });
  }

  /**
   * Enforce a maximum number of times a function can be called over time
   * (i.e. "execute this function at most once every 100ms")
   * Useful for reducing callbacks from event listeners (e.g. scroll events)
   */
  static throttle = <T extends []>(
    callback: (..._: T) => void,
    wait: number
  ): ((..._: T) => void) => {
    let queuedToRun: Timeout | number | undefined;
    let previouslyRun: number;
    return function invokeFn(...args: T) {
      const now = Date.now();
      queuedToRun = clearTimeout(queuedToRun) as undefined;
      if (!previouslyRun || now - previouslyRun >= wait) {
        callback(...args);
        previouslyRun = now;
      } else {
        queuedToRun = setTimeout(
          invokeFn.bind(null, ...args),
          wait - (now - previouslyRun)
        );
      }
    };
  };

  /**
   * Restrict the frequency of calls that a function receives to a fixed time interval
   * (i.e. "only execute this function if 100ms have passed without it being called")
   */
  static debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  static asyncDebounce(func, wait: number, immediate?: boolean) {
    let timeout;
    return (...args) => {
      return new Promise((resolve) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          timeout = null;
          if (!immediate) {
            Promise.resolve(func.apply(this, [...args])).then(resolve);
          }
        }, wait);
        if (immediate && !timeout) {
          Promise.resolve(func.apply(this, [...args])).then(resolve);
        }
      });
    };
  }

  static toHtmlArray = (
    elements: Element[] | HTMLCollection
  ): HTMLElement[] => {
    if (!elements?.length) return [];
    return Array.from(elements).map((el) => el as HTMLElement);
  };

  static arrayOf = (number: number) => Array.from({ length: number });

  static isUniqueArray = (values: any[]) =>
    new Set(values).size === values.length;

  static isNullOrUndefined = (value: any, includeEmptyString?: boolean) =>
    value === null ||
    value === undefined ||
    (includeEmptyString && value === '') ||
    false;

  static isEmpty = (value: any) => value == null || value.length === 0;

  static isNumber = (val: any): boolean => {
    return !Number.isNaN(parseInt(val, 10));
  };

  static isFluidEnum<T>(value: any, e: unknown): boolean {
    return Object.values(e as T).includes(value);
  }

  static isFunction = (fn: Function | undefined | unknown) =>
    !Utils.isNullOrUndefined(fn) && typeof fn === 'function';

  static asFunction = (fn: Function | unknown) => fn as Function;

  static iterate<T>(object: FluidKeyedObject<T>): T[] {
    return !!object && typeof object === 'object'
      ? Object.keys(object).map((key) => object[key] as T)
      : [];
  }

  /**
   * Selectively maps the values of a "config" Prop to the component's
   * corresponding local Props. Each value in "config" is compared against
   * the existing value of the corresponding local Prop before the mapping
   * is executed - if the values are the same, the mapping is canceled to
   * prevent unnecessary component re-renders.
   *
   * Also, sets _disableWatch (private variable) to "true" if it exists in
   * the component. Prevents arbitrary execution of host's @Watch methods
   * while "config" values are being mapped (i.e. allows granular
   * control over @Watch method timing & order of execution).
   *
   * Finally, allows for certain properties to be deleted from the "config"
   * Prop AFTER mapping is complete. Prevents certain dynamic Props (e.g. Form
   * Element "value" Prop) from being unintentionally mapped more than once
   * when a component's "config" Prop is updated by merging existing properties
   * with new properties (i.e. using the spread operator).
   *
   * @param host - FLUID component class instance (NOT "host" HTMLElement)
   * @param config - the component's "config" Prop
   * @param deleteKeys - keys for properties to be deleted AFTER mapping completes
   */
  static selectiveMapConfigToLocal(host, config, deleteKeys?: string[]) {
    if (!config) return;
    !isNullOrUndefined(host._disableWatch) && (host._disableWatch = true);

    Object.keys(config).forEach((key) => {
      if (JSON.stringify(host[key]) !== JSON.stringify(config[key])) {
        host[key] = config[key];
      }
      if (deleteKeys?.includes(key)) {
        delete config[key];
        console.debug(
          `ℹ️ %c${host.host.tagName}%c "${key}" property has been removed from "config" Prop so that it isn't mapped to the component's local "${key}" Prop more than once.`,
          Utils.infoPillStyle,
          ''
        );
      }
    });
  }

  /**
   * Disables page scrolling. Use with components that appear above page
   * content that should not allow background scrolling while visible.
   * Accepts optional "document" parameter for components that aren't
   * children of the top-level document (i.e. nested within <iframe>).
   * @param doc - document that should have scrolling disabled
   */
  static disableBodyScroll = (doc: Document = document) => {
    doc.body.dataset.fluidOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';
  };

  /**
   * Re-enables page scrolling if (and only if) scrolling was previously
   * disabled with "disableBodyScroll()". Tested & confirmed working in IE11.
   * Accepts optional "document" parameter for components that aren't
   * children of the top-level document (i.e. nested within <iframe>).
   * @param doc - document that should have scrolling enabled
   */
  static enableBodyScroll = (doc: Document = document) => {
    if (!('fluidOverflow' in doc.body.dataset)) return;
    if (doc.body.dataset.fluidOverflow) {
      doc.body.style.overflow = doc.body.dataset.fluidOverflow;
    } else {
      doc.body.style.removeProperty('overflow');
    }
    delete doc.body.dataset.fluidOverflow;
    doc.body.removeAttribute('data-fluid-overflow');
  };

  /**
   * Returns true if element currently has :focus, regardless of whether
   * the :focused element exists within a component's Shadow DOM or not.
   * NOTE: this should only be used on elements that can receive :focus,
   * NOT FLUID component instances that CONTAIN a focusable element.
   * @param el - the element to test for :focus
   * @param root - the Document that contains the element
   */
  static hasFocus = (el: HTMLElement, root?: Document): boolean => {
    return Utils.getActiveElement(root) === el;
  };

  /**
   * Failsafe method of transferring :focus to an element that compensates
   * for loading / animation delays. If initial "focus()" call doesn't work,
   * attempts to transfer :focus every 100ms for 5s or until successful.
   * @param el - the element to test for :focus
   * @param root - the Document that contains the element
   */
  static setFocus = (el: HTMLElement, root?: Document): void => {
    if (!el) return;

    el.focus();
    if (Utils.hasFocus(el, root)) return;

    // Attempt to set :focus every 100ms
    const interval = setInterval(() => {
      Utils.getActiveElement(root) !== el
        ? el.focus()
        : clearInterval(interval);
    }, 100);

    // Stop after 5 seconds
    setTimeout(() => clearInterval(interval), 5000);
  };

  /**
   *
   * @param event
   * @param prevented
   */
  static preventFocus = (
    event: MouseEvent,
    prevented?: HTMLElement | HTMLElement[]
  ): void => {
    if (!event) return;
    const eventTarget = event.composedPath()[0];

    switch (true) {
      case !prevented:
        break;
      case !Array.isArray(prevented) && eventTarget !== prevented:
        return;
      case Array.isArray(prevented) &&
        !prevented.some((el) => el === eventTarget):
        return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Returns DOM element that currently has :focus, regardless of whether
   * the :focused element exists within a component's Shadow DOM or not. This
   * is an enhancement to "document.activeElement", which only returns the
   * shadowRoot.host instead of the individual child element that has :focus
   * within the Shadow DOM.
   * @param root
   */
  static getActiveElement = (
    root: Document | ShadowRoot = document
  ): Element => {
    const activeEl = root.activeElement;
    if (!activeEl) return;
    return activeEl.shadowRoot
      ? Utils.getActiveElement(activeEl.shadowRoot)
      : activeEl;
  };
}
