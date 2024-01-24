import { Component,  h,Prop,State,Method,Listen } from '@stencil/core';
import { getCryptoData } from '../../../utils/utils';
import { CryptoInterface } from './crypto.interface';
@Component({
  tag: 'payform-component',
  styleUrl: 'payform-component.css',
  shadow: true,
})
export class PayformComponent {
    /**
   * Valid API key obtained from cryptocompare.com
   */
  @Prop() apiKey: string;
  @Prop() amountPayable : number; // initialized our Prop method kebab-case (one dash) camelCase
//   @Prop() cryptoCurrencies: string[];
cryptoCurrencies = ['BTC', 'ETH', 'XRP'];

  
  @State() cryptoData: CryptoInterface;

  componentDidLoad() {
    console.log(this.apiKey);
    getCryptoData(this.apiKey).then((data) => {
        this.cryptoData = data;
      });
  }

  fetchData() {
    getCryptoData(this.apiKey).then((data) => {
      this.cryptoData = data;
    });
  }

  @Method()
  async refreshCryptoData() {
    this.fetchData();
  }

  @Listen('refreshCryptoData')
  listen(event) {
    console.log(event)
  }

  render() {
    return (
      <div>
      <h1>STENCIL JS PayForm</h1>
    
      <p slot='my-title'>Title</p>
  <p slot='my-description'>Description</p>
  <table class={'crypto'}>
          <tr>
            <td></td>
            <td>USD</td>
            <td>EUR</td>
          </tr>
          {this.cryptoCurrencies.map((item) => {
            return this.cryptoData && item in this.cryptoData ? <tr>
              <td>{item}</td>
              <td>{this.cryptoData[item].USD}</td>
              <td>{this.cryptoData[item].EUR}</td>
            </tr> : null
          })}
        </table>

        <b>Crypto data on date: {new Date().toLocaleDateString()}</b>
        <crypto-table cryptoData={this.cryptoData} cryptoCurrencies={this.cryptoCurrencies} />
        <slot></slot>

      <div>
<div class="container">
<form action="">
    <div class="row">
        <div class="col">
            <h3 class="title">StencilJs PayForm</h3>
            <h3 class="title">Amount {this.amountPayable}</h3>
            <div class="inputBox">
                <span>Name on Card :</span>
                <input type="text" placeholder="John Doe" />
            </div>
            <div class="inputBox">
                <span>Card Number :</span>
                <input type="number" placeholder="1111-2222-3333-4444" />
            </div>
            <div class="inputBox">
                <span>Exp. Month :</span>
                <input type="text" placeholder="April" />
            </div>
            <div class="flex">
                <div class="inputBox">
                    <span>Exp. Year :</span>
                    <input type="number" placeholder="2026" />
                </div>
                <div class="inputBox">
                    <span>CVV :</span>
                    <input type="text" placeholder="1234" />
                </div>
            </div>
        </div>
    </div>  
    <input type="submit" value="proceed to checkout" class="submit-btn" />
</form>
</div>
   </div>
      </div>

      
    );
  }

}
