/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');

const inst = new AirtablePlus(mock.write);
describe('truncate', () => {
    it('Should remove all data', async () => {
        await inst.create({ firstName: 'Foobar' });
        await inst.create({ firstName: 'Foo' });

        const before = await inst.read();
        await inst.truncate();
        const after = await inst.read();

        assert.equal(before.length, 2);
        assert.equal(after.length, 0);
    });

    it('Should remove all data with complex=true', async () => {
        await inst.create({ firstName: 'Foobar' });
        await inst.create({ firstName: 'Foo' });
        
        const cfg = { complex: true };

        const before = await inst.read();
        await inst.truncate(cfg);
        const after = await inst.read();

        assert.equal(before.length, 2);
        assert.equal(after.length, 0);
    });
});