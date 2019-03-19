/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');
const destInst = new AirtablePlus(mock.write);
const sourceInst = new AirtablePlus(mock.read);

describe('overwriteTable', () => {
    it('Should insert rows with all configurations set', async () => {
        const source = {
            tableName: mock.read.tableName,
            fields: ['firstName', 'lastName'],
            where: 'gender = "Female"',
            concurrency: 20
        };

        const sourceData = await sourceInst.read({ filterByFormula: source.where });

        const destData = await destInst.overwriteTable(source, mock.write);
        assert.notEqual(destData.length, 0);
        assert.equal(destData.length, sourceData.length);
    });

    it('Should use string param for dest as table name', async () => {
        const source = {
            tableName: mock.read.tableName,
            fields: ['firstName', 'lastName'],
            where: 'gender = "Female"',
            concurrency: 20
        };

        const sourceData = await sourceInst.read({ filterByFormula: source.where });

        const destData = await destInst.overwriteTable(source, mock.write.tableName);
        assert.notEqual(destData.length, 0);
        assert.equal(destData.length, sourceData.length);
    });

    afterEach(async () => {
        await destInst.truncate();
    });
});