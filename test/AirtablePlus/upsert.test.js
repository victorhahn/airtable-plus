/*global assert */
const mock = require('../mock.js');
const AirtablePlus = require('../../lib/AirtablePlus.js');
const inst = new AirtablePlus(mock.write);

describe('upsert', () => {
    it('Should insert new data with valid object', async () => {
        const data = {
            firstName: 'foo',
            lastName: 'bar',
            gender: 'Male',
            ID: "1"
        };
        
        const res = await inst.upsert('ID', data);

        assert.isDefined(res);
        assert.equal(res.fields.firstName, data.firstName);
        assert.equal(res.fields.lastName, data.lastName);
        assert.equal(res.fields.gender, data.gender);
        assert.equal(res.fields.ID, data.ID);        
    });

    it('Should update data', async () => {
        const data = {
            firstName: 'foo',
            lastName: 'bar',
            gender: 'Male',
            ID: "1"
        };
        const updatedData = { ...data, gender: 'Female' };

        await inst.create(data);

        const [row2] = await inst.upsert('ID', updatedData);
        assert.equal(row2.fields.gender, updatedData.gender);
        assert.equal(row2.fields.firstName, updatedData.firstName);
        assert.equal(row2.fields.lastName, updatedData.lastName);
        assert.equal(row2.fields.ID, updatedData.ID);
    });

    it('Should insert with complex=true', async () => {
        const data = {
            firstName: 'foo',
            lastName: 'bar',
            gender: 'Male',
            ID: "1"
        };

        const cfg = { complex: true };
        
        const res = await inst.upsert('ID', data, cfg);

        assert.isDefined(res);
        assert.equal(res.fields.firstName, data.firstName);
        assert.equal(res.fields.lastName, data.lastName);
        assert.equal(res.fields.gender, data.gender);
        assert.equal(res.fields.ID, data.ID);        
    });

    it('Should update data with complex=true', async () => {
        const data = {
            firstName: 'foo',
            lastName: 'bar',
            gender: 'Male',
            ID: "1"
        };
        const updatedData = { ...data, gender: 'Female' };
        const cfg = { complex: true }; 

        await inst.create(data, cfg);

        const [row2] = await inst.upsert('ID', updatedData, cfg);
        assert.equal(row2.fields.gender, updatedData.gender);
        assert.equal(row2.fields.firstName, updatedData.firstName);
        assert.equal(row2.fields.lastName, updatedData.lastName);
        assert.equal(row2.fields.ID, updatedData.ID);
    });    

    it('Should throw error with no data passed in', async () => {
        let res = await inst.upsert().catch(assert.isDefined);
        assert.isUndefined(res);
    });

    afterEach(async () => {
        await inst.truncate();
    });
});