import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'my-new-component',
  styleUrl: 'my-new-component.css',
  shadow: true,
})
export class MyNewComponent {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
