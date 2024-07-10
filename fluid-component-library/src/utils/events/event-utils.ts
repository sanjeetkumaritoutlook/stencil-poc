import { FluidKeyedObject } from '@lmig/fluid-core';

import { Utils } from '../utils';

/**
 * Browser-specific key codes
 */
export const ENTER = 'Enter';
export const BACKSPACE = 'Backspace';
export const SPACE = ' ';
export const TAB = 'Tab';
export const SHIFT = 'Shift';

export const ESCAPE = Utils.browserIsMsie() ? 'Esc' : 'Escape';
export const DELETE = Utils.browserIsMsie() ? 'Del' : 'Delete';

export const ARROW_UP = Utils.browserIsMsie() ? 'Up' : 'ArrowUp';
export const ARROW_DOWN = Utils.browserIsMsie() ? 'Down' : 'ArrowDown';
export const ARROW_LEFT = Utils.browserIsMsie() ? 'Left' : 'ArrowLeft';
export const ARROW_RIGHT = Utils.browserIsMsie() ? 'Right' : 'ArrowRight';
export const ARROW_KEYS = [ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT];

export class EventUtils {
  /**
   * Determines if a key press (KeyboardEvent) matches specified key(s).
   * @param e - KeyboardEvent containing key in question.
   * @param accepted - String or array of accepted key name(s).
   */
  static isKey = (e: KeyboardEvent, accepted: string | string[]): boolean => {
    if (!e) return false;

    if (Array.isArray(accepted)) {
      return accepted.includes(e.key);
    } else {
      return e.key === accepted;
    }
  };

  /**
   * Determines if key pressed is a printable character. Returns
   * true if key is alphanumeric or punctuation character. Returns
   * false if key is a modifier key, system/control key, navigation key,
   * or function key.
   * @param e - KeyboardEvent containing key in question.
   */
  static isCharacterKey = (e: KeyboardEvent): boolean => {
    return e.key.length === 1;
  };

  /**
   * Cancels default behavior of specified keys.
   * Useful for cancelling space, arrow keys, etc.
   */
  static preventDefault = (e: KeyboardEvent, prevented: string[]) => {
    if (!prevented.includes(e.key)) return;
    e.preventDefault();
  };

  /**
   * Converts Arrow Key Events to Tab equivalent.
   * Right/down arrows convert to Tab, left/up arrows convert to Shift+Tab.
   */
  static arrowToTab = (e: KeyboardEvent) => {
    if (!EventUtils.isKey(e, ARROW_KEYS)) return;
    e.preventDefault();
    const ele = e.target as HTMLElement;

    if (e.key === ARROW_DOWN || e.key === ARROW_RIGHT) {
      let sibling = ele.nextElementSibling as HTMLElement;
      while (sibling && sibling.tabIndex < 0) {
        sibling = sibling.nextElementSibling as HTMLElement;
      }
      if (sibling) {
        sibling.focus();
      }
    } else {
      let sibling = ele.previousElementSibling as HTMLElement;
      while (sibling && sibling.tabIndex < 0) {
        sibling = sibling.previousElementSibling as HTMLElement;
      }
      if (sibling) {
        sibling.focus();
      }
    }
  };

  /**
   * Converts Enter & Space to click equivalent.
   */
  static keySelect = (e: KeyboardEvent) => {
    if (!EventUtils.isKey(e, [ENTER, SPACE])) return;
    e.preventDefault();
    (e.target as HTMLElement).click();
  };

  /**
   * Determines if an event originated from within particular element(s).
   * If a single HTMLElement is provided, returns true if the event's
   * "composedPath()" array includes the target element (regardless of where
   * the target element is located within the array). If an ARRAY of HTMLElements
   * is provided, returns true if the "composedPath()" array includes AT LEAST ONE
   * of the HTMLElements in the target array.
   *
   * Useful for determining if an event occurs inside/outside a component (e.g.
   * determining if a click event is outside a component to close a menu).
   * NOTE: Tested & working in Chrome, Edge, Firefox, Safari, & IE11.
   *
   * @param event - the event who's "composedPath()" will be checked for the target element(s)
   * @param element - the target element or array of target elements
   */
  static eventPathIncludes = (
    event: Event,
    element: HTMLElement | HTMLElement[]
  ): boolean => {
    if (!event || !element) return;
    const eventPath = event.composedPath();

    if (Array.isArray(element)) {
      return element.some(
        (targetEl) => !!eventPath.find((pathEl) => pathEl === targetEl)
      );
    } else {
      return !!eventPath.find((pathEl) => pathEl === element);
    }
  };

  static hijackEvent = (
    event: CustomEvent<any>,
    eventConfig: FluidKeyedObject<Function>,
    elementRef: any
  ): CustomEvent => {
    if (eventConfig?.[event.type]) {
      eventConfig[event.type](event.detail, elementRef);
    }
    return event;
  };

  /**
   * Prevents default behaviour of any given event (use when using
   * components nested inside themselves where event propagation would
   * be less than ideal)
   * @param e
   */
  static stopEvent = (e: Event | CustomEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
  };
}
