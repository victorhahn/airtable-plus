global.chai = require('chai');
global.assert = global.chai.assert;

process.on('unhandledRejection', (reason) => {
    throw reason;
});