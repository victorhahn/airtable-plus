"use strict";
const Airtable = require('airtable');
const camelcaseKeys = require('camelcase-keys');
const flatten = require('array-flatten');
const chunk = require('chunk');
const pThrottle = require('p-throttle');
const pMap = require('p-map');


class AirtablePlus {
    /**
     * Creates an Airtable api object. Additional parameters can be set to the global configuration
     * object each method uses on subsequent calls. The instance will default to environment
     * variables for apiKey, baseID, and tableName if not passed into configuration object.
     * 
     * @param {Object} config Configuration object.
     * @param {String} [config.apiKey=process.env.AIRTABLE_API_KEY] Airtable API key.
     * @param {String} [config.baseID=process.env.AIRTABLE_BASE_ID] Airtable base ID.
     * @param {String} [config.tableName=process.env.AIRTABLE_TABLE_NAME] Airtable table name.
     * @param {String} [config.camelCase=false] Converts column name object keys to camel case in JSON response.
     * @param {String} [config.concurrency=1] Sets concurrency for async iteration functions.
     * @param {Boolean} [config.complex=false] Flag to return full Airtable record object with helper methods attached.
     * @param {Boolean} [config.typecast=false] Enables typecast for the Airtable API.
     * @param {Function} [config.transform] Optional global transform function for reads.
     * 
     * @example
     * //common usage
     * const airtablePlus = new AirtablePlus({
     *  baseID: 'xxx',
     *  tableName: 'Table 1'
     * });
     * 
     * // instantiating with all optional parameters set to their defaults
     * const airtablePlus = new AirtablePlus({
     *  apiKey: process.env.AIRTABLE_API_KEY,
     *  baseID: process.env.AIRTABLE_BASE_ID,
     *  tableName: process.env.AIRTABLE_TABLE_NAME,
     *  camelCase: false,
     *  concurrency: 1,
     *  complex: false,
     *  typecast: false,
     *  transform: undefined // optional function to modify records on read
     * });
     */
    constructor(config) {
        this.config = this._mergeConfig({
            apiKey: process.env.AIRTABLE_API_KEY,
            baseID: process.env.AIRTABLE_BASE_ID,
            tableName: process.env.AIRTABLE_TABLE_NAME,
            camelCase: false,
            complex: false,
            concurrency: 1,
            typecast: false,
            ...config
        });
        
        this._throttle = pThrottle(fn => fn(), 5, 1000);
    }
    
    /**
     * Creates a new instance of AirtablePlus for the given base ID. Shortcut to switching between 
     * Airtable bases.
     * 
     * @param {String} baseID Base ID in which to create a new instance for.
     * @param {Object} [config={}] Optional configuration parameters to send to the new instance of AirtablePlus.
     * @returns {AirtablePlus} New instance of AirtablePlus for the provided base ID.
     * 
     * @example 
     * const mySecondBase = airtablePlus.use('XXXXXXXXXXXXXXX');
     */
    use(baseID, config={}) {
        config.baseID = baseID;
        
        const cfg = this._mergeConfig(config);
        return new AirtablePlus(cfg);
    }
    
    /**
     * Creates a new row using the supplied data object as row values. The object must contain valid keys 
     * that correspond to the name and data type of the Airtable table schema being written into, else it 
     * will throw an error.
     * 
     * @example
     * const res = await airtablePlus.create({ firstName: 'foo' });
     * 
     * @param {Object|Object[]} data Create data object or array of data objects to be created.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object|Object[]>} Created Record object or array of Record objects.
     */
    async create(data, config) {
        if(!data || (Array.isArray(data) && !data.length)) throw new Error("data object empty");
        const cfg = this._mergeConfig(config);
        const { tableName, base, complex, typecast } = cfg;
        let params = typecast? { typecast } : undefined;
        return await this._handleBatch(data, cfg, async items => {
            const records = await this._throttle(() => base(tableName).create(items, params));
            return records.map(record => complex? record : record._rawJson);
        });
    }
    
    /**
     * Read all data from a table. Can be passed api options for filtering and sorting (see Airtable API 
     * docs). An optional transform function can be passed in to manipulate the rows as they are being 
     * read in.
     * 
     * @param {Object|String} [params] The Airtable table name if string or api parameters if an object. 
     * @param {String} [params.filterByFormula] Airtable API parameter filterByFormula.
     * @param {Number} [params.maxRecords] Airtable API parameter maxRecords.
     * @param {Number} [params.pageSize] Airtable API parameter pageSize.
     * @param {Object[]} [params.sort] Airtable API parameter sort [{field: 'name, direction: 'asc'}].
     * @param {String} [params.view] Airtable API parameter view to set view ID.
     * @param {String} [params.cellFormat] Airtable API parameter cellFormat.
     * @param {String} [params.timeZone] Airtable API parameter timeZone.
     * @param {String} [params.userLocale] Airtable API parameter userLocale.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object[]>} Array of record objects
     * 
     * @example
     * // standard usage
     * const res = await airtablePlus.read();
     * 
     * // takes airtable api options
     * const res = await airtablePlus.read({ maxRecords: 1 });
     */
    async read(params, config) {
        let { tableName, camelCase, transform, complex, base } = this._mergeConfig(config);
        if(typeof params === "string") {
            tableName = params;
            params = {};
        }
        
        let records = await this._throttle(() => base(tableName).select(params || {}).all());
        records = records.map(el => complex? el : el._rawJson);
        
        if(camelCase) records = camelcaseKeys(records, { deep: true });
        if(transform) {
            const transformed = records.map(el => transform({ ...el })).filter(el => !!el);
            if(transformed.length > 0) records = transformed;
        }

        return records.filter(rows => !!rows);
    }

    /**
     * Get data for a specific row in Airtable.
     * 
     * @param {String} rowID Airtable Row ID to query data from.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object>} Found record object.
     * 
     * @example
     * const res = await airtablePlus.find('1234');
     */
    async find(rowID, config) {
        const { tableName, complex, base } = this._mergeConfig(config);

        const record = await this._throttle(() => base(tableName).find(rowID));
        return complex? record : record._rawJson;
    }    
    
    /**
     * Updates a single or multiple rows in Airtable. Unlike the replace method anything not passed into the 
     * update data object still will be retained. You must send in an array of objects with the keys in the 
     * same casing as the Airtable table columns (even when using camelCase=true in config).
     * 
     * @param {String} [rowID] Optional row ID to update.
     * @param {Object[]|Object} data Array of record objects or single record object to update.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object[]|Object>} Array of record objects which have been updated.
     * 
     * @example
     * // Batch update multiple rows:
     * const res = await airtablePlus.update([{
     *      id: 'XXXXXXXXXXXXXXXX',
     *      fields: {
     *          FirstName: 'foobar'
     *      }
     * }]);
     * 
     * // Update a single row:
     * const res = await airtablePlus.update('XXXXXXXXXXXXXXXX', {
     *      FirstName: 'foobar'
     * });
     */
    async update(rowID, data, config) {
        let _batch = false;
        if(Array.isArray(rowID)) {
            config = data;
            data = rowID;
            _batch = true;
        }
        
        const cfg = this._mergeConfig(config);
        const { tableName, base, complex, typecast } = cfg;
        let params = typecast? { typecast } : undefined;
        
        if(_batch) {
            return await this._handleBatch(data, config, async items => {
                const records = await this._throttle(() => base(tableName).update(items, params));
                return records.map(record => complex? record : record._rawJson);
            });
        }
        
        const record = await this._throttle(() => base(tableName).update(rowID, data, params));
        return complex? record : record._rawJson;
    }
    
    /**
     * Updates a row in Airtable. Alias of `update()`.
     * 
     * @param {String} rowID Airtable Row ID to update.
     * @param {Object} data Row data with keys that you'd like to update.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object>} Record object which has been updated.
     * 
     * @example
     * const res = await airtablePlus.updateRow('1234', { FirstName: 'foobar' });
     */
    updateRow(rowID, data, config) {
        return this.update(rowID, data, config);
    }

    /**
     * Performs a bulk update based on a search criteria. The criteria must be formatted in the valid 
     * Airtable formula syntax (see Airtable API docs).
     * 
     * @param {String} where filterByFormula string to filter table data by.
     * @param {Object} data Data to update if where condition is met.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object[]>} Array of record objects which have been updated.
     * 
     * @example
     * const res = await airtablePlus.updateWhere('FirstName = "Foo"', { FirstName: 'Bar' });
     */
    async updateWhere(where, data, config) {
        const cfg = this._mergeConfig(config);
        const rows = await this.read({ filterByFormula: where }, cfg);
        
        const records = rows.map(rec => {
            return {
                id: cfg.complex? rec.getId() : rec.id,
                fields: data
            };
        });
        
        return await this.update(records, cfg);
    }
    
    /**
     * Replaces given rows or single row in airtable. Similar to the update function, the only difference
     * is this will completely overwrite the row. Any cells not passed in will be deleted from source rows.
     * 
     * @param {String} [rowID] Optional row id to replace.
     * @param {Object[]|Object} data Array of record objects or single object to replace within Airtable.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object[]|Object>} Array of record objects.
     * 
     * @example
     * // Batch replace rows:
     * const res = await airtablePlus.replace([{
     *      id: 'XXXXXXXXXXXXXXXX',
     *      fields: { 
     *          FirstName: 'Foo'
     *      }
     * }]);
     * 
     * // Replace a single row:
     * const res = await airtablePlus.replace('XXXXXXXXXXXXXXXX', {
     *      FirstName: 'Foo'
     * });
     */
    async replace(rowID, data, config) {
        let _batch = false;
        if(Array.isArray(rowID)) {
            config = data;
            data = rowID;
            _batch = true;
        }
        
        const cfg = this._mergeConfig(config);
        const { tableName, base, complex, typecast } = cfg;
        let params = typecast? { typecast } : undefined;
        
        if(_batch) {
            return await this._handleBatch(data, config, async items => {
                const records = await this._throttle(() => base(tableName).replace(items, params));
                return records.map(record => complex? record : record._rawJson);
            });
        }
        
        const record = await this._throttle(() => base(tableName).replace(rowID, data, params));
        return complex? record : record._rawJson;
    }
    
    /**
     * Replaces a given row in airtable. Alias for `replace()`.
     * 
     * @param {String} rowID Airtable Row ID to replace
     * @param {Object} data row data with keys that you'd like to replace
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object>} Record object
     * 
     * @example
     * const res = await airtablePlus.replaceRow('XXXXXXXXXXXXXXXX', { FirstName: 'Foo' });
     */
    replaceRow(rowID, data, config) {
        return this.replace(rowID, data, config);
    }

    /**
     * Performs a bulk replace based on a given search criteria. The criteria must be formatted in the valid 
     * Airtable formula syntax (see Airtable API docs).
     * 
     * @param {String} where filterByFormula string to filter table data by.
     * @param {Object} data Data to replace if where condition is met.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object[]>} Array of record objects
     * 
     * @example
     * const res = await airtablePlus.replaceWhere('FirstName = "foo"', { FirstName: 'Bar' });
     */
    async replaceWhere(where, data, config) {
        const cfg = this._mergeConfig(config);
        const rows = await this.read({ filterByFormula: where }, cfg);
        
        const records = rows.map(rec => {
            return {
                id: cfg.complex? rec.getId() : rec.id,
                fields: data
            };
        });
        
        return await this.replace(records, cfg);
    }

    /**
     * Deletes a row in the provided table.
     * 
     * @param {String|String[]} rowID String or array of Airtable Row IDs to delete.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object|Object[]>} Record object or array of Record objects.
     * 
     * @example
     * // delete a single row
     * const res = await airtablePlus.delete('XXXXXXXXXXXXXXXX');
     * 
     * // delete multiple rows
     * const res = await airtablePlus.delete([
     *      'XXXXXXXXXXXXXXX1',
     *      'XXXXXXXXXXXXXXX2',
     *      'XXXXXXXXXXXXXXX3'
     * ]);
     */
    async delete(rowID, config) {
        const cfg = this._mergeConfig(config);
        const { tableName, base, complex } = cfg;
        
        return await this._handleBatch(rowID, cfg, async items => {
            const records = await this._throttle(() => base(tableName).destroy(items));
            return records.map(record => complex? record : ({
                id: record.id,
                fields: {},
                createdTime: null
            }));
        });
    }

    /**
     * Performs a bulk delete based on a search criteria. The criteria must be formatted in the valid Airtable 
     * formula syntax (see Airtable API docs)
     * 
     * @param {String} where filterByFormula string to filter table data by.
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object[]>} Array of record objects.
     * 
     * @example
     * const res = await airtablePlus.deleteWhere('FirstName = "foo"');
     */
    async deleteWhere(where, config) {
        const cfg = this._mergeConfig(config);
        const rows = await this.read({ filterByFormula: where }, cfg);
        
        const rowIds = rows.map(rec => cfg.complex? rec.getId() : rec.id);
        return await this.delete(rowIds, cfg);
    }

    /**
     * Truncates a table.
     * 
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object[]>} Array of record objects deleted.
     * 
     * @example
     * const res = await airtablePlus.truncate();
     */
    async truncate(config) {
        const cfg = this._mergeConfig(config);
        const rows = await this.read({}, cfg);
        
        const rowIds = rows.map(row => cfg.complex? row.getId() : row.id);
        return await this.delete(rowIds, cfg);
    }

    /**
     * Reads all the values from one table and appends to another table. Allows for selective appending by 
     * sending optional fields and filters. 
     * 
     * @param {Object|String} source If string, source represents source table name.
     * @param {String} [source.tableName] Source table name.
     * @param {String} [source.baseID] Source base id.
     * @param {String} [source.fields] What fields to copy over to destination table, default is all fields.
     * @param {String} [source.where] Filter passed in to conditionally copy.
     * @param {Object|String} dest If string, dest represents dest table name.
     * @param {String} [dest.tableName] Destination table name.
     * @param {String} [dest.baseID] Destination base id.
     * @returns {Promise<Object[]>} Array of record objects.
     * 
     * @example
     * // appending to another table in the same base
     * const res = await airtablePlus.appendTable('Read', 'Write');
     * 
     * // allows for configuration of both source and dest
     * const res = await airtablePlus.appendTable({ tableName: 'Read', baseID: 'xxx' },  { tableName: 'Write' });
     */
    async appendTable(sourceCfg, destCfg) {
        if(typeof sourceCfg === 'string') sourceCfg = { tableName: sourceCfg };
        if(typeof destCfg === 'string') destCfg = { tableName: destCfg };

        const rows = await this.read({
            filterByFormula: sourceCfg.where || '',
            fields: sourceCfg.fields || []
        }, sourceCfg);
        
        const records = rows.map(rec => rec.fields);
        return await this.create(records, destCfg);
    }

    /**
     * Copies/Overwrites one table into another. The source table will have all rows deleted prior to having 
     * the source rows inserted.
     * 
     * @param {Object|String} source If string, source represents source table name.
     * @param {String} [source.tableName] Source table name.
     * @param {String} [source.baseID] Source base id.
     * @param {String} [source.fields] What fields to copy over to destination table.
     * @param {String} [source.where] Filter passed in to conditionally copy.
     * @param {Object|String} dest If string, dest represents dest table name.
     * @param {String} [dest.tableName] Destination table name.
     * @param {String} [dest.baseID] Destination base id.
     * @param {String} [dest.concurrency] Destination concurrency when creating new values.
     * @returns {Promise<Object[]>} Array of record objects.
     * 
     * @example
     * // overwriting table in the same base
     * const res = await airtablePlus.overwriteTable('Read', 'Write');
     * 
     * // allows for configuration of both source and dest
     * const res = await airtablePlus.overwriteTable({ tableName: 'Read', baseID: 'xxx' },  { tableName: 'Write' })
     */
    async overwriteTable(sourceCfg, destCfg) {
        if(typeof destCfg === 'string') destCfg = { tableName: destCfg };
        await this.truncate(destCfg);
        return await this.appendTable(sourceCfg, destCfg);
    }

    /**
     * Attempts to upsert based on passed in primary key. Inserts if a new entry or updates if entry is 
     * already found.
     * 
     * @param {String} key Primary key to compare value in passed in data object with dest row
     * @param {Object} data Updated data
     * @param {Object} [config] Optional configuration to override options passed into the constructor.
     * @returns {Promise<Object[]>} Array of record objects updated/created.
     * 
     * @example
     * const res = await airtablePlus.upsert('primaryKey', data);
    */
    async upsert(key, data, config) {
        if(!key || !data) throw new Error('Key and data are required');
        const cfg = this._mergeConfig(config);
        
        let formattedData = data[key];
        switch (typeof formattedData) {
            case 'string':
                formattedData = `"${formattedData}"`; break;
            case 'boolean':
                formattedData = formattedData? 'TRUE' : 'FALSE'; break;
        }
        
        const rows = await this.read({
            filterByFormula: `${this._formatColumnFilter(key)} = ${formattedData}`
        }, cfg);
        if(rows.length === 0) return await this.create(data, cfg);
        
        const records = rows.map(rec => {
            return {
                id: cfg.complex? rec.getId() : rec.id,
                fields: data
            };
        });
        
        return await this.update(records, cfg);
    }
    
    /**
     * Performs validations on object for current function run. Allows the package user to pass in an 
     * override config object to change table name, apiKey, etc. at any time.
     *
     * @ignore
     * @param {Object} config Optional configuration to override options passed into the constructor.
     * @returns {Object} Local configuration object.
     */
    _mergeConfig(config) {
        if(!config) return this.config;
        let override = {};
        if(typeof config === "string") override.tableName = config;

        if(typeof config === "object") {
            if(typeof config.transform !== "function") config.transform = undefined;
            override = config;
        }

        let cfg = { ...this.config, ...override };

        if(cfg.apiKey !== Airtable.apiKey) {
            Airtable.apiKey = cfg.apiKey;
            cfg.base = Airtable.base(cfg.baseID);
        }

        if(!cfg.base || (cfg.baseID !== cfg.base.getId())) cfg.base = Airtable.base(cfg.baseID);

        return cfg;
    }

    /**
     * Determines if a Column name is multiple words, which results in being
     * wrapped in curly braces. Useful for Airtable filterByFormula queries.
     * Ex. 'Column ID' => '{Column ID}'
     *
     * @ignore
     * @param {String} columnName Airtable Column name being used in a filter.
     * @returns {String} Formatted column name.
     */
    _formatColumnFilter(columnName='') {
        columnName = `${columnName}`;
        return /\s/g.test(columnName)? `{${columnName}}` : columnName;
    }
    
    /**
     * Chunks data into sets of 10 to accommodate Airtable's batch API. 
     * 
     * @ignore
     * @param {*} data Data to chunk into sets of 10.
     * @returns {Array[]} Array of chunked data.
     */
    _chunkData(data) {
        if(Array.isArray(data)) {
            if(data.length > 10) return chunk(data, 10);
            return [data];
        }
        
        return [[data]];
    }
    
    /**
     * Handles iterating over batched data.
     *
     * @ignore
     * @param {Array} data Data to batch into chunks and iterate over.
     * @param {Object} config Configuration object for the method.
     * @param {Function} iterator Iterator function to call for each chunk of batched data.
     * @returns {Promise<Object|Object[]>} A single record object or array of record objects.
     */
    async _handleBatch(data, { concurrency }, iterator) {
        data = this._chunkData(data);
        
        let res = await pMap(data, iterator, { concurrency });
        
        res = flatten(res);
        return res.length > 1? res : res[0];
    }
}

module.exports = AirtablePlus;
