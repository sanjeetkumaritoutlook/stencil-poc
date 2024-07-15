import { FluidKeyedObject, FluidOption } from '@lmig/fluid-core';
import { MockNode, serializeNodeToHtml } from '@stencil/core/mock-doc';
import { newSpecPage } from '@stencil/core/testing';

export class TestUtils {
  static DASH_CASE_REGEXP = /-+([a-z0-9])/g;
  static NON_ALPHANUMERIC_REGEXP = /[\W_]+/g;

  static testOptions: FluidOption[] = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Option 4', value: 'option4' },
  ];

  /**
   * Simple bootstrapper for setting up tests
   * @param type
   * @param html
   */
  static async createPage<T>(type: T, html: string) {
    return await newSpecPage({
      components: [type],
      html,
    });
  }

  /**
   * Mock MutationObserver for tests.
   */
  static mutationObserverMock = jest.fn(function MutationObserver(callback) {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    this.trigger = (mockedMutationsList) => {
      callback(mockedMutationsList, this);
    };
  });

  /**
   * Mock ResizeObserver for tests
   */
  static resizeObserverMock = jest.fn(function ResizeObserver() {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    this.unobserve = jest.fn();
  });

  /**
   * Mock IntersectionObserver for tests.
   */
  static intersectionObserverMock = jest.fn(function IntersectionObserver(
    callback
  ) {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    this.trigger = (mockedIntersectionsList) => {
      callback(mockedIntersectionsList, this);
    };
  });

  /**
   * Mocks window.matchMedia for tests.
   */
  static matchMediaMock = () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  };

  /**
   * Returns the attributes applied to a given component instance
   * @param componentInstance
   */
  static getComponentAttributes = (componentInstance) =>
    componentInstance['$attrs$'];

  /**
   * Create an expects block from an object to provide a short-hand for testing
   * multiple attributes on a rendered element.
   *
   * @param element - the element under test
   * @param attributes - the key/value of attributes under test
   */
  static expectAttributes<T extends HTMLElement>(
    element: T,
    attributes: FluidKeyedObject<any>
  ) {
    expect(element).toBeDefined();
    Object.keys(attributes).forEach((attribute) => {
      expect(element.getAttribute(attribute?.toLowerCase())).toEqual(
        attributes[attribute]
      );
    });
  }

  static expectToHaveAttribute<T extends HTMLElement>(
    element: T,
    attribute: string
  ) {
    expect(element).toBeDefined();
    expect(element.getAttribute(attribute?.toLowerCase())).not.toBeNull();
  }

  static expectAria<T extends HTMLElement>(
    element: T,
    ariaExpectation: FluidKeyedObject<any>
  ) {
    expect(element).toBeDefined();
    const elementAsHtml = serializeNodeToHtml(element).replace(/\\/g, '');
    Object.keys(ariaExpectation).forEach((ariaKey) => {
      expect(elementAsHtml).toContain(
        `${TestUtils.camelCaseToAttributeCase(ariaKey)}="${
          ariaExpectation[ariaKey]
        }"`
      );
    });
  }

  static expectEmpty<T extends HTMLElement>(element: T) {
    expect(element.innerHTML).toEqual(' ');
  }

  static camelCaseToAttributeCase(str: string) {
    return (
      str?.substring(0, 1).toUpperCase() +
      str
        .substring(1, str.length)
        .replace(TestUtils.NON_ALPHANUMERIC_REGEXP, '')
    ).toLowerCase();
  }

  static logElementHtml(element: Node | MockNode): void {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log(serializeNodeToHtml(element));
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  }

  static async await(delay: number) {
    return new Promise((r) => setTimeout(r, delay));
  }
}
