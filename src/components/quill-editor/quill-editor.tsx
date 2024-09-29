import { Component, Prop,Host, h,Element } from '@stencil/core';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles
//https://www.npmjs.com/package/quill

@Component({
  tag: 'quill-editor',
  styleUrl: 'quill-editor.css',
  shadow: true,
})
export class QuillEditor {
  @Prop() initialValue: any = '';
  @Prop() readOnly: boolean = false;
  @Element() el: HTMLElement;

  private quill: Quill;
  componentDidLoad() {
    const container : any = 
this.el.shadowRoot.querySelector('#quill-editor-child');    
// document.querySelector('quill-editor')
//     .shadowRoot.querySelector('div + #quill-editor-child');
    this.quill = new Quill(container, {
      theme: 'snow',
      readOnly: this.readOnly,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['link', 'image'],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ],
      },
    });
     // Set initial content
     this.quill.setContents(this.quill.clipboard.convert(this.initialValue));
    
     // Listen for changes and emit events if needed
     this.quill.on('text-change', () => {
       const content = this.quill.root.innerHTML;
       console.log('Content changed:', content);
       // You can emit an event here if needed
     });
   }
  render() {
    return (
      <div id="quill-editor-child" style={{ height: '300px' }}></div>
    );
  }

}
