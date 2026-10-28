const assert = require('node:assert/strict');
const { getBTC } = require('../src');

// price must be a finite positive number
function assertPriced(prices, codes) {
    for (const code of codes) {
        assert.equal(typeof prices[code], 'number', `${code} needs to be a number`);
        assert.ok(Number.isFinite(prices[code]), `${code} needs to be finite`);
        assert.ok(prices[code] > 0, `${code} needs to be positive`);
    }
}

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test("coinbase: several currencies in a call", async () => {
    const { prices, errors } = await getBTC(['usd', 'jpy', 'cad', 'eur']);
    assertPriced(prices, ['USD', 'JPY', 'CAD', 'EUR']);
    assert.deepEqual(errors, {});
});

test("binance: prices every pair listed", async () => {
    const { prices, errors } = await getBTC(['usd', 'usdt', 'eur', 'jpy'], {
        providers: ['binance'],
    });
    assertPriced(prices, ['USD', 'USDT', 'EUR', 'JPY']);
    assert.deepEqual(errors, {});
});

test("binance: unlisted pair is reported but doesn't throw", async () => {
    const {
        prices,
        errors
    } = await getBTC(['cad', 'usd'], { providers: ['binance'] });

    assertPriced(prices, ['USD']);
    assert.equal(prices.CAD, undefined);
    assert.match(errors.CAD, /BTC\/CAD/);
});

test("binance: the public API is reachable", async () => {
    // api.binance.com is geo-restricted in some regions, so the adapter uses
    // data-api.binance.vision instead, a regression here means no prices
    const { prices } = await getBTC(['usdt'], { providers: ['binance'] });
    assertPriced(prices, ['USDT']);
});

test("providers quote USD", async () => {
    const [coinbase, binance] = await Promise.all([
        getBTC(['usd'], { providers: ['coinbase'] }),
        getBTC(['usd'], { providers: ['binance'] }),
    ]);

    const margin = Math.abs(coinbase.prices.USD - binance.prices.USD) / coinbase.prices.USD;
    assert.ok(margin < 0.05, `USD drifted ${(margin * 100).toFixed(1)}% between providers`);
});

test("an unknown provider is rejected before any request", async () => {
    await assert.rejects(getBTC(['usd'], { providers: ['mtgox'] }), /unknown provider/);
});

// rundown of test suite
(async () => {
    let failed = 0;
    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`OK ${name}`);
        } catch (error) {
            failed += 1;
            console.error(`FAILED ${name}\n ${error.message}`);
        }
    }

    console.log(`\n${tests.length - failed}/${tests.length} passed`);
    process.exitCode = failed > 0 ? 1 : 0;
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
