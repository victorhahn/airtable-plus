const Airtable = require('airtable');
const camelcaseKeys = require('camelcase-keys');
const pMap = require('p-map');

/**
     * Creates an Airtable api object. Additional parameters can be set to the global configuration
     * object each method uses on subsequent calls. The instance will default to environment
     * variables for apiKey, baseID, and tableName if not passed into configuration object.
     * 
     * @example
     * //common usage
     * const inst = new AirtablePlus({
     *  baseID: 'xxx',
     *  tableName: 'Table 1'
     * });
     * 
     * // instantiating with all optional parameters set to their defaults
     * const inst = new AirtablePlus({
     *  apiKey: process.env.AIRTABLE_API_KEY,
     *  baseID: process.env.AIRTABLE_BASE_ID,
     *  tableName: process.env.AIRTABLE_TABLE_NAME,
     *  camelCase: false,
     *  complex: false,
     *  transform: undefined // optional function to modify records on read
     * });
     * 
     * @param {Object} config - Configuration object
     * @param {string} [config.apiKey] - Airtable API key
     * @param {string} [config.baseID] - Airtable base ID
     * @param {string} [config.tableName] - Airtable table name
     * @param {string} [config.camelCase] - Converts column name object keys to camel case in JSON response
     * @param {string} [config.concurrency] - Sets concurrency for async iteration functions
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.transform] - Optional global transform function for reads
     */
class AirtablePlus {
    constructor(config) {
        this.config = this._mergeConfig({
            apiKey: process.env.AIRTABLE_API_KEY,
            baseID: process.env.AIRTABLE_BASE_ID,
            tableName: process.env.AIRTABLE_TABLE_NAME,
            camelCase: false,
            complex: false,
            concurrency: 1,
            ...config
        });
    }

    /**
     * Creates a new row using the supplied data object as row values.
     * The object must contain valid keys that correspond to the name and
     * data type of the Airtable table schema being written into, else it will
     * throw an error.
     * 
     * @example
     * const res = await inst.create({ firstName: 'foo' });
     * 
     * @param {Object} data - Create data object
     * @param {Object} [config] - Optional configuration override
     * @param {string} [config.tableName] - Airtable table name
     * @param {string} [config.baseID] - Airtable base id
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @returns {Promise} Created Record Object
     */
    async create(data, config) {
        if(!data) throw new Error("data object empty");
        const { tableName, base, complex } = this._mergeConfig(config);

        const record = await base(tableName).create(data);
        return complex? record : record._rawJson;
    }
    
    /**
     * Read all data from a table. Can be passed api options
     * for filtering and sorting (see Airtable API docs).
     * An optional transform function can be passed in to manipulate
     * the rows as they are being read in.
     * 
     * @example
     * // standard usage
     * const res = await inst.read();
     * 
     * // takes airtable api options
     * const res = await inst.read({ maxRecords: 1 });
     * 
     * @param {Object|string} [params] - If string: sets Airtable table name, If object: Airtable api parameters 
     * @param {string} [params.filterByFormula] - Airtable API parameter filterByFormula
     * @param {number} [params.maxRecords] - Airtable API parameter maxRecords
     * @param {number} [params.pageSize] - Airtable API parameter pageSize
     * @param {Object[]} [params.sort] - Airtable API parameter sort [{field: 'name, direction: 'asc'}]
     * @param {string} [params.view] - Airtable API parameter view to set view ID
     * @param {string} [params.cellFormat] - Airtable API parameter cellFormat
     * @param {string} [params.timeZone] - Airtable API parameter timeZone
     * @param {string} [params.userLocale] - Airtable API parameter userLocale
     * @param {Object} [config] - Optional configuration override
     * @param {string} [config.tableName] - Airtable table name
     * @param {string} [config.camelCase] - Converts column name object keys to camel case in JSON response
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.transform] - Optional global transform function for reads
     * @param {function} [config.base] - Airtable sdk base instance
     * @returns {Promise} Array of record objects
     */
    read(params, config) {
        let { tableName, camelCase, transform, complex, base } = this._mergeConfig(config);
        if(typeof params === "string") {
            tableName = params;
            params = {};
        }
        
        return new Promise((resolve, reject) => {
            let data = [];
            base(tableName).select(params || {}).eachPage((records, next) => {
                data = data.concat(records.map(el => complex? el : el._rawJson));
                next();
            }, err => {
                if(err) return reject(err);
                if(camelCase) data = camelcaseKeys(data, { deep: true });

                if(transform) {
                    const transformed = data.map(el => transform({ ...el })).filter(el => !!el);
                    if(transformed.length > 0) data = transformed;
                }

                resolve(data.filter(rows => !!rows));
            });
        });
    }

    /**
     * Get data for a specific row on Airtable
     * 
     * @example
     * const res = await inst.find('1234');
     * 
     * @param {string} rowID - Airtable Row ID to query data from
     * @param {Object} [config] - Optional config override
     * @param {string} [config.tableName] - Airtable table name
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.base] - Airtable sdk base instance
     * @returns {Promise} Record object
     */
    async find(rowID, config) {
        const { tableName, complex, base } = this._mergeConfig(config);

        const record = await base(tableName).find(rowID);
        return complex? record : record._rawJson;
    }    

    /**
     * Updates a row in Airtable. Unlike the replace method anything
     * not passed into the update data object still will be retained.
     * You must send in an object with the keys in the same casing
     * as the Airtable table columns (even when using camelCase=true in config)
     * 
     * @example
     * const res = await inst.update('1234', { firstName: 'foobar' });
     * 
     * @param {string} rowID - Airtable Row ID to update
     * @param {Object} data - row data with keys that you'd like to update
     * @param {Object} [config] - Optional config override
     * @param {string} [config.tableName] - Airtable table name
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.base] - Airtable sdk base instance
     * @returns {Promise} Array of record objects
     */
    async update(rowID, data, config) {
        const { tableName, base, complex } = this._mergeConfig(config);

        const record = await base(tableName).update(rowID, data);
        return complex? record : record._rawJson;
    }

    /**
     * Performs a bulk update based on a search criteria. The criteria must
     * be formatted in the valid Airtable formula syntax (see Airtable API docs)
     * 
     * @example
     * const res = await inst.updateWhere('firstName = "foo"', { firstName: 'fooBar' });
     * 
     * @param {string} where - filterByFormula string to filter table data by
     * @param {Object} data - Data to update if where condition is met
     * @param {Object} [config] - Optional configuration override
     * @param {string} [config.baseID] - Airtable base ID
     * @param {string} [config.tableName] - Airtable table name
     * @param {string} [config.camelCase] - Converts column name object keys to camel case in JSON response
     * @param {string} [config.concurrency] - Sets concurrency for async iteration functions
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.transform] - Optional global transform function for reads
     * @returns {Promise} Array of record objects
     */
    async updateWhere(where, data, config) {
        const cfg = this._mergeConfig(config);
        const rows = await this.read({ filterByFormula: where }, cfg);

        return pMap(rows, async row => {
            return this.update(cfg.complex? row.getId() : row.id, data, cfg);
        }, { concurrency: cfg.concurrency });
    }

    /**
     * Replaces a given row in airtable. Similar to the update function,
     * the only difference is this will completely overwrite the row. 
     * Any cells not passed in will be deleted from source row.
     * 
     * @example
     * const res = await inst.replace('1234', { firstName: 'foobar' });
     * 
     * @param {string} rowID - Airtable Row ID to replace
     * @param {Object} data - row data with keys that you'd like to replace
     * @param {Object} [config] - Optional config override
     * @param {string} [config.tableName] - Airtable table name
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.base] - Airtable sdk base instance
     * @returns {Promise} Record object
     */
    async replace(rowID, data, config) {
        const { tableName, base, complex } = this._mergeConfig(config);

        const record = await base(tableName).replace(rowID, data);
        return complex? record : record._rawJson;
    }

    /**
     * Performs a bulk replace based on a given search criteria. The criteria must
     * be formatted in the valid Airtable formula syntax (see Airtable API docs)
     * 
     * @example
     * const res = await inst.replaceWhere('firstName = "foo"', { firstName: 'fooBar' });
     * 
     * @param {string} where - filterByFormula string to filter table data by
     * @param {Object} data - Data to replace if where condition is met
     * @param {Object} [config] - Optional configuration override
     * @param {string} [config.baseID] - Airtable base ID
     * @param {string} [config.tableName] - Airtable table name
     * @param {string} [config.camelCase] - Converts column name object keys to camel case in JSON response
     * @param {string} [config.concurrency] - Sets concurrency for async iteration functions
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.transform] - Optional global transform function for reads
     * @returns {Promise} Array of record objects
     */
    async replaceWhere(where, data, config) {
        const cfg = this._mergeConfig(config);
        const rows = await this.read({ filterByFormula: where }, cfg);

        return pMap(rows, async row => {
            return this.replace(cfg.complex? row.getId() : row.id, data, cfg);
        }, { concurrency: cfg.concurrency });
    }

    /**
     * Deletes a row in the provided table
     * 
     * @example
     * const res = await inst.delete('1234');
     * 
     * @param {string} rowID - Airtable Row ID to delete
     * @param {Object} data - row data with keys that you'd like to delete
     * @param {Object} [config] - Optional config override
     * @param {string} [config.tableName] - Airtable table name
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.base] - Airtable sdk base instance
     * @returns {Promise} Record object
     */
    async delete(rowID, config) {
        const { tableName, base, complex } = this._mergeConfig(config);

        const record = await base(tableName).destroy(rowID);

        return complex? record : ({
            id: record.id,
            fields: {},
            createdTime: null
        });
    }

    /**
     * Performs a bulk delete based on a search criteria. The criteria must
     * be formatted in the valid Airtable formula syntax (see Airtable API docs)
     * 
     * @example
     * const res = await inst.deleteWhere('firstName = "foo"');
     * 
     * @param {string} where - filterByFormula string to filter table data by
     * @param {Object} data - Data to delete if where condition is met
     * @param {Object} [config] - Optional configuration override
     * @param {string} [config.baseID] - Airtable base ID
     * @param {string} [config.tableName] - Airtable table name
     * @param {string} [config.camelCase] - Converts column name object keys to camel case in JSON response
     * @param {string} [config.concurrency] - Sets concurrency for async iteration functions
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {function} [config.transform] - Optional global transform function for reads
     * @returns {Promise} Array of record objects
     */
    async deleteWhere(where, config) {
        const cfg = this._mergeConfig(config);
        const rows = await this.read({ filterByFormula: where }, cfg);

        return pMap(rows, async row => {
            return this.delete(cfg.complex? row.getId() : row.id, cfg);
        }, { concurrency: cfg.concurrency });
    }

    /**
     * Truncates a table specified in the configuration object
     * 
     * @example
     * const res = await inst.truncate();
     * 
     * @param {Object} config - override configuration object
     * @param {string} [config.tableName] - Airtable table name
     * @returns {Promise} Array of record objects
     */
    async truncate(config) {
        const cfg = this._mergeConfig(config);
        const rows = await this.read({}, cfg);
        return Promise.all(rows.map((row) => this.delete(cfg.complex? row.getId() : row.id, cfg)));
    }

    /**
     * Reads all the values from one table and appends to another table. Allows for
     * selective appending by sending optional fields and filters. 
     * 
     * @example
     * // complex usage in the same base
     * const res = await inst.appendTable('Read', 'Write');
     * 
     * // allows for configuration of both source and dest
     * const res = await inst.appendTable({ tableName: 'Read', baseID: 'xxx' },  { tableName: 'Write' })
     * 
     * @param {Object|string} source - if string, source represents source table name
     * @param {string} source.tableName - Source table name
     * @param {string} [source.baseID] - Source base id
     * @param {string} [source.fields] - What fields to copy over to destination table
     * @param {string} [source.where] - Filter passed in to conditionally copy
     * @param {Object|string} dest - if string, dest represents dest table name
     * @param {string} dest.tableName - Dest table name
     * @param {string} [dest.baseID] - Dest base id
     * @param {string} [dest.concurrency] - Dest concurrency when creating new values
     * @returns {Promise} Array of record objects
     */
    async appendTable(sourceCfg, destCfg) {
        if(typeof sourceCfg === 'string') sourceCfg = { tableName: sourceCfg };
        if(typeof destCfg === 'string') destCfg = { tableName: destCfg };

        let { concurrency = 1, ...dest } = destCfg;
        destCfg = dest;

        const rows = await this.read({
            filterByFormula: sourceCfg.where || '',
            fields: sourceCfg.fields || []
        }, sourceCfg);

        return pMap(rows, async ({ fields }) => {
            return this.create(fields, destCfg);
        }, { concurrency });
    }

    /**
     * Copies/Overwrites one table into another. The source table will have all rows deleted
     * prior to having the source rows inserted.
     * 
     * @example
     * // complex usage in the same base
     * const res = await inst.overwriteTable('Read', 'Write');
     * 
     * // allows for configuration of both source and dest
     * const res = await inst.overwriteTable({ tableName: 'Read', baseID: 'xxx' },  { tableName: 'Write' })
     * 
     * @param {Object|string} source - if string, source represents source table name
     * @param {string} source.tableName - Source table name
     * @param {string} [source.baseID] - Source base id
     * @param {string} [source.fields] - What fields to copy over to destination table
     * @param {string} [source.where] - Filter passed in to conditionally copy
     * @param {Object|string} dest - if string, dest represents dest table name
     * @param {string} dest.tableName - Dest table name
     * @param {string} [dest.baseID] - Dest base id
     * @param {string} [dest.concurrency] - Dest concurrency when creating new values
     * @returns {Promise} Array of record objects
     */
    async overwriteTable(sourceCfg, destCfg) {
        if(typeof destCfg === 'string') destCfg = { tableName: destCfg };
        await this.truncate(destCfg);
        return this.appendTable(sourceCfg, destCfg);
    }

    /**
     * Attempts to upsert based on passed in primary key.
     * Inserts if a new entry or updates if entry is already found
     * 
     * @example
     * const res = await inst.upsert('primarKeyID', data);
     * 
     * @param {string} key - Primary key to compare value in passed in data object with dest row
     * @param {Object} data - Updated data
     * @param {Object} [config] - Optional config override
     * @param {string} [config.tableName] - Airtable table name
     * @param {boolean} [config.complex] - Flag to return full Airtable record object with helper methods attached
     * @param {string} [config.baseID] - Airtable base id
     * @returns {Promise} Array of record objects
    */
    async upsert(key, data, config) {
        if(!key || !data) throw new Error('please check passed parameters. key and data are required');
        const cfg = this._mergeConfig(config);

        const rows = await this.read({
            filterByFormula: `${this._formatColumnFilter(key)} = ${data[key]}`
        }, cfg);
        if(rows.length === 0) return this.create(data, cfg);
        
        return pMap(rows, row => {
            return this.update(cfg.complex? row.getId() : row.id, data, cfg);
        }, { concurrency: cfg.concurrency });
    }

    /**
     * Performs validations on object for current function run
     * Allows the package user to pass in an override config
     * object to change table name, apiKey, etc. at any time
     *
     * @ignore
     * @param {Object} config - override config object
     * @returns {Object} - local configuration object
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
     * 
     * Ex. 'Column ID' => '{Column ID}'
     *
     * @ignore
     * @param {string} columnName - Airtable Column name being used in a filter
     * @returns {string} - formatted column name
     */
    _formatColumnFilter(columnName='') {
        columnName = '' + columnName;
        return columnName.split(' ').length > 1? `{${columnName}}` : columnName;
    }
}

module.exports = AirtablePlus;