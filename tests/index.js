const { getBTC } = require('../src');
getBTC("btc", ["usd", "jpy", "kwd", "cad"]).then(data => {
    console.log(JSON.parse(data));
});
