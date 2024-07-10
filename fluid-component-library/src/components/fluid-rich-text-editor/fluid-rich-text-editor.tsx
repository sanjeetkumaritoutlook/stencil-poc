import { FluidTheme, FluidThemeInterface } from '@lmig/fluid-core';
import { Component, Element, h, Prop } from '@stencil/core';
import Quill from 'quill';

import { Utils } from '../../utils/utils';

/**
 * @displayName Rich Text Editor
 *
 */
@Component({
  tag: 'fluid-rich-text-editor',
  styleUrl: 'fluid-rich-text-editor.less',
  shadow: false,
})
export class FluidRichTextEditor implements FluidThemeInterface {
  private defaultModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction

      [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [].slice() }, { background: [].slice() }], // dropdown with defaults from theme
      [{ font: [].slice() }],
      [{ align: [].slice() }],

      ['clean'], // remove formatting button

      ['link', 'image', 'video'], // link and image, video
    ],
  };

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
  @Prop({ mutable: true }) theme: FluidTheme = FluidTheme.DEFAULT;

  // ================================================================ //
  // -- Events

  // ================================================================ //
  // -- Methods

  editorElement;
  wrapperElement;
  toolbarElement;
  customToolbarPosition;
  /**
   * Called every time the component is connected to the DOM.
   * @action: setGlobalTheme - updates theme to match global theme & subscribes to changes
   */
  connectedCallback(): void {
    Utils.setGlobalTheme(this);
  }

  renderQuill() {
    const modules = this.defaultModules;
    this.editorElement = document.createElement('div');
    const toolbarElem = this.wrapperElement?.querySelector(
      '[slot="quill-toolbar"]'
    );
    if (toolbarElem) {
      modules['toolbar'] = toolbarElem;
      if (this.customToolbarPosition === 'bottom') {
        this.wrapperElement.prepend(this.editorElement);
      } else {
        this.wrapperElement.append(this.editorElement);
      }
    } else {
      this.wrapperElement.append(this.editorElement);
    }
    const quill = new Quill(this.editorElement, {
      debug: true,
      modules: this.defaultModules,
      theme: 'snow',
    });
    console.log(quill);
  }

  /**
   * Main Render function
   */
  render() {
    return (
      <div
        ref={(el) => {
          this.wrapperElement = el;
          this.renderQuill();
        }}
      >
        <div ref={(el) => (this.toolbarElement = el)}></div>
      </div>
    );
  }
}
