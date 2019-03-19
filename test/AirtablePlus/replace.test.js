/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');
const inst = new AirtablePlus(mock.write);

describe('replace', () => {
    it('should replace and return a valid result', async () => {
        const row = await inst.create({ firstName: 'foo' });
        
        const res = await inst.replace(row.id, { firstName: 'foobar' });
        
        assert.isDefined(res);
        assert.isDefined(res.fields);
        assert.notEqual(res.fields.firstName, row.fields.firstName);
        assert.equal(res.fields.firstName, 'foobar');
    });

    it('should replace and return a valid result with complex=true', async () => {
        const config = { complex: true };
        const row = await inst.create({ firstName: 'foo' }, config);
        
        const res = await inst.replace(row.getId(), { firstName: 'foobar' }, config);
        
        assert.isDefined(res);
        assert.isDefined(res._table);
        assert.notEqual(res.get('firstName'), row.get('firstName'));
        assert.equal(res.get('firstName'), 'foobar');
    });

    it('should remove non-replaced values', async () => {
        const row = await inst.create({ firstName: 'foo', lastName: 'retained' });
        
        const res = await inst.replace(row.id, { firstName: 'foobar' });
        
        assert.isDefined(res);
        assert.isDefined(res.fields);
        assert.isUndefined(res.fields.lastName);
    });

    after(async () => {
        await inst.truncate();
    });
});