/*global assert */
const AirtablePlus = require('../../lib/AirtablePlus.js');

describe('constructor', () => {
    it('should set default config no params', () => {
        const inst = new AirtablePlus();
        assert.isObject(inst.config, "Config object set");
    });

    it('should honor camelCase override', () => {
        const inst = new AirtablePlus({ camelCase: true });
        assert.isTrue(inst.config.camelCase);
    });

    it('should set apiKey properly', () => {
        const inst = new AirtablePlus({ apiKey: "foo" });
        assert.equal(inst.config.apiKey, "foo");
    });

    it('should set tableName properly', () => {
        const inst = new AirtablePlus({ tableName: "foo" });
        assert.equal(inst.config.tableName, "foo");
    });

    it('should set baseID properly', () => {
        const inst = new AirtablePlus({ baseID: "foo" });
        assert.equal(inst.config.baseID, "foo");
    });

    it('should set a valid transformer function', () => {
        const inst = new AirtablePlus({ transform: ({ id }) => id });
        assert.isFunction(inst.config.transform);
    });

    it('transformer should be null if passed a non-function', () => {
        const inst = new AirtablePlus({ transform: "foo" });
        assert.isNotFunction(inst.config.transform);
    });
});

