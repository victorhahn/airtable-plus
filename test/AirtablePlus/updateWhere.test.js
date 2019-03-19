/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');

const inst = new AirtablePlus(mock.write);

describe('updateWhere', () => {
    it('should update based on where clause and return result', async () => {
        //creates a few dummy rows, one matching the criteria, one failing
        const row1 = await inst.create({ firstName: 'foo' });
        const row2 = await inst.create({ firstName: 'bar' });

        const res = await inst.updateWhere('firstName = "foo"', { firstName: 'foobar' });

        assert.isTrue(res.some(el => el.id === row1.id));
        assert.isFalse(res.some(el => el.id === row2.id));
        assert.equal(res[0].fields.firstName, 'foobar');
    });

    it('should update using where clause and return a valid result with complex=true', async () => {
        //creates a few dummy rows, one matching the criteria, one failing
        const config = { complex: true };
        const row1 = await inst.create({ firstName: 'foo' }, config);
        const row2 = await inst.create({ firstName: 'bar' }, config);

        const res = await inst.updateWhere('firstName = "foo"', { firstName: 'foobar' }, config);
        
        assert.isTrue(res.some(el => el.getId() === row1.getId()));
        assert.isFalse(res.some(el => el.getId() === row2.getId()));
        assert.equal(res[0].get('firstName'), 'foobar');
    });

    it('should retain non-updated values', async () => {
        await inst.create({ firstName: 'foo', lastName: 'retained' });
        await inst.create({ firstName: 'bar' });
        
        const [res] = await inst.updateWhere('firstName = "foo"', { firstName: 'foobar' });

        assert.isDefined(res);
        assert.isDefined(res.fields);
        assert.equal(res.fields.lastName, 'retained');
    });

    afterEach(async () => {
        await inst.truncate();
    });
});