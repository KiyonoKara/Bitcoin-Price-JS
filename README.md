# Bitcoin Price JS
Gets the Bitcoin price and returns JSON data with the price based on a list of currencies.

## Overview
A small project for getting the current Bitcoin price in one or more currencies, using
the [Coinbase](https://docs.cdp.coinbase.com/coinbase-app/track-apis/prices) and
[Binance](https://developers.binance.com/docs/binance-spot-api-docs) public APIs.
Doesn't require any API key or dependencies.

## Usage
```js
const { getBTC } = require('bitcoin-price-js');

const { prices, errors } = await getBTC(['usd', 'jpy', 'cad', 'eur']);
// prices: { USD: ..., JPY: ..., CAD: ..., EUR: ... }
```

Currency codes are case-insensitive and may be passed as a single string.
A currency that no provider quotes is reported in `errors` instead of failing the function call.

```js
const { prices, errors } = await getBTC(['usd', 'xyz']);
// prices: { USD: 80000.00 }
// errors: { XYZ: 'coinbase has no usable BTC/XYZ price; binance has no usable BTC/XYZ price' }
```

The call rejects only when the request fails, every provider fails, or an unknown provider name is passed.

## Providers
Sources are tried in this order, and the first one to quote a currency is used.

1. Coinbase (covers most currencies)
2. Binance

The default chain is `['coinbase', 'binance']` but you can use a single source too.

```js
await getBTC(['usd'], { providers: ['binance'] });
```

Coverage is different between both since Binance lists BTC/JPY and BTC/EUR but has no BTC/CAD,
while several of its fiat symbols quote far from the actual market price. 
Try to use one provider and have fallbacks but don't rely on it for complete data.

### Adding your own provider
```js
const { registerProvider } = require('bitcoin-price-js');

registerProvider({
    name: 'example',
    /** @returns {Promise<Object<string, number>>} only the currencies you support */
    async fetch(asset, currencies) {
        return { USD: 80000.00 };
    },
});

await getBTC(['usd'], { providers: ['example'] });
```

## Legal
`Bitcoin-Price-JS` is not Bitcoin in any form nor is it a cryptocurrency.  
`Bitcoin-Price-JS` is not affiliated or endorsed by Coinbase, Binance, nor their assets.
