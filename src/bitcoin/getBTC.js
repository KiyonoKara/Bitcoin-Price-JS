const request = require('../util/request');

/** Gets the Bitcoin price in their respective currencies
 *
 * @param cryptocurrency
 * @param currency - Accepts arrays of currencies
 * @returns {Promise<object | string>}
 */
async function getBTC(cryptocurrency, currency) {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${cryptocurrency}&tsyms=${currency.toString()}`;
    const data = await request.get(url, { method: "GET" });
    return new Promise((resolve, reject) => {
        if (data.error) reject(data);
        resolve(data);
    });
}

module.exports = {
    getBTC
}
