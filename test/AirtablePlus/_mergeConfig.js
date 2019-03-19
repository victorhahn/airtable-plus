/*global assert */
const AirtablePlus = require('../../lib/AirtablePlus.js');

describe('_mergeConfig', () => {
    it('should set default config no params', () => {
        const inst = new AirtablePlus();
        const res = inst._mergeConfig();
        assert.isObject(res, "Config object set");
        assert.deepEqual(res, inst.config);
    });

    it('should honor camelCase override', () => {
        const inst = new AirtablePlus();
        const { camelCase } = inst._mergeConfig({ camelCase: true });
        assert.isTrue(camelCase);
    });

    it('should set apiKey override properly', () => {
        const inst = new AirtablePlus();
        const { apiKey } = inst._mergeConfig({ apiKey: 'foo' });
        assert.equal(apiKey, "foo");
    });

    it('should set tableName override properly', () => {
        const inst = new AirtablePlus();
        const { tableName } = inst._mergeConfig({ tableName: 'foo' });
        assert.equal(tableName, "foo");
    });

    it('should set baseID override properly', () => {
        const inst = new AirtablePlus();
        const { baseID } = inst._mergeConfig({ baseID: 'foo' });
        assert.equal(baseID, "foo");
    });

    it('should set a valid transformer function', () => {
        const inst = new AirtablePlus();
        const { transform } = inst._mergeConfig({ transform: ({ id }) => id });
        assert.isFunction(transform);
    });

    it('should set tableName if passed string', () => {
        const inst = new AirtablePlus();
        const { tableName } = inst._mergeConfig({ tableName: "foo" });
        assert.equal(tableName, 'foo');
    });

    it('transformer should be null if passed a non-function', () => {
        const inst = new AirtablePlus();
        const { transform } = inst._mergeConfig({ transform: "foo" });
        assert.isNotFunction(transform);
    });

    it('should set tablename if string is passed', () => {
        const inst = new AirtablePlus();
        const { tableName } = inst._mergeConfig("foo");
        assert.equal(tableName, "foo");
    });
});
