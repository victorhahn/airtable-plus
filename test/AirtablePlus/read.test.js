/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');
const inst = new AirtablePlus(mock.read);

describe('read', () => {
    it('should return valid data with no params', async () => {
        const [res] = await inst.read();

        assert.isDefined(res.id);
        assert.isDefined(res.fields);
        assert.isDefined(res.createdTime);
    });

    it('should filter correctly', async () => {
        const [res] = await inst.read({
            maxRecords: 1,
            filterByFormula: 'Gender = "Female"'
        });

        assert.isDefined(res.id);
        assert.isDefined(res.fields);
        assert.isDefined(res.createdTime);
    });

    it('should set keys to camelcase with config property set', async () => {
        const [res] = await inst.read({ maxRecords: 1 }, { camelCase: true });

        assert.isDefined(res.id);
        assert.isDefined(res.fields);
        assert.isDefined(res.fields.firstName);
        assert.isDefined(res.fields.lastName);
        assert.isDefined(res.createdTime);
    });

    it('should use transform function', async () => {
        const [res] = await inst.read({ maxRecords: 1 }, {
            transform: record => {
                record.foo = "bar";
                return record;
            }
        });
        
        assert.equal(res.foo, "bar");
    });

    it('shouldnt use transform function if nothing was returned', async () => {
        const [res] = await inst.read({ maxRecords: 1 }, {
            transform: record => {
                record.foo = "bar";
            }
        });
        
        assert.isUndefined(res.foo);
    });

    it('should reject if valid config is passed', async () => {
        const newInst = new AirtablePlus({ baseID: '12345' });
        const res = await newInst.read(mock.read.tableName).catch(assert.isDefined);
        assert.isUndefined(res);
    });


});