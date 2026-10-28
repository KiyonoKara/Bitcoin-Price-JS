const { getProvider, providerNames } = require('../providers/index.js');

const ASSET = 'BTC';

// Coinbase is primary
// and Binance is for fallback
const DEFAULT_PROVIDERS = ['coinbase', 'binance'];

/**
 * Remove duplicates and uppercase currency codes
 *
 * @param {string | string[]} currencies
 * @returns {string[]}
 */
function toCodeList(currencies) {
    const codes = new Set();

    for (const currency of Array.isArray(currencies) ? currencies : [currencies]) {
        if (currency === undefined || currency === null) continue;

        const code = String(currency).trim().toUpperCase();
        if (code) codes.add(code);
    }

    return [...codes];
}

/**
 * Get the current Bitcoin price in each requested currency
 * All providers are tried in order, but the first one to quote a gives the price
 *
 * @param {string | string[]} currencies currency codes, in any case
 * @param {{providers?: string[]}} [options]
 * @returns {Promise<{prices: Object<string, number>, errors: Object<string, string>}>}
 *   Resolves current prices
 * @throws {Error} on bad input or no providers work
 */
async function getBTC(currencies, options = {}) {
    const codes = toCodeList(currencies);
    const chain = options.providers ?? DEFAULT_PROVIDERS;

    if (chain.length === 0) {
        throw new Error('no providers were given');
    }
    for (const name of chain) {
        if (!getProvider(name)) {
            throw new Error(`unknown provider "${name}" (known: ${providerNames().join(', ')})`);
        }
    }

    const prices = {};
    // error code -> reason
    const reasons = new Map();
    // providers that failed
    const failures = [];
    // save reasons for the failures
    const memo = (code, reason) => {
        reasons.set(code, [...(reasons.get(code) ?? []), reason]);
    }

    for (const name of chain) {
        const outstanding = codes.filter(code => prices[code] === undefined);
        if (outstanding.length === 0) {
            break;
        }

        let quotes;
        try {
            quotes = await getProvider(name).fetch(ASSET, outstanding);
        } catch (error) {
            failures.push(`${name} (${error.message})`);
            for (const code of outstanding) {
                memo(code, `${name} failed: ${error.message}`);
            }
            continue;
        }

        for (const code of outstanding) {
            // quotes need to be finite
            if (!Number.isFinite(quotes[code])) {
                memo(code, `${name} has no usable ${ASSET}/${code} price`);
            } else {
                prices[code] = quotes[code];
                reasons.delete(code);
            }
        }
    }

    // reject with all failed providers
    if (Object.keys(prices).length === 0 && failures.length === chain.length) {
        throw new Error(`every provider failed: ${failures.join('; ')}`);
    }
    // return all errors
    const errors = {};
    for (const code of codes) {
        if (prices[code] === undefined) {
            errors[code] = reasons.get(code).join('; ');
        }
    }

    return { prices, errors };
}

module.exports = {
    getBTC
};
