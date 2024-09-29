/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface CustomRtf {
        "disableQuickbars": boolean;
        "disabled": boolean;
        "initialValue": string;
        /**
          * Optional placeholder text displayed when the form field is empty.
         */
        "placeholder": string;
    }
    interface MyComponent {
        /**
          * The first name
         */
        "first": string;
        /**
          * The last name
         */
        "last": string;
        /**
          * The middle name
         */
        "middle": string;
    }
    interface MyNewComponent {
    }
    interface PageHome {
    }
    interface PayformComponent {
        "amountPayable": number;
        /**
          * Valid API key obtained from cryptocompare.com
         */
        "apiKey": string;
        "refreshCryptoData": () => Promise<void>;
    }
    interface QuillEditor {
        "initialValue": any;
        "readOnly": boolean;
    }
    interface RichTextEditor {
        "apiKey": string;
        "disabled": boolean;
        "initialValue": string;
    }
    interface RtfEditor {
    }
}
export interface CustomRtfCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLCustomRtfElement;
}
declare global {
    interface HTMLCustomRtfElement extends Components.CustomRtf, HTMLStencilElement {
    }
    var HTMLCustomRtfElement: {
        prototype: HTMLCustomRtfElement;
        new (): HTMLCustomRtfElement;
    };
    interface HTMLMyComponentElement extends Components.MyComponent, HTMLStencilElement {
    }
    var HTMLMyComponentElement: {
        prototype: HTMLMyComponentElement;
        new (): HTMLMyComponentElement;
    };
    interface HTMLMyNewComponentElement extends Components.MyNewComponent, HTMLStencilElement {
    }
    var HTMLMyNewComponentElement: {
        prototype: HTMLMyNewComponentElement;
        new (): HTMLMyNewComponentElement;
    };
    interface HTMLPageHomeElement extends Components.PageHome, HTMLStencilElement {
    }
    var HTMLPageHomeElement: {
        prototype: HTMLPageHomeElement;
        new (): HTMLPageHomeElement;
    };
    interface HTMLPayformComponentElement extends Components.PayformComponent, HTMLStencilElement {
    }
    var HTMLPayformComponentElement: {
        prototype: HTMLPayformComponentElement;
        new (): HTMLPayformComponentElement;
    };
    interface HTMLQuillEditorElement extends Components.QuillEditor, HTMLStencilElement {
    }
    var HTMLQuillEditorElement: {
        prototype: HTMLQuillEditorElement;
        new (): HTMLQuillEditorElement;
    };
    interface HTMLRichTextEditorElement extends Components.RichTextEditor, HTMLStencilElement {
    }
    var HTMLRichTextEditorElement: {
        prototype: HTMLRichTextEditorElement;
        new (): HTMLRichTextEditorElement;
    };
    interface HTMLRtfEditorElement extends Components.RtfEditor, HTMLStencilElement {
    }
    var HTMLRtfEditorElement: {
        prototype: HTMLRtfEditorElement;
        new (): HTMLRtfEditorElement;
    };
    interface HTMLElementTagNameMap {
        "custom-rtf": HTMLCustomRtfElement;
        "my-component": HTMLMyComponentElement;
        "my-new-component": HTMLMyNewComponentElement;
        "page-home": HTMLPageHomeElement;
        "payform-component": HTMLPayformComponentElement;
        "quill-editor": HTMLQuillEditorElement;
        "rich-text-editor": HTMLRichTextEditorElement;
        "rtf-editor": HTMLRtfEditorElement;
    }
}
declare namespace LocalJSX {
    interface CustomRtf {
        "disableQuickbars"?: boolean;
        "disabled"?: boolean;
        "initialValue"?: string;
        "onContentChanged"?: (event: CustomRtfCustomEvent<any>) => void;
        "onEditorBlur"?: (event: CustomRtfCustomEvent<void>) => void;
        "onEditorFocus"?: (event: CustomRtfCustomEvent<void>) => void;
        "onValueChange"?: (event: CustomRtfCustomEvent<string>) => void;
        /**
          * Optional placeholder text displayed when the form field is empty.
         */
        "placeholder"?: string;
    }
    interface MyComponent {
        /**
          * The first name
         */
        "first"?: string;
        /**
          * The last name
         */
        "last"?: string;
        /**
          * The middle name
         */
        "middle"?: string;
    }
    interface MyNewComponent {
    }
    interface PageHome {
    }
    interface PayformComponent {
        "amountPayable"?: number;
        /**
          * Valid API key obtained from cryptocompare.com
         */
        "apiKey"?: string;
    }
    interface QuillEditor {
        "initialValue"?: any;
        "readOnly"?: boolean;
    }
    interface RichTextEditor {
        "apiKey"?: string;
        "disabled"?: boolean;
        "initialValue"?: string;
    }
    interface RtfEditor {
    }
    interface IntrinsicElements {
        "custom-rtf": CustomRtf;
        "my-component": MyComponent;
        "my-new-component": MyNewComponent;
        "page-home": PageHome;
        "payform-component": PayformComponent;
        "quill-editor": QuillEditor;
        "rich-text-editor": RichTextEditor;
        "rtf-editor": RtfEditor;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "custom-rtf": LocalJSX.CustomRtf & JSXBase.HTMLAttributes<HTMLCustomRtfElement>;
            "my-component": LocalJSX.MyComponent & JSXBase.HTMLAttributes<HTMLMyComponentElement>;
            "my-new-component": LocalJSX.MyNewComponent & JSXBase.HTMLAttributes<HTMLMyNewComponentElement>;
            "page-home": LocalJSX.PageHome & JSXBase.HTMLAttributes<HTMLPageHomeElement>;
            "payform-component": LocalJSX.PayformComponent & JSXBase.HTMLAttributes<HTMLPayformComponentElement>;
            "quill-editor": LocalJSX.QuillEditor & JSXBase.HTMLAttributes<HTMLQuillEditorElement>;
            "rich-text-editor": LocalJSX.RichTextEditor & JSXBase.HTMLAttributes<HTMLRichTextEditorElement>;
            "rtf-editor": LocalJSX.RtfEditor & JSXBase.HTMLAttributes<HTMLRtfEditorElement>;
        }
    }
}
