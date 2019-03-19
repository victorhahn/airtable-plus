/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');
const inst = new AirtablePlus(mock.write);

describe('create', () => {
    it('should create a valid row', async () => {
        const res = await inst.create({ firstName: 'foobar' });
        assert.isDefined(res.id);
        assert.isDefined(res.fields);
        assert.isDefined(res.fields.firstName);
        assert.equal(res.fields.firstName, 'foobar');
        assert.isDefined(res.createdTime);
    });

    it('should create a valid row with complex=true', async () => {
        const res = await inst.create({ firstName: 'foobar' }, { complex: true });
        assert.isDefined(res._table);
    });

    it('should create a valid row with complex=false', async () => {
        const res = await inst.create({ firstName: 'foobar' }, { complex: false });
        assert.isDefined(res.id);
        assert.isDefined(res.fields);
        assert.isDefined(res.createdTime);
    });

    it('should throw an Empty Data Object error if not passed a valid object', async () => {
        await inst.create(null).catch(assert.isDefined);
    });

    it('should throw API error', async () => {
        await inst.create({ firstName: 'foobar' }, { apiKey: 123 }).catch(assert.isDefined);
    });    

    after(async () => {
        await inst.truncate();
    });
});