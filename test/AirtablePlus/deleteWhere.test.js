/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');
const inst = new AirtablePlus(mock.write);

describe('deleteWhere', () => {
    it('should delete based on where clause and return result', async () => {
        const row1 = await inst.create({ firstName: 'foo' });
        const row2 = await inst.create({ firstName: 'bar' });

        const del = await inst.deleteWhere('firstName = "foo"');
        assert.isDefined(del);

        const res = await inst.read();
        
        assert.isFalse(res.some(el => el.id === row1.id));
        assert.isTrue(res.some(el => el.id === row2.id));
    });

    it('should disregard complex=true', async () => {
        const cfg = { complex: true };
        const row1 = await inst.create({ firstName: 'foo' }, cfg);
        const row2 = await inst.create({ firstName: 'bar' }, cfg);

        const del = await inst.deleteWhere('firstName = "foo"', cfg);
        assert.isDefined(del);

        const res = await inst.read({}, cfg);
        
        assert.isFalse(res.some(el => el.getId() === row1.getId()));
        assert.isTrue(res.some(el => el.getId() === row2.getId()));
    });

    afterEach(async () => {
        await inst.truncate();
    });
});