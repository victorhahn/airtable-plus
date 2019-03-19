/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');

const destInst = new AirtablePlus(mock.write);
const sourceInst = new AirtablePlus(mock.read);
describe('appendTable', () => {
    it('Should append rows with all configurations set', async () => {
        const source = {
            tableName: mock.read.tableName,
            fields: ['firstName', 'lastName'],
            where: 'gender = "Female"',
            concurrency: 20
        };

        const sourceData = await sourceInst.read({ filterByFormula: source.where });

        const destData = await destInst.appendTable(source, mock.write);
        assert.notEqual(destData.length, 0);
        assert.equal(destData.length, sourceData.length);
    });

    it('Should append rows with default where', async () => {
        const source = {
            tableName: mock.read.tableName,
            fields: ['firstName', 'lastName']
        };

        const sourceData = await sourceInst.read();

        const destData = await destInst.appendTable(source, mock.write.tableName);
        assert.notEqual(destData.length, 0);
        assert.equal(destData.length, sourceData.length);
    });

    it('Should append rows with default fields', async () => {
        const source = { tableName: mock.read.tableName };

        const sourceData = await sourceInst.read();
        const sourceKeys = Object.keys(sourceData[0].fields);
        
        const destData = await destInst.appendTable(source, mock.write.tableName);
        const destKeys = Object.keys(destData[0].fields);
        
        assert.notEqual(destData.length, 0);
        assert.isTrue(sourceKeys.every(e => destKeys.includes(e)));
    });

    it('Should error if no tableName is specified', async () => {
        const source = {
            fields: ['firstName', 'lastName'],
            where: 'firstName = "Jane"'
        };

        await destInst.appendTable(source, mock.write.tableName).catch(assert.isDefined);
    });

    it('Should set source tableName if string is passed instead of source obj', async () => {
        const sourceData = await sourceInst.read();
        const destData = await destInst.appendTable(mock.read.tableName, mock.write.tableName);

        assert.equal(destData.length, sourceData.length);
    });

    afterEach(async () => {
        await destInst.truncate();
    });
});