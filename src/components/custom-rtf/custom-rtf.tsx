import { Component, h, Listen,Prop, Event, EventEmitter ,Watch,Element} from '@stencil/core';
//npm i query-selector-shadow-dom
//import {  querySelectorDeep} from "query-selector-shadow-dom";
//https://www.tiny.cloud/docs/advanced/usage-with-module-loaders/webpack/webpack_es6_npm/
//npm install tinymce
//TinyMCE 7.3 was released for TinyMCE Enterprise and Tiny Cloud on Wednesday, August 7th, 2024
//npm install tinymce@^7

import tinymce from 'tinymce';    //simply import 'tinymce' doesnt work
//Demo pages
//https://www.tiny.cloud/docs/tinymce/latest/full-featured-premium-demo/
//https://www.tiny.cloud/docs/tinymce/latest/full-featured-open-source-demo/

//AI Assistant demo
//https://www.tiny.cloud/docs/tinymce/latest/ai/

//https://www.tiny.cloud/docs/tinymce/latest/examples/#general-examples
//https://quilljs.com/

//TinyMCE 7 copy paste from Microsoft word
//https://www.tiny.cloud/docs/tinymce/latest/npm-projects/
//https://www.tiny.cloud/docs/tinymce/latest/webpack-es6-npm/
//https://www.tiny.cloud/blog/tinymce-noneditable/

//https://www.tiny.cloud/docs/tinymce/5/paste-from-word/
//https://www.tiny.cloud/blog/copy-and-paste-from-word-excel/
//https://www.tiny.cloud/docs/tinymce/6/powerpaste-options/#powerpaste_word_import
//https://stackoverflow.com/questions/29997908/paste-from-word-to-tinymce
//https://stackoverflow.com/questions/1255738/tinymce-and-importing-copy-paste-from-microsoft-word

//power paste functionality of tinymce
//https://stackoverflow.com/questions/53232048/tinymce-paste-from-word-not-working-properly
//https://www.tiny.cloud/docs/tinymce/latest/introduction-to-powerpaste/
//https://github.com/tinymce/tinymce/discussions/7487
//https://www.tiny.cloud/blog/copy-and-paste-from-word-excel/

//tinymce 5 toolbar
//https://www.tiny.cloud/blog/tinymce-toolbar/
//https://stackoverflow.com/questions/36623390/tiny-mce-add-font-dropdown-list
//https://stackoverflow.com/questions/63486185/tinymce-5-how-can-i-remove-fontname-and-fontsize-from-the-menu

//Tinymce Fiddle
//https://fiddle.tiny.cloud/xLeaab/0
//https://fiddle.tiny.cloud/6Leaab/1

//trigger save
//https://www.tiny.cloud/blog/tinymce-triggersave/

//https://www.tiny.cloud/docs/tinymce/latest/examples/
//https://www.tiny.cloud/docs/tinymce/latest/plugins/
//$450 per year https://www.tiny.cloud/tinymce-vs-ckeditor/
//https://ckeditor.com/ckeditor-5/demo/

//https://www.tiny.cloud/docs/tinymce/latest/bundling-models/
import 'tinymce/models/dom/model';

//https://stackoverflow.com/questions/68951483/tinymce-err-aborted-404-not-found-skins-vue
/* Default icons are required for TinyMCE 5.3 or above */
 import 'tinymce/icons/default';

 /* A theme is also required */
 import 'tinymce/themes/silver';
 /* Import the skin */
 import 'tinymce/skins/ui/oxide/skin.css';
//https://www.tiny.cloud/blog/fixing-plugin-errors/
 /* Import plugins */
 import 'tinymce/plugins/advlist';
 import 'tinymce/plugins/code';
 import 'tinymce/plugins/emoticons';
 import 'tinymce/plugins/emoticons/js/emojis';
 import 'tinymce/plugins/link';
 import 'tinymce/plugins/lists';
 import 'tinymce/plugins/table';
 import 'tinymce/plugins/wordcount';
 import 'tinymce/plugins/autolink';
 import 'tinymce/plugins/autosave';
 import 'tinymce/plugins/save';
 import 'tinymce/plugins/image';
 import 'tinymce/plugins/insertdatetime';
 import 'tinymce/plugins/visualblocks';
 import 'tinymce/plugins/searchreplace';
 import 'tinymce/plugins/media';
 import 'tinymce/plugins/quickbars';
 import 'tinymce/plugins/preview';
 import 'tinymce/plugins/pagebreak';
 import 'tinymce/plugins/anchor';
 import 'tinymce/plugins/nonbreaking';
 /* Import premium plugins */
 /* NOTE: Download separately and add these to /src/plugins */
 /* import './plugins/checklist/plugin'; */
 /* import './plugins/powerpaste/plugin'; */
 /* import './plugins/powerpaste/js/wordimport'; *
/* Import content css */
//import contentUiCss from 'tinymce/skins/ui/oxide/content.min.css';
//import contentCss from 'tinymce/skins/content/default/content.css';
import { myString } from './tablecode';

//TypeScript needs type definitions to understand the structure of the 'tinymce' module. 
//npm install --save-dev @types/tinymce
//https://www.tiny.cloud/docs/tinymce/latest/content-formatting/

//stackblitz
// https://stackblitz.com/github/ionic-team/stencil-component-starter?file=readme.md
//https://stackblitz.com/edit/github-mfsmeh-gx5b4v?file=src%2Fcomponents%2Frtf-editor%2Frtf-editor.tsx

@Component({
  tag: 'custom-rtf',
  styleUrl: 'custom-rtf.css',
  shadow: false, // Disable Shadow DOM
})
export class CustomRtf {
  @Prop({ mutable: true, reflect: true }) initialvalue: string;
  //to control whether the tinymce editor is editable
  @Prop() disabled: boolean = false; 
  @Prop() disableQuickbars: boolean = false;

  @Element() el: HTMLElement;

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
    const textarea = document.querySelector('#my-tinymce-component');
    const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;
    //this if condition is not required
    if (textarea) {
    tinymce.init({
      //Create a configuration object for TinyMCE. Customize it according to your needs:
     // selector: 'textarea',
     target: this.el.querySelector('#my-tinymce-component'),  // HTML element convert into a TinyMCE editor.
      placeholder: 'Type here...',
       // Other configurations...
       //https://www.tiny.cloud/docs/configure/integration-and-setup/
       //https://www.tiny.cloud/docs/configure/editor-appearance/#skin_url
       //https://www.tiny.cloud/docs/tinymce/latest/basic-setup/ 
      promotion: false, //hides the Upgrade promotion button
      license_key: 'gpl',
    // apiKey:"qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc",
    //apiKey="limjfdlb66u3w96h1skw5m93kdvmf55zt4ohb3ol4jeb3q6m",
    //https://www.tiny.cloud/blog/custom-font-sizes-in-tinymce/
      //HTML custom font options
    font_size_formats: '2pt 4pt 6pt 8pt 10pt 12pt 14pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 34pt 36pt 48pt 60pt 72pt 96pt', 
    width:'100%',
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
      //   "save table contextmenu directionality emoticons template paste textcolor filemanager help"
      // ],
     plugins: [  "code", "table", "link","advlist", "lists","wordcount","autolink","autosave","save","image","insertdatetime","visualblocks","searchreplace","media","quickbars","emoticons","preview","pagebreak","anchor","nonbreaking"],
     // block_formats: 'Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3',
      branding: false,
       menubar: 'file edit view insert format tools table tc help',
       toolbar: "undo redo | formatselect  | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
      //  language: 'en', 
       //paste Core plugin options
      paste_block_drop: false,
      paste_data_images: true,
      //paste_as_text: true,   
    // powerpaste_word_import: 'merge',
      // mceInsertClipboardContent: true,
     // noneditable_noneditable_class: 'mceNonEditable',
     image_advtab: true,
     quickbars_insert_toolbar: this.disableQuickbars
     ? false // Disable the quickbars insert toolbar if the prop is true
     : 'quicktable image media codesample',
     quickbars_selection_toolbar: this.disableQuickbars
     ? false // Disable the quickbars selection toolbar if the prop is true
     : 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
      // spellchecker_active: true,
      // spellchecker_language: 'en_US',
      // spellchecker_languages: 'English (United States)=en_US,English (United Kingdom)=en_GB,Danish=da,French=fr,German=de,Italian=it,Polish=pl,Spanish=es,Swedish=sv',
      //directly referencing paths within node_modules is not always recommended.
      //CSS hacks
      //https://www.tiny.cloud/blog/css-hacks/
      //https://github.com/tinymce/tinymce/issues/4886
      //TinyMCE comes with 17 font options by default.
      //https://www.tiny.cloud/blog/tinymce-custom-font-family/
      //https://www.tiny.cloud/docs/tinymce/latest/user-formatting-options/#font_formats
      //https://www.tiny.cloud/blog/tinymce-google-fonts/
      //https://fonts.google.com/specimen/EB+Garamond
      //https://www.tiny.cloud/docs/tinymce/6/migration-from-5x/
      font_family_formats: `Calibri=Calibri, sans-serif;
      Andale Mono=andale mono,times;
      Arial=arial,helvetica,sans-serif; 
      Arial Black=arial black,avant garde;
      Noto Serif Devanagari=Noto Serif Devanagari", serif;
      Book Antiqua=book antiqua,palatino; 
      Comic Sans MS=comic sans ms,sans-serif; 
      Courier New=courier new,courier,monospace;
      Lato Black=lato; 
      Roboto=Roboto, sans-serif;
      Bungee=Bungee;
      Open Sans='Open Sans', sans-serif;
      Lora=Lora, serif;
      Montserrat=Montserrat, sans-serif;
      Garamond=Garamond, serif;
      Poppins=Poppins;
      Georgia=georgia,palatino; 
      Helvetica=helvetica;
      Impact=impact,chicago; 
      Oswald=Oswald, sans-serif;
      Symbol=symbol;
      Tahoma=tahoma,arial,helvetica,sans-serif; 
      Terminal=terminal,monaco;
      Times New Roman=times new roman,times; 
      Trebuchet MS=trebuchet ms,geneva; 
      Verdana=verdana,geneva; 
      Webdings=webdings; 
      Josefin='Josefin Sans', sans-serif; 
      Wingdings=wingdings,zapf dingbats`,
     content_css: '../../assets/tinymce/skins/ui/oxide/content.min.css',
      //  content_style: contentUiCss.toString() + '\n' + contentCss.toString(),
      //https://www.tiny.cloud/blog/tinymce-css-and-custom-styles/
     content_style: `
      @import url('https://fonts.googleapis.com/css2?family=Lato:wght@900&family=Roboto&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Bungee&family=Open+Sans:ital,wght@0,400;0,700;1,400&display=swap');
     @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap');
     @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600&display=swap');
     @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@100..900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap');
     body { font-family: 'Calibri', sans-serif; }
    `,
    
     //Set the default font: https://www.tiny.cloud/blog/tinymce-custom-font-family/
       //content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
      //https://www.tiny.cloud/docs/tinymce/latest/tinymce-for-mobile/
      mobile: {
        theme: 'silver',
        width:'100%',
        height: 350,
        menubar: true,
        plugins: ['autosave', 'lists', 'autolink','table', 'link', 'advlist', 'code'],
        toolbar: 'undo bold italic styleselect fontfamily fontsize',
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
         tinymce.triggerSave();
        console.log('Trigger save working');
      });
      //https://www.tiny.cloud/docs/tinymce/latest/apis/tinymce.editormode/#set
      //https://stackoverflow.com/questions/13881812/make-readonly-disable-tinymce-textarea
      if (this.disabled) {
        editor.mode.set('readonly');
      }
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
    // const el = querySelectorDeep('#my-tinymce-component');
    // tinymce.remove(el);
    tinymce.remove(`#my-tinymce-component`);
    this.editor = null; // Clear the reference during component unload
  }
  render() {
    // Generate a unique ID for the editor container
    let editorId = `editor-${Math.floor(Math.random() * 1000)}`;
    return (
       <div id={editorId}>
        {/* <button onClick={() => this.handleEvent()}>Click me</button> */}
        <div id="my-tinymce-component" innerHTML={this.initialvalue}></div>
        <button onClick={() => this.getContentFromEditor()}>Get Content/Save </button>
       <button onClick={() => this.setContentInEditor(myString)}>Set Content</button>
        <button onClick={() => this.setContentInEditor('')}>Clear Content</button>
      </div>
    );
  }

}
