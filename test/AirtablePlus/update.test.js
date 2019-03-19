/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');

const inst = new AirtablePlus(mock.write);

describe('update', () => {
    it('should update and return a valid result', async () => {
        const row = await inst.create({ firstName: 'foo' });
        
        const res = await inst.update(row.id, { firstName: 'foobar' });

        assert.isDefined(res);
        assert.isDefined(res.fields);
        assert.notEqual(res.fields.firstName, row.fields.firstName);
        assert.equal(res.fields.firstName, 'foobar');
    });

    it('should update and return a valid result with complex=true', async () => {
        const config = { complex: true };
        const row = await inst.create({ firstName: 'foo' }, config);
        
        const res = await inst.update(row.getId(), { firstName: 'foobar' }, config);
        
        assert.isDefined(res);
        assert.isDefined(res._table);
        assert.notEqual(res.get('firstName'), row.get('firstName'));
        assert.equal(res.get('firstName'), 'foobar');
    });

    it('should retain non-updated values', async () => {
        const row = await inst.create({ firstName: 'foo', lastName: 'retained' });
        
        const res = await inst.update(row.id, { firstName: 'foobar' });
        
        assert.isDefined(res);
        assert.isDefined(res.fields);
        assert.equal(res.fields.lastName, 'retained');
    });

    after(async () => {
        await inst.truncate();
    });
});