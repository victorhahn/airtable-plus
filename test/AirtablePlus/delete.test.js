/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');
const inst = new AirtablePlus(mock.write);

describe('delete', () => {
    it('should delete and return a valid result', async () => {
        const row = await inst.create({ firstName: 'foo' });
        
        const res = await inst.delete(row.id);
        
        assert.isDefined(res);
        assert.isDefined(res.id);
    });

    it('should return full object with complex=true', async () => {
        const config = { complex: true };
        const row = await inst.create({ firstName: 'foo' }, config);
        
        const res = await inst.delete(row.getId(), config);
        
        assert.isDefined(res);
        assert.isDefined(res._table);
    });

    it('should throw an error when passed an invalid id', async () => {
        await inst.delete(null).catch(assert.isDefined);
    });
});