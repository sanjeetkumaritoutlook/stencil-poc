import { Component, h, Listen,Prop, Event, EventEmitter ,Watch} from '@stencil/core';
//npm i query-selector-shadow-dom
import {  querySelectorDeep} from "query-selector-shadow-dom";
//https://www.tiny.cloud/docs/advanced/usage-with-module-loaders/webpack/webpack_es6_npm/
//npm install tinymce
import tinymce from 'tinymce';    //simply import 'tinymce' doesnt work
//https://www.tiny.cloud/docs/tinymce/latest/bundling-models/
import 'tinymce/models/dom/model';

//https://stackoverflow.com/questions/68951483/tinymce-err-aborted-404-not-found-skins-vue
 /* Default icons are required for TinyMCE 5.3 or above */
 import 'tinymce/icons/default';

 /* A theme is also required */
 import 'tinymce/themes/silver';
 /* Import the skin */
 import 'tinymce/skins/ui/oxide/skin.css';

 /* Import plugins */
 import 'tinymce/plugins/advlist';
 import 'tinymce/plugins/code';
 import 'tinymce/plugins/emoticons';
 import 'tinymce/plugins/emoticons/js/emojis';
 import 'tinymce/plugins/link';
 import 'tinymce/plugins/lists';
 import 'tinymce/plugins/table';

 /* Import premium plugins */
 /* NOTE: Download separately and add these to /src/plugins */
 /* import './plugins/checklist/plugin'; */
 /* import './plugins/powerpaste/plugin'; */
 /* import './plugins/powerpaste/js/wordimport'; *
/* Import content css */
//import contentUiCss from 'tinymce/skins/ui/oxide/content.min.css';
//import contentCss from 'tinymce/skins/content/default/content.css';
import { myString } from './tablecode';
//npm install tinymce@^5
//TypeScript needs type definitions to understand the structure of the 'tinymce' module. 
//npm install --save-dev @types/tinymce

//stackblitz
// https://stackblitz.com/github/ionic-team/stencil-component-starter?file=readme.md
//https://stackblitz.com/edit/github-mfsmeh-gx5b4v?file=src%2Fcomponents%2Frtf-editor%2Frtf-editor.tsx

@Component({
  tag: 'custom-rtf',
  styleUrl: 'custom-rtf.css',
  shadow: true,
})
export class CustomRtf {
  @Prop() initialvalue: string;

  @Event() valueChange: EventEmitter<string>;
  @Event() editorFocus: EventEmitter<void>;
  @Event() editorBlur: EventEmitter<void>;
  @Event() contentChanged: EventEmitter<any>;
  

  constructor() {
    // Define the skin URL. This can be dynamic if necessary.
   // this.skinUrl = 'node_modules/tinymce/skins/ui/oxide';
  }

  private editor: any; // Store a reference to the TinyMCE editor instance
 // @State() editor: any; // Assuming you have a state variable to hold the Tinymce editor instance

 @Watch('value')
 onValueChange(newValue: string) {
   if (this.editor && this.editor.getContent() !== newValue) {
     this.editor.setContent(newValue);
   }
 }
  //initialize TinyMCE properly within your component. lifecycle method
  componentDidLoad() {
   // Check if editor is already initialized
   if (!this.editor) {
    const textarea = querySelectorDeep('#my-tinymce-component');
    if (textarea) {
    tinymce.init({
      //Create a configuration object for TinyMCE. Customize it according to your needs:
     // selector: 'textarea',
     target: textarea,  // HTML element convert into a TinyMCE editor.
      placeholder: 'Type here...',
       // Other configurations...
       //https://www.tiny.cloud/docs/configure/integration-and-setup/
       //https://www.tiny.cloud/docs/configure/editor-appearance/#skin_url
       //https://www.tiny.cloud/docs/tinymce/latest/basic-setup/ 
      promotion: false, //hides the Upgrade promotion button
     apiKey:"qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc",
    //apiKey="limjfdlb66u3w96h1skw5m93kdvmf55zt4ohb3ol4jeb3q6m",
    fontsize_formats: "2pt 4pt 6pt 8pt 10pt 12pt 14pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 34pt 36pt",
     font_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n',
     width:800,
     height: 350,
     resize:'both', //https://www.tiny.cloud/docs/tinymce/latest/editor-size-options/
     theme: 'silver',        // Choose a theme ('modern', 'silver', 'inlite','mobile' etc.)
     //https://www.tiny.cloud/docs/tinymce/latest/editor-skin/
     //skin: 'oxide',
     skin: false,
     //Copy Tinymce assets to a local folder, for example, 'src/assets/tinymce/'.
    skin_url: '../../assets/tinymce/skins/ui/oxide',
    //skin_url: this.skinUrl,
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
      //directly referencing paths within node_modules is not always recommended.
      //CSS hacks
      //https://www.tiny.cloud/blog/css-hacks/
      //https://github.com/tinymce/tinymce/issues/4886
     content_css: '../../assets/tinymce/skins/ui/oxide/content.min.css',
      // content_style: contentUiCss.toString() + '\n' + contentCss.toString(),
      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
      //https://www.tiny.cloud/docs/tinymce/latest/tinymce-for-mobile/
      mobile: {
        theme: 'silver',
        width:350,
        height: 350,
        menubar: true,
        plugins: ['autosave', 'lists', 'autolink']
      },
      //setup callback assigns the editor 
      setup: (editor) => {
        this.editor = editor; // Store the editor instance

        editor.on('change keyup', () => {
          const content = editor.getContent();
          this.valueChange.emit(content);
        });

        editor.on('keyup', () => {
          console.log('Editor was clicked');
      });
       // Add an event listener for the input event
       editor.on('input', () => {
        this.handleEditorInput();
      });
      editor.on('change', () => {
        console.log('Editor on change');
        this.contentChanged.emit(editor.getContent());
      });

      editor.on('focus', () => {
        this.editorFocus.emit();
      });

      editor.on('blur', () => {
        this.editorBlur.emit();
      });


      },
    });
  
  }
  }
  }

    // Custom logic to handle input events
    handleEditorInput() {
      // Access the content of the editor
      const editorContent = this.editor.getContent();
      // Implement your custom logic here
      console.log('Editor content on input changed:', editorContent);
    }
  @Listen('input', { target: 'document' })
  handleInput() {
    // Handle input events if needed
  }
  
  
  //Before performing any operations- GET or SET- ensure that the this.editor instance is available
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
  handleEvent() {
    this.contentChanged.emit({ detail: 'some data' });
  }
  //componentDidUnload() deprecated
  disconnectedCallback() {
    // tinymce.remove(`#my-tinymce-component`);
    const el = querySelectorDeep('#my-tinymce-component');
    tinymce.remove(el);
    this.editor = null; // Clear the reference during component unload
  }
  render() {
    return (
       <div>
        {/* <button onClick={() => this.handleEvent()}>Click me</button> */}
        <div id="my-tinymce-component" innerHTML={this.initialvalue}></div>
        <button onClick={() => this.getContentFromEditor()}>Get Content/Save </button>
       <button onClick={() => this.setContentInEditor(myString)}>Set Content</button>
        <button onClick={() => this.setContentInEditor('')}>Clear Content</button>
      </div>
    );
  }

}
