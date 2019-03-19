/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');

const inst = new AirtablePlus(mock.read);

describe('find', () => {
    it('should find a valid row', async () => {
        const [{ id }] = await inst.read({ maxRecords: 1 });
        const res = await inst.find(id);

        assert.isDefined(res.id);
        assert.isDefined(res.fields);
        assert.isDefined(res.createdTime);
    });

    it('should find a valid row if complex=true', async () => {
        const config = { complex: true };
        const [row] = await inst.read({ maxRecords: 1 }, config);
        const res = await inst.find(row.getId(), config);
        assert.isDefined(res._table);
    });    

    it('should theres an error if not passed a valid rowID', async () => {
        await inst.find(null).catch(assert.isDefined);
    });
});