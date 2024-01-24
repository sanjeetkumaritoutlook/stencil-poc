export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

import { CryptoInterface } from '../components/payform-component/payform-component/crypto.interface';

export function getCryptoData(apiKey: string): Promise<CryptoInterface> {
  return fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,XRP&tsyms=USD,EUR&api_key=${apiKey}`)
    .then(response => response.json());
}