import { Component, h } from '@stencil/core';
//npm i query-selector-shadow-dom
import {  querySelectorDeep} from "query-selector-shadow-dom";
//https://www.tiny.cloud/docs/advanced/usage-with-module-loaders/webpack/webpack_es6_npm/
//npm install tinymce
import tinymce from 'tinymce';    //simply import 'tinymce' doesnt work
//https://www.tiny.cloud/docs/tinymce/latest/bundling-models/
import '../../../node_modules/tinymce/models/dom/model';

//https://stackoverflow.com/questions/68951483/tinymce-err-aborted-404-not-found-skins-vue
 /* Default icons are required for TinyMCE 5.3 or above */
 import '../../../node_modules/tinymce/icons/default';

 /* A theme is also required */
 import '../../../node_modules/tinymce/themes/silver';
 /* Import the skin */
  import '../../../node_modules/tinymce/skins/ui/oxide/skin.css';

 /* Import plugins */
 import '../../../node_modules/tinymce/plugins/advlist';
 import '../../../node_modules/tinymce/plugins/code';
 import '../../../node_modules/tinymce/plugins/emoticons';
 import '../../../node_modules/tinymce/plugins/emoticons/js/emojis';
 import '../../../node_modules/tinymce/plugins/link';
 import '../../../node_modules/tinymce/plugins/lists';
 import '../../../node_modules/tinymce/plugins/table';

 /* Import premium plugins */
 /* NOTE: Download separately and add these to /src/plugins */
 /* import './plugins/checklist/plugin'; */
 /* import './plugins/powerpaste/plugin'; */
 /* import './plugins/powerpaste/js/wordimport'; *
/* Import content css */
import contentUiCss from '../../../node_modules/tinymce/skins/ui/oxide/content.min.css';
import contentCss from '../../../node_modules/tinymce/skins/content/default/content.css';

//npm install tinymce@^5
//TypeScript needs type definitions to understand the structure of the 'tinymce' module. 
//npm install --save-dev @types/tinymce

//Cannot find name 'tinymce'
//due to TypeScript not recognizing the 'tinymce' module. 
//  declare const tinymce: any;

@Component({
  tag: 'custom-rtf',
  styleUrl: 'custom-rtf.css',
  shadow: true,
})
export class CustomRtf {
  private editor: any; // Store a reference to the TinyMCE editor instance
  
  //initialize TinyMCE properly within your component. lifecycle method
  componentDidLoad() {
   // Check if editor is already initialized
   if (!this.editor) {
    const textarea = querySelectorDeep('textarea');
    if (textarea) {
    tinymce.init({
      //Create a configuration object for TinyMCE. Customize it according to your needs:
     // selector: 'textarea',
     target: textarea,  // HTML element convert into a TinyMCE editor.
       // Other configurations...
       //https://www.tiny.cloud/docs/configure/integration-and-setup/
       //https://www.tiny.cloud/docs/configure/editor-appearance/#skin_url
       //https://www.tiny.cloud/docs/tinymce/latest/basic-setup/ 
     apiKey:"qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc",
    //apiKey="limjfdlb66u3w96h1skw5m93kdvmf55zt4ohb3ol4jeb3q6m",
    fontsize_formats: "2pt 4pt 6pt 8pt 10pt 12pt 14pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 34pt 36pt",
     font_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n',
     width:600,
     height: 300,
     theme: 'silver',        // Choose a theme ('modern', 'silver', 'inlite', etc.)
     skin: false,
     skin_url: '../../../node_modules/tinymce/skins/ui/oxide',
      // plugins: [
      //   "powerpaste advlist advtable autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
      //   "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
      //   "save table contextmenu directionality emoticons template paste textcolor filemanager"
      // ],
      plugins: [  "code", "table", "link","advlist", "lists"],
       block_formats: 'Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3',
      branding: false,
       menubar: 'file edit view insert format tools table tc help',
      toolbar: 'undo redo | formatselect | ' +
               'bold italic backcolor | alignleft aligncenter ' +
               'alignright alignjustify | bullist numlist outdent indent | ' +
               'removeformat | help',
      //paste Core plugin options
      paste_block_drop: false,
      paste_data_images: true,
      paste_as_text: true,          
      noneditable_noneditable_class: 'mceNonEditable',
      content_css: [
        '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
        '//www.tiny.cloud/css/codepen.min.css'
      ],
    //  content_css: '../../../node_modules/tinymce/skins/ui/oxide/content.css',
      content_style: contentUiCss.toString() + '\n' + contentCss.toString(),
      //setup callback assigns the editor 
      setup: (editor) => {
        this.editor = editor; // Store the editor instance
        editor.on('keyup', () => {
          console.log('Editor was clicked');
      });
      },
    });
  
  }
  }
  }
  
  // async componentWillLoad() {
  //   try {
  //     const response = await fetch('models/dom/model.js');
  //     const modelData = await response.json();
  //     // Handle the loaded model data
  //   } catch (error) {
  //     console.error('Error loading model:', error);
  //   }
  // }
  //Before performing any operations- GET or SET- ensure that the this.editor instance
  getContentFromEditor() {
    if (this.editor) {
      // Access properties or methods of the TinyMCE editor instance
      const content = this.editor.getContent();
      console.log('Content from TinyMCE editor:', content);
      return content;
    } else {
      console.error('TinyMCE editor instance not available.');
      return null;
    }
  }

  setContentInEditor(newContent: string) {
    if (this.editor) {
      this.editor.setContent(newContent);
      console.log('Content set in TinyMCE editor:', newContent);
    } else {
      console.error('TinyMCE editor instance not available.');
    }
  }

  //componentDidUnload() deprecated
  disconnectedCallback() {
    // tinymce.remove(`#my-tinymce-component`);
    const el = querySelectorDeep('textarea');
    tinymce.remove(el);
    this.editor = null; // Clear the reference during component unload
  }
  render() {
    return (
       <div>
        <textarea id="my-tinymce-component"></textarea>
        <button onClick={() => this.getContentFromEditor()}>Get Content</button>
        <button onClick={() => this.setContentInEditor('New content')}>Set Content</button>
      </div>
    );
  }

}
