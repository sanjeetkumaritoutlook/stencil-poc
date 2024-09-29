import { Component, Host,State, h } from '@stencil/core';

@Component({
  tag: 'rtf-editor',
  styleUrl: 'rtf-editor.css',
  shadow: true,
})
export class RtfEditor {
  @State() value: any;

  handleChange(event) {
  this.value = event.target.value;
  console.log(event);
  
  }
  
  setupEditor(editor) {
  editor.on('click', function () {
  console.log('Editor was clicked');
  });
  }
  
  render() {
    return (
      <Host>
      {/*commenting it to render tinymce-webcomponent version:<tinymce-editor api-key="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc"
      id="rteInput"
      value={this.value}
      on-GetContent={(event)=>this.handleChange(event)}
      setup="setupEditor"></tinymce-editor> */}
      </Host>
    );
  }

}
