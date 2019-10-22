# airtable-plus ![Travis (.com) branch](https://travis-ci.org/victorhahn/airtable-plus.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/victorhahn/airtable-plus/badge.svg?branch=master)](https://coveralls.io/github/victorhahn/airtable-plus?branch=master) ![David](https://img.shields.io/david/victorhahn/airtable-plus.svg) ![npm](https://img.shields.io/npm/v/airtable-plus.svg) 
Airtable Node library designed for async/await with useful helper methods

## Install
```bash
npm i airtable-plus
```

## Tests
This package's testing suite utilizes:
- Mocha
- Chai
- Leasot
- Istanbul

```bash
# Run Mocha tests
npm run test
```

## Usage
```javascript

const AirtablePlus = require('airtable-plus');

// baseID, apiKey, and tableName can alternatively be set by environment variables
const airtable = new AirtablePlus({
    baseID: 'xxx',
    apiKey: 'xxx',
    tableName: 'Table 1',
});

(async () => {
    try {
        // allows for api params to be passed in from Airtable api
        const readRes = await airtable.read({
            filterByFormula: 'Name = "Foo"',
            maxRecords: 1
        });

        // functions can take optional override configuration object
        const cfg = { tableName: 'Read' };
        const updateRes = await airtable.update('1234', {
            Name: 'foobar'
        }, cfg);

        const updateWhereRes = await airtable.updateWhere('Name = "Foo"', {
            filterByFormula: 'Name = "foobar"'
        });

        const deleteRes = await airtable.delete('1234');

        const truncRes = await airtable.truncate();
    }
    catch(e) {
        console.error(e);
    }
})();
```

# API
<a name="AirtablePlus"></a>

## AirtablePlus
**Kind**: global class  

* [AirtablePlus](#AirtablePlus)
    * [new AirtablePlus(config)](#new_AirtablePlus_new)
    * [.use(baseID, [config])](#AirtablePlus+use) ⇒ [<code>AirtablePlus</code>](#AirtablePlus)
    * [.create(data, [config])](#AirtablePlus+create) ⇒ <code>Promise.&lt;(Object\|Array.&lt;Object&gt;)&gt;</code>
    * [.read([params], [config])](#AirtablePlus+read) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.find(rowID, [config])](#AirtablePlus+find) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.update(data, [config])](#AirtablePlus+update) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.updateRow(rowID, data, [config])](#AirtablePlus+updateRow) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.updateWhere(where, data, [config])](#AirtablePlus+updateWhere) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.replace(data, [config])](#AirtablePlus+replace) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.replaceRow(rowID, data, [config])](#AirtablePlus+replaceRow) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.replaceWhere(where, data, [config])](#AirtablePlus+replaceWhere) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.delete(rowID, [config])](#AirtablePlus+delete) ⇒ <code>Promise.&lt;(Object\|Array.&lt;Object&gt;)&gt;</code>
    * [.deleteWhere(where, [config])](#AirtablePlus+deleteWhere) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.truncate([config])](#AirtablePlus+truncate) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.appendTable(source, dest)](#AirtablePlus+appendTable) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.overwriteTable(source, dest)](#AirtablePlus+overwriteTable) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
    * [.upsert(key, data, [config])](#AirtablePlus+upsert) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>

<a name="new_AirtablePlus_new"></a>

### new AirtablePlus(config)
Creates an Airtable api object. Additional parameters can be set to the global configuration
object each method uses on subsequent calls. The instance will default to environment
variables for apiKey, baseID, and tableName if not passed into configuration object.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  | Configuration object. |
| [config.apiKey] | <code>String</code> | <code>process.env.AIRTABLE_API_KEY</code> | Airtable API key. |
| [config.baseID] | <code>String</code> | <code>process.env.AIRTABLE_BASE_ID</code> | Airtable base ID. |
| [config.tableName] | <code>String</code> | <code>process.env.AIRTABLE_TABLE_NAME</code> | Airtable table name. |
| [config.camelCase] | <code>String</code> | <code>false</code> | Converts column name object keys to camel case in JSON response. |
| [config.concurrency] | <code>String</code> | <code>1</code> | Sets concurrency for async iteration functions. |
| [config.complex] | <code>Boolean</code> | <code>false</code> | Flag to return full Airtable record object with helper methods attached. |
| [config.transform] | <code>function</code> |  | Optional global transform function for reads. |

**Example**  
```js
//common usage
const airtablePlus = new AirtablePlus({
 baseID: 'xxx',
 tableName: 'Table 1'
});

// instantiating with all optional parameters set to their defaults
const airtablePlus = new AirtablePlus({
 apiKey: process.env.AIRTABLE_API_KEY,
 baseID: process.env.AIRTABLE_BASE_ID,
 tableName: process.env.AIRTABLE_TABLE_NAME,
 camelCase: false,
 concurrency: 1,
 complex: false,
 transform: undefined // optional function to modify records on read
});
```
<a name="AirtablePlus+use"></a>

### airtablePlus.use(baseID, [config]) ⇒ [<code>AirtablePlus</code>](#AirtablePlus)
Creates a new instance of AirtablePlus for the given base ID. Shortcut to switching between 
Airtable bases.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: [<code>AirtablePlus</code>](#AirtablePlus) - New instance of AirtablePlus for the provided base ID.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| baseID | <code>String</code> |  | Base ID in which to create a new instance for. |
| [config] | <code>Object</code> | <code>{}</code> | Optional configuration parameters to send to the new instance of AirtablePlus. |

**Example**  
```js
const mySecondBase = airtablePlus.use('XXXXXXXXXXXXXXX');
```
<a name="AirtablePlus+create"></a>

### airtablePlus.create(data, [config]) ⇒ <code>Promise.&lt;(Object\|Array.&lt;Object&gt;)&gt;</code>
Creates a new row using the supplied data object as row values. The object must contain valid keys 
that correspond to the name and data type of the Airtable table schema being written into, else it 
will throw an error.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;(Object\|Array.&lt;Object&gt;)&gt;</code> - Created Record object or array of Record objects.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> \| <code>Array.&lt;Object&gt;</code> | Create data object or array of data objects to be created. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.create({ firstName: 'foo' });
```
<a name="AirtablePlus+read"></a>

### airtablePlus.read([params], [config]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Read all data from a table. Can be passed api options for filtering and sorting (see Airtable API 
docs). An optional transform function can be passed in to manipulate the rows as they are being 
read in.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| [params] | <code>Object</code> \| <code>String</code> | The Airtable table name if string or api parameters if an object. |
| [params.filterByFormula] | <code>String</code> | Airtable API parameter filterByFormula. |
| [params.maxRecords] | <code>Number</code> | Airtable API parameter maxRecords. |
| [params.pageSize] | <code>Number</code> | Airtable API parameter pageSize. |
| [params.sort] | <code>Array.&lt;Object&gt;</code> | Airtable API parameter sort [{field: 'name, direction: 'asc'}]. |
| [params.view] | <code>String</code> | Airtable API parameter view to set view ID. |
| [params.cellFormat] | <code>String</code> | Airtable API parameter cellFormat. |
| [params.timeZone] | <code>String</code> | Airtable API parameter timeZone. |
| [params.userLocale] | <code>String</code> | Airtable API parameter userLocale. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
// standard usage
const res = await airtablePlus.read();

// takes airtable api options
const res = await airtablePlus.read({ maxRecords: 1 });
```
<a name="AirtablePlus+find"></a>

### airtablePlus.find(rowID, [config]) ⇒ <code>Promise.&lt;Object&gt;</code>
Get data for a specific row in Airtable.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Found record object.  

| Param | Type | Description |
| --- | --- | --- |
| rowID | <code>String</code> | Airtable Row ID to query data from. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.find('1234');
```
<a name="AirtablePlus+update"></a>

### airtablePlus.update(data, [config]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Updates multiple rows in Airtable. Unlike the replace method anything not passed into the update data 
object still will be retained. You must send in an array of objects with the keys in the same casing 
as the Airtable table columns (even when using camelCase=true in config).

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects which have been updated.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Array of record objects to update. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.update([{
     id: 'XXXXXXXXXXXXXXXX',
     fields: {
         FirstName: 'foobar'
     }
}]);
```
<a name="AirtablePlus+updateRow"></a>

### airtablePlus.updateRow(rowID, data, [config]) ⇒ <code>Promise.&lt;Object&gt;</code>
Updates a row in Airtable. Unlike the replace method anything not passed into the update data object 
still will be retained. You must send in an object with the keys in the same casing as the Airtable 
table columns (even when using camelCase=true in config).

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Record object which has been updated.  

| Param | Type | Description |
| --- | --- | --- |
| rowID | <code>string</code> | Airtable Row ID to update |
| data | <code>Object</code> | Row data with keys that you'd like to update |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.updateRow('1234', { FirstName: 'foobar' });
```
<a name="AirtablePlus+updateWhere"></a>

### airtablePlus.updateWhere(where, data, [config]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Performs a bulk update based on a search criteria. The criteria must be formatted in the valid 
Airtable formula syntax (see Airtable API docs).

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects which have been updated.  

| Param | Type | Description |
| --- | --- | --- |
| where | <code>String</code> | filterByFormula string to filter table data by. |
| data | <code>Object</code> | Data to update if where condition is met. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.updateWhere('FirstName = "Foo"', { FirstName: 'Bar' });
```
<a name="AirtablePlus+replace"></a>

### airtablePlus.replace(data, [config]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Replaces given rows in airtable. Similar to the update function, the only difference is this will 
completely overwrite the row. Any cells not passed in will be deleted from source rows.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array.&lt;Object&gt;</code> | Array of record objects to replace within Airtable. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.replace([{
     id: 'XXXXXXXXXXXXXXXX',
     fields: { 
         FirstName: 'Foo'
     }
}]);
```
<a name="AirtablePlus+replaceRow"></a>

### airtablePlus.replaceRow(rowID, data, [config]) ⇒ <code>Promise.&lt;Object&gt;</code>
Replaces a given row in airtable. Similar to the update function, the only difference is this will 
completely overwrite the row. Any cells not passed in will be deleted from source row.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Record object  

| Param | Type | Description |
| --- | --- | --- |
| rowID | <code>String</code> | Airtable Row ID to replace |
| data | <code>Object</code> | row data with keys that you'd like to replace |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.replaceRow('XXXXXXXXXXXXXXXX', { FirstName: 'Foo' });
```
<a name="AirtablePlus+replaceWhere"></a>

### airtablePlus.replaceWhere(where, data, [config]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Performs a bulk replace based on a given search criteria. The criteria must be formatted in the valid 
Airtable formula syntax (see Airtable API docs).

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| where | <code>String</code> | filterByFormula string to filter table data by. |
| data | <code>Object</code> | Data to replace if where condition is met. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.replaceWhere('FirstName = "foo"', { FirstName: 'Bar' });
```
<a name="AirtablePlus+delete"></a>

### airtablePlus.delete(rowID, [config]) ⇒ <code>Promise.&lt;(Object\|Array.&lt;Object&gt;)&gt;</code>
Deletes a row in the provided table.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;(Object\|Array.&lt;Object&gt;)&gt;</code> - Record object or array of Record objects.  

| Param | Type | Description |
| --- | --- | --- |
| rowID | <code>String</code> \| <code>Array.&lt;String&gt;</code> | String or array of Airtable Row IDs to delete. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
// delete a single row
const res = await airtablePlus.delete('XXXXXXXXXXXXXXXX');

// delete multiple rows
const res = await airtablePlus.delete([
     'XXXXXXXXXXXXXXX1',
     'XXXXXXXXXXXXXXX2',
     'XXXXXXXXXXXXXXX3'
]);
```
<a name="AirtablePlus+deleteWhere"></a>

### airtablePlus.deleteWhere(where, [config]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Performs a bulk delete based on a search criteria. The criteria must be formatted in the valid Airtable 
formula syntax (see Airtable API docs)

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects.  

| Param | Type | Description |
| --- | --- | --- |
| where | <code>String</code> | filterByFormula string to filter table data by. |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.deleteWhere('FirstName = "foo"');
```
<a name="AirtablePlus+truncate"></a>

### airtablePlus.truncate([config]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Truncates a table.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects deleted.  

| Param | Type | Description |
| --- | --- | --- |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.truncate();
```
<a name="AirtablePlus+appendTable"></a>

### airtablePlus.appendTable(source, dest) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Reads all the values from one table and appends to another table. Allows for selective appending by 
sending optional fields and filters.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>Object</code> \| <code>String</code> | If string, source represents source table name. |
| [source.tableName] | <code>String</code> | Source table name. |
| [source.baseID] | <code>String</code> | Source base id. |
| [source.fields] | <code>String</code> | What fields to copy over to destination table, default is all fields. |
| [source.where] | <code>String</code> | Filter passed in to conditionally copy. |
| dest | <code>Object</code> \| <code>String</code> | If string, dest represents dest table name. |
| [dest.tableName] | <code>String</code> | Destination table name. |
| [dest.baseID] | <code>String</code> | Destination base id. |

**Example**  
```js
// appending to another table in the same base
const res = await airtablePlus.appendTable('Read', 'Write');

// allows for configuration of both source and dest
const res = await airtablePlus.appendTable({ tableName: 'Read', baseID: 'xxx' },  { tableName: 'Write' });
```
<a name="AirtablePlus+overwriteTable"></a>

### airtablePlus.overwriteTable(source, dest) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Copies/Overwrites one table into another. The source table will have all rows deleted prior to having 
the source rows inserted.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects.  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>Object</code> \| <code>String</code> | If string, source represents source table name. |
| [source.tableName] | <code>String</code> | Source table name. |
| [source.baseID] | <code>String</code> | Source base id. |
| [source.fields] | <code>String</code> | What fields to copy over to destination table. |
| [source.where] | <code>String</code> | Filter passed in to conditionally copy. |
| dest | <code>Object</code> \| <code>String</code> | If string, dest represents dest table name. |
| [dest.tableName] | <code>String</code> | Destination table name. |
| [dest.baseID] | <code>String</code> | Destination base id. |
| [dest.concurrency] | <code>String</code> | Destination concurrency when creating new values. |

**Example**  
```js
// overwriting table in the same base
const res = await airtablePlus.overwriteTable('Read', 'Write');

// allows for configuration of both source and dest
const res = await airtablePlus.overwriteTable({ tableName: 'Read', baseID: 'xxx' },  { tableName: 'Write' })
```
<a name="AirtablePlus+upsert"></a>

### airtablePlus.upsert(key, data, [config]) ⇒ <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code>
Attempts to upsert based on passed in primary key. Inserts if a new entry or updates if entry is 
already found.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise.&lt;Array.&lt;Object&gt;&gt;</code> - Array of record objects updated/created.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | Primary key to compare value in passed in data object with dest row |
| data | <code>Object</code> | Updated data |
| [config] | <code>Object</code> | Optional configuration to override options passed into the constructor. |

**Example**  
```js
const res = await airtablePlus.upsert('primaryKey', data);
```

MIT © Victor Hahn