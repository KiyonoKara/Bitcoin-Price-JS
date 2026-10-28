/** GET request with JSON response with fetch
 *
 * @param {string} url
 * @returns {Promise<any>}
 */
const getJSON = async function (url) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        const error = new Error(`${response.status} ${response.statusText} from ${url}`);
        error.status = response.status;
        error.body = await response.text().catch(() => undefined);
        throw error;
    }

    return response.json();
};

module.exports = {
    getJSON
};
