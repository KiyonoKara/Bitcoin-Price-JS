const { getBTC } = require('./bitcoin/getBTC.js');
const { registerProvider, providerNames } = require('./providers/index.js');

module.exports = { getBTC, registerProvider, providerNames };
