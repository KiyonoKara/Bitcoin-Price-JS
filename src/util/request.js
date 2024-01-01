const https = require('https');

/** Local GET requester
 *
 * @param url
 * @returns {Promise<string>}
 */
const get = async function(url) {
    let body = "";
    return new Promise((resolve, reject) => {
        https.get(url, callback => {
            callback.on('data', d => body += String(d));
            callback.on('end', () => resolve(body));
            callback.on('error', e => reject({ error: e }));
        });
    });
}

module.exports = { get };
