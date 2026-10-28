const { getJSON } = require('../util/request.js');

const RATES_URL = 'https://api.coinbase.com/v2/exchange-rates?currency=';

/**
 * Coinbase provides multiple currencies per asset
 *
 * @param {string} asset @param {string[]} currencies @returns {Promise<Object<string, number>>}
 * @param currencies
 */
async function fetch(asset, currencies) {
    const { data } = await getJSON(RATES_URL + encodeURIComponent(asset));
    const rates = data?.['rates'] ?? {};

    const prices = {};
    for (const code of currencies) {
        if (rates[code] !== undefined) {
            prices[code] = Number(rates[code]);
        }
    }
    return prices;
}

/** @type {import('./index.js').Provider} */
module.exports = {
    name: 'coinbase',
    fetch
};
