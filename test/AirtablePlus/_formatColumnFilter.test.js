/*global assert */
const AirtablePlus = require('../../lib/AirtablePlus.js');
const inst = new AirtablePlus();

describe('_formatColumnFilter', () => {
    it('Should wrap a multi word phrase in brackets', () => {
        const res = inst._formatColumnFilter('Foo Bar');
        assert.equal(res, '{Foo Bar}');
    });
    it('Should not wrap a single word phrase in brackets', () => {
        const res = inst._formatColumnFilter('Foo');
        assert.equal(res, 'Foo');
    });
    it('Should return empty string if passed invalid/empty parameter', () => {
        const res = inst._formatColumnFilter();
        assert.lengthOf(res, 0);
    });
});