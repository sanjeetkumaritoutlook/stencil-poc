import { Component, Prop,Host, h } from '@stencil/core';
import '@tinymce/tinymce-webcomponent';
//https://www.npmjs.com/package/@tinymce/tinymce-webcomponent
//<tinymce-editor></tinymce-editor> tag  is used in place of calling tinymce.init(). 
//https://www.npmjs.com/package/@tinymce/tinymce-angular
//license_key:
//https://www.tiny.cloud/docs/tinymce/latest/license-key/
//https://www.tiny.cloud/docs/tinymce/latest/webcomponent-cloud/

//npm i tinymce
//https://www.npmjs.com/package/tinymce

//tinymce uses a freemium business model that includes a free Core editor and paid plans with advanced features
//https://www.tiny.cloud/docs/tinymce/latest/understanding-editor-loads/
//https://en.wikipedia.org/wiki/TinyMCE
//freemium model is a common strategy for Software as a Service (SaaS) companies to attract new users and convert them to paying customers
//https://www.tiny.cloud/blog/saas-freemium-business-model/
@Component({
  tag: 'rich-text-editor',
  styleUrl: 'rich-text-editor.css',
  shadow: true,
})
export class RichTextEditor {
  @Prop() apiKey: string;
  @Prop() initialValue: string;
  @Prop() disabled: boolean = false;

  private handleEditorChange(value: string, editor: any) {
    console.log('Editor content:', value);
  }
  
  //error: All created TinyMCE editors are configured to be read-only.
  //https://stackoverflow.com/questions/77955381/tinymce-editing-error-works-locally-but-fails-on-server
  //https://www.tiny.cloud/docs/tinymce/latest/invalid-api-key/#how-can-i-resolve-the-issue-of-an-unregistered-domain
  //still including tinymce.min.js in index.html throws console error: TinyMCE is running in evaluation mode. Provide a valid license key or add license_key: 'gpl' to the init config to agree to the open source license terms. Read more at https://www.tiny.cloud/license-key/
  render() {
    return (
      <tinymce-editor
      api-key={this.apiKey}
      initial-value={this.initialValue}
      disabled={this.disabled}
      onEditorChange={(event) => this.handleEditorChange(event.detail.value, event.detail.editor)}
      toolbar= "undo redo | formatselect fontsizeselect fontselect| accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl"
      plugins="accordion autoresize autosave codesample importcss quickbars advlist autolink link image lists charmap preview anchor pagebreak
      searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking
      save table directionality emoticons help"
      width='100%'
      height= "350"
      branding= "false"
      promotion= "false"
      highlight_on_focus= 'false'
      menubar= 'file edit view insert format tools table tc help'
      fontsize_formats= '2pt 4pt 6pt 8pt 9pt 10pt 11pt 12pt 14pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 34pt 36pt 48pt 60pt 72pt 96pt'
      font_formats= 'Oswald=Oswald, sans-serif; Lato=Lato, sans-serif; Arial=Arial, sans-serif;'
      importcss_append= "true"
      toolbar_mode= 'sliding'
      image_title= 'true'
      help_accessibility= 'false'
      image_advtab= 'true'
      min_height= '350'
      max_height= '400'
      content_style="@import url('https://fonts.googleapis.com/css2?family=Oswald&display=swap'); body { font-family: 'Oswald', sans-serif; }"
    >web component version of tinymce core editor</tinymce-editor>
    );
  }

}
