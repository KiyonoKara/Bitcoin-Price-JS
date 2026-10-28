const { getJSON } = require('../util/request.js');

const TICKER_URL = 'https://data-api.binance.vision/api/v3/ticker/price';

/**
 * Binance provides one symbol per pair with asset and currency like BTC + USDT being BTCUSDT
 * and only lists the pairs it has. Unlisted pairs give a 400 rather instead of an empty result,
 * so this is a workaround
 *
 * @param {string[]} symbols
 * @returns {Promise<Array<{symbol: string, price: string}>>}
 */
async function fetchTickers(symbols) {
    if (symbols.length === 0) {
        return [];
    }
    const url = `${TICKER_URL}?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
    try {
        return await getJSON(url);
    } catch (error) {
        if (error.status !== 400) {
            throw error;
        }
        // one requested pair isn't listed if there's 400
        return getJSON(TICKER_URL);
    }
}

/** @param {string} asset @param {string[]} currencies @returns {Promise<Object<string, number>>}
 * @param currencies
 */
async function fetch(asset, currencies) {
    const tickers = await fetchTickers(currencies.map(code => asset + code));

    const prices = {};
    for (const ticker of tickers) {
        // fallback path scans every listed pair
        if (!ticker.symbol.startsWith(asset)) {
            continue;
        }

        const code = ticker.symbol.slice(asset.length);
        if (currencies.includes(code)) {
            prices[code] = Number(ticker.price);
        }
    }
    return prices;
}

/** @type {import('./index.js').Provider} */
module.exports = {
    name: 'binance',
    fetch
};
