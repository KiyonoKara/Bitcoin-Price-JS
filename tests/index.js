const { getBTC } = require('../src');
getBTC("btc", ["usd", "jpy", "cad", "eur"]).then(data => {
    console.log(JSON.parse(data));
});
