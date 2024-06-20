import { Component, h, Listen } from '@stencil/core';
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

//stackblitz
// https://stackblitz.com/github/ionic-team/stencil-component-starter?file=readme.md
//https://stackblitz.com/edit/github-mfsmeh-gx5b4v?file=src%2Fcomponents%2Frtf-editor%2Frtf-editor.tsx

@Component({
  tag: 'custom-rtf',
  styleUrl: 'custom-rtf.css',
  shadow: true,
})
export class CustomRtf {
  private editor: any; // Store a reference to the TinyMCE editor instance
 // @State() editor: any; // Assuming you have a state variable to hold the Tinymce editor instance

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
     width:800,
     height: 350,
     theme: 'silver',        // Choose a theme ('modern', 'silver', 'inlite','mobile' etc.)
     skin: 'oxide',
     //Copy Tinymce assets to a local folder, for example, 'src/assets/tinymce/'.
    skin_url: '../../assets/tinymce/skins/ui/oxide',
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
     content_css: '../../assets/tinymce/skins/ui/oxide/content.css',
      content_style: contentUiCss.toString() + '\n' + contentCss.toString(),
      //setup callback assigns the editor 
      setup: (editor) => {
        this.editor = editor; // Store the editor instance
        editor.on('keyup', () => {
          console.log('Editor was clicked');
      });
       // Add an event listener for the input event
       editor.on('input', () => {
        this.handleEditorInput();
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
      console.log('Editor content changed:', editorContent);
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
       {/* <button onClick={() => this.setContentInEditor('New content')}>Set Content</button>*/}
       <button onClick={() => this.setContentInEditor(`<div class=WordSection1>

<table class=TableGrid2 border=1 cellspacing=0 cellpadding=0 width=588
 style='width:440.75pt;margin-left:26.75pt;border-collapse:collapse;border:
 none'>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=453 nowrap colspan=2 valign=top style='width:339.9pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><b><span lang=EN-GB
  style='font-size:9.0pt'>Station Name &amp; Location</span></b><span
  lang=EN-GB style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><b><span lang=EN-GB
  style='font-size:9.0pt'>Retro Date</span></b></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>By Pass Service Center Inc. - Carr. #2 Industrial Sal
  Rafael # 1808 </span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Ponce</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Alena Villa Flores - Carr. 1 Sector Bucana Villa
  Flores, </span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Ponce</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:8.1pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>A &amp; E Service Station Inc./Gulf Coamo - </span><span
  style='font-size:9.0pt'>Carr. 14 Bo. San IdelFonso Km 31.7</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Coamo</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:8.1pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Texxan Oil - 312 Ave. Barbosa</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>San Juan</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=PT-BR
  style='font-size:9.0pt'>Cortes Super, Carr. #2 Km 109, Isabela</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=PT-BR
  style='font-size:9.0pt'>Isabela</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>First Petroleum Gulf, Ave. Emerito Estrada #1208</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>San Sebastian</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:8.25pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:8.25pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.25pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>First Petroleum Gulf Manati, Carr. #2 Km 50.2</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.25pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Manati</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.25pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Cotto Laurel Service Station (Phillips), Carr. 14 Km
  .8 H 2 Bo. Cotto Laurel</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Ponce</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Boqueron Service Station, Bo. Boqueron Carr. #31 Km
  14.9</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Las Piedras</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Servicentro Miranda - Ave. Muñoz Rivera #43</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Juncos</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>WS Service Station - 731 Ave. Tito Castro</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Ponce</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>WJE Inc. - Carr. 402 Km 1.2</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Añasco</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Asmar Energy - Carr. #862 Km 1.3</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Bayamon</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>San Lorenzo Service St/Bisan Gas Station - Carr. #183
  Km 7</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>San Lorenzo</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Aguadilla Service Station - Calle Progreso #129</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Aguadilla</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Moca Gulf Station - Carr. 111 Km 11.5 Bo. Capa</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Moca</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
</table>

<p class=MsoNormal><span lang=EN-GB>&nbsp;</span></p>

<table class=TableGrid2 border=1 cellspacing=0 cellpadding=0 width=588
 style='width:440.75pt;margin-left:26.75pt;border-collapse:collapse;border:
 none'>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=453 nowrap colspan=2 valign=top style='width:339.9pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><b><span lang=EN-GB
  style='font-size:9.0pt'>Station Name &amp; Location</span></b><span
  lang=EN-GB style='font-size:9.0pt'>&nbsp;</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><b><span lang=EN-GB
  style='font-size:9.0pt'>Retro Date</span></b></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>1</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>By Pass Service Center Inc. - Carr. #2 Industrial Sal
  Rafael # 1808 </span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Ponce</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>2</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Alena Villa Flores - Carr. 1 Sector Bucana Villa
  Flores, </span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Ponce</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:8.1pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>3</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>A &amp; E Service Station Inc./Gulf Coamo - </span><span
  style='font-size:9.0pt'>Carr. 14 Bo. San IdelFonso Km 31.7</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Coamo</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:8.1pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>4</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Texxan Oil - 312 Ave. Barbosa</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>San Juan</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.1pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>5</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=PT-BR
  style='font-size:9.0pt'>Cortes Super, Carr. #2 Km 109, Isabela</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=PT-BR
  style='font-size:9.0pt'>Isabela</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>6</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>First Petroleum Gulf, Ave. Emerito Estrada #1208</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>San Sebastian</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:8.25pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:8.25pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>7</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.25pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>First Petroleum Gulf Manati, Carr. #2 Km 50.2</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.25pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Manati</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:8.25pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>8</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Cotto Laurel Service Station (Phillips), Carr. 14 Km
  .8 H 2 Bo. Cotto Laurel</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Ponce</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>9</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Boqueron Service Station, Bo. Boqueron Carr. #31 Km
  14.9</span></p>
  </td>
  <td width=89 valign=top style='width:66.4pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Las Piedras</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>10</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Servicentro Miranda - Ave. Muñoz Rivera #43</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Juncos</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>11</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>WS Service Station - 731 Ave. Tito Castro</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Ponce</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>12</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>WJE Inc. - Carr. 402 Km 1.2</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Añasco</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>13</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Asmar Energy - Carr. #862 Km 1.3</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Bayamon</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.75pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>14</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>San Lorenzo Service St/Bisan Gas Station - Carr. #183
  Km 7</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>San Lorenzo</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.75pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>15</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=ES-PR
  style='font-size:9.0pt'>Aguadilla Service Station - Calle Progreso #129</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Aguadilla</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
 <tr style='height:6.95pt'>
  <td width=31 nowrap valign=top style='width:23.5pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>16</span></p>
  </td>
  <td width=365 nowrap valign=top style='width:273.5pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Moca Gulf Station - Carr. 111 Km 11.5 Bo. Capa</span></p>
  </td>
  <td width=89 nowrap valign=top style='width:66.4pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>Moca</span></p>
  </td>
  <td width=103 nowrap valign=top style='width:77.35pt;border-top:none;
  border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:6.95pt'>
  <p class=MsoNormal style='text-autospace:none'><span lang=EN-GB
  style='font-size:9.0pt'>03/04/2005</span></p>
  </td>
 </tr>
</table>

<p class=MsoNormal><span lang=EN-GB>&nbsp;</span></p>

<table class=MsoNormalTable border=1 cellspacing=0 cellpadding=0 width=630
 style='width:472.5pt;margin-left:5.4pt;border-collapse:collapse;border:none'>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><b><span lang=EN-GB>Covered Location </span></b></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><b><span lang=EN-GB>Tank
  #</span></b></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><b><span lang=EN-GB>Age</span></b></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><b><span lang=EN-GB>Capacity</span></b></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><b><span lang=EN-GB>Wall
  Type/Construction</span></b></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border:solid windowtext 1.0pt;
  border-left:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><b><span lang=EN-GB>Content</span></b></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>1 (86-1219)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>12,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>DW/FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>1 (86-1219)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>12,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>DW/FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>1 (86-1219)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>3UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>6,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>DW/FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>2 (86-0177)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Fiberglass</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>2 (86-0177)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>8,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Fiberglass</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>2 (86-0177)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>3UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>4,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Fiberglass</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>3 (93-0076)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Composite</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>3 (93-0076)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Composite</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>3 (93-0076)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>3AST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>3,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Diesel</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>4 (87-0018)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1998</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>4 (87-0018)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1998</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>12,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>4 (87-0018)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>3UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1998</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>12,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>5 (86-0857)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>5 (86-0857)</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1992</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>8,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>6</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1998</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>6</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1998</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>6</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>3UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2001</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>6</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>4UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2001</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Diesel</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>7</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1998</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>7</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>2UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1998</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>10,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Gasoline</span></p>
  </td>
 </tr>
 <tr style='height:1.0pt'>
  <td width=94 valign=top style='width:70.85pt;border:solid windowtext 1.0pt;
  border-top:none;padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal style='margin-top:3.0pt;margin-right:0in;margin-bottom:
  3.0pt;margin-left:0in'><span lang=EN-GB>7</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>3UST</span></p>
  </td>
  <td width=66 valign=top style='width:49.5pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>1998</span></p>
  </td>
  <td width=84 valign=top style='width:63.0pt;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>6,000</span></p>
  </td>
  <td width=144 valign=top style='width:1.5in;border-top:none;border-left:none;
  border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>FRP
  Clad Steel</span></p>
  </td>
  <td width=176 valign=top style='width:131.65pt;border-top:none;border-left:
  none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
  padding:0in 5.4pt 0in 5.4pt;height:1.0pt'>
  <p class=MsoNormal align=center style='margin-top:3.0pt;margin-right:0in;
  margin-bottom:3.0pt;margin-left:0in;text-align:center'><span lang=EN-GB>Diesel</span></p>
  </td>
 </tr>
</table>

<p class=MsoNormal><span lang=EN-GB>&nbsp;</span></p>

<p class=MsoNormal><span lang=EN-GB>&nbsp;</span></p>

<p class=MsoNormal align=center style='text-align:center'><b><span lang=EN-GB>OFFICIAL
MANDATORY ENDORSEMENT</span></b></p>

<p class=MsoNormal align=center style='text-align:center'><b><span lang=EN-GB>ISSUED
PURSUANT TO SECTION 38.160 OF THE INSURANCE CODE OF PUERTO RICO RECOVERY OF
ASSESSMENTS PAID TO THE PUERTO RICO PROPERTY AND CASUALTY INSURANCE GUARANTY
ASSOCIATION</span></b></p>

<p class=MsoNormal align=center style='text-align:center'><b><span lang=EN-GB>&nbsp;</span></b></p>

<p class=MsoNormal><span lang=EN-GB>It is hereby understood and agree that:</span></p>

<p class=MsoNormal style='margin-left:.25in;text-indent:-.25in'><span
lang=EN-GB>1.    The total amount charged for this policy and any endorsement
thereof includes, in addition to premium, an amount determined by the
Commissioner of Insurance of Puerto Rico for the purpose of recovering the
unreimbursed assessments paid by the Company to the Puerto Rico Property and
Casualty Insurance Guaranty Association.</span></p>

<p class=MsoNormal style='margin-left:.25in;text-indent:-.25in'><span
lang=EN-GB>2.     The payment of the total amount referred to in item 1 above,
or of the applicable amount under a payment plan pursuant to Rule XXIX of the
Regulations of the Insurance Code of Puerto Rico, is required for a personal
policy to become effective.</span></p>

<p class=MsoNormal style='margin-left:.25in;text-indent:-.25in'><span
lang=EN-GB>3.     The payment of the total amount referred to in item 1 above
is required for commercial policy to remain in force, as provided for under
Rule LV of the Regulations of the Insurance Code of Puerto Rico.</span></p>

<p class=MsoNormal style='margin-left:.25in;text-indent:-.25in'><span
lang=EN-GB>4.     The portion paid, but not yet earned, of the total amount
referred to in item 1 above will be returned in the event this policy is
canceled.</span></p>

<p class=MsoNormal><span lang=EN-GB>&nbsp;</span></p>

</div>`)}>Set Content</button>
      </div>
    );
  }

}
