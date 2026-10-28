/** @typedef {{name: string, fetch(asset: string, currencies: string[]): Promise<Object<string, number>>}} Provider */

const providers = new Map();

/**
 * Adapter for functions in the style of: getBTC(currencies, { providers: [...] })
 *
 * @param {Provider} provider
 * @returns {Provider}
 */
function registerProvider(provider) {
    if (!provider || typeof provider.name !== 'string' || typeof provider.fetch !== 'function') {
        throw new TypeError('a provider needs a name and a fetch(asset, currencies) function');
    }

    providers.set(provider.name, provider);
    return provider;
}

/** @param {string} name @returns {Provider | undefined} */
function getProvider(name) {
    return providers.get(name);
}

/** @returns {string[]} */
function providerNames() {
    return [...providers.keys()];
}

registerProvider(require('./coinbase.js'));
registerProvider(require('./binance.js'));

module.exports = { registerProvider, getProvider, providerNames };
