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
Creates an Airtable api object. Additional parameters can be set to the global configuration
object each method uses on subsequent calls. The instance will default to environment
variables for apiKey, baseID, and tableName if not passed into configuration object.

**Kind**: global class  

* [AirtablePlus](#AirtablePlus)
    * [new AirtablePlus(config)](#new_AirtablePlus_new)
    * [.create(data, [config])](#AirtablePlus+create) ⇒ <code>Promise</code>
    * [.read([params], [config])](#AirtablePlus+read) ⇒ <code>Promise</code>
    * [.find(rowID, [config])](#AirtablePlus+find) ⇒ <code>Promise</code>
    * [.update(rowID, data, [config])](#AirtablePlus+update) ⇒ <code>Promise</code>
    * [.updateWhere(where, data, [config])](#AirtablePlus+updateWhere) ⇒ <code>Promise</code>
    * [.replace(rowID, data, [config])](#AirtablePlus+replace) ⇒ <code>Promise</code>
    * [.replaceWhere(where, data, [config])](#AirtablePlus+replaceWhere) ⇒ <code>Promise</code>
    * [.delete(rowID, data, [config])](#AirtablePlus+delete) ⇒ <code>Promise</code>
    * [.deleteWhere(where, data, [config])](#AirtablePlus+deleteWhere) ⇒ <code>Promise</code>
    * [.truncate(config)](#AirtablePlus+truncate) ⇒ <code>Promise</code>
    * [.appendTable(source, dest)](#AirtablePlus+appendTable) ⇒ <code>Promise</code>
    * [.overwriteTable(source, dest)](#AirtablePlus+overwriteTable) ⇒ <code>Promise</code>
    * [.upsert(key, data, [config])](#AirtablePlus+upsert) ⇒ <code>Promise</code>

<a name="new_AirtablePlus_new"></a>

### new AirtablePlus(config)

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuration object |
| [config.apiKey] | <code>string</code> | Airtable API key |
| [config.baseID] | <code>string</code> | Airtable base ID |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.camelCase] | <code>string</code> | Converts column name object keys to camel case in JSON response |
| [config.concurrency] | <code>string</code> | Sets concurrency for async iteration functions |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.transform] | <code>function</code> | Optional global transform function for reads |

**Example**  
```js
//common usage
const inst = new AirtablePlus({
 baseID: 'xxx',
 tableName: 'Table 1'
});

// instantiating with all optional parameters set to their defaults
const inst = new AirtablePlus({
 apiKey: process.env.AIRTABLE_API_KEY,
 baseID: process.env.AIRTABLE_BASE_ID,
 tableName: process.env.AIRTABLE_TABLE_NAME,
 camelCase: false,
 complex: false,
 transform: undefined // optional function to modify records on read
});
```
<a name="AirtablePlus+create"></a>

### airtablePlus.create(data, [config]) ⇒ <code>Promise</code>
Creates a new row using the supplied data object as row values.
The object must contain valid keys that correspond to the name and
data type of the Airtable table schema being written into, else it will
throw an error.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Created Record Object  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Create data object |
| [config] | <code>Object</code> | Optional configuration override |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.baseID] | <code>string</code> | Airtable base id |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |

**Example**  
```js
const res = await inst.create({ firstName: 'foo' });
```
<a name="AirtablePlus+read"></a>

### airtablePlus.read([params], [config]) ⇒ <code>Promise</code>
Read all data from a table. Can be passed api options
for filtering and sorting (see Airtable API docs).
An optional transform function can be passed in to manipulate
the rows as they are being read in.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| [params] | <code>Object</code> \| <code>string</code> | If string: sets Airtable table name, If object: Airtable api parameters |
| [params.filterByFormula] | <code>string</code> | Airtable API parameter filterByFormula |
| [params.maxRecords] | <code>number</code> | Airtable API parameter maxRecords |
| [params.pageSize] | <code>number</code> | Airtable API parameter pageSize |
| [params.sort] | <code>Array.&lt;Object&gt;</code> | Airtable API parameter sort [{field: 'name, direction: 'asc'}] |
| [params.view] | <code>string</code> | Airtable API parameter view to set view ID |
| [params.cellFormat] | <code>string</code> | Airtable API parameter cellFormat |
| [params.timeZone] | <code>string</code> | Airtable API parameter timeZone |
| [params.userLocale] | <code>string</code> | Airtable API parameter userLocale |
| [config] | <code>Object</code> | Optional configuration override |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.camelCase] | <code>string</code> | Converts column name object keys to camel case in JSON response |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.transform] | <code>function</code> | Optional global transform function for reads |
| [config.base] | <code>function</code> | Airtable sdk base instance |

**Example**  
```js
// standard usage
const res = await inst.read();

// takes airtable api options
const res = await inst.read({ maxRecords: 1 });
```
<a name="AirtablePlus+find"></a>

### airtablePlus.find(rowID, [config]) ⇒ <code>Promise</code>
Get data for a specific row on Airtable

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Record object  

| Param | Type | Description |
| --- | --- | --- |
| rowID | <code>string</code> | Airtable Row ID to query data from |
| [config] | <code>Object</code> | Optional config override |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.base] | <code>function</code> | Airtable sdk base instance |

**Example**  
```js
const res = await inst.find('1234');
```
<a name="AirtablePlus+update"></a>

### airtablePlus.update(rowID, data, [config]) ⇒ <code>Promise</code>
Updates a row in Airtable. Unlike the replace method anything
not passed into the update data object still will be retained.
You must send in an object with the keys in the same casing
as the Airtable table columns (even when using camelCase=true in config)

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| rowID | <code>string</code> | Airtable Row ID to update |
| data | <code>Object</code> | row data with keys that you'd like to update |
| [config] | <code>Object</code> | Optional config override |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.base] | <code>function</code> | Airtable sdk base instance |

**Example**  
```js
const res = await inst.update('1234', { firstName: 'foobar' });
```
<a name="AirtablePlus+updateWhere"></a>

### airtablePlus.updateWhere(where, data, [config]) ⇒ <code>Promise</code>
Performs a bulk update based on a search criteria. The criteria must
be formatted in the valid Airtable formula syntax (see Airtable API docs)

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| where | <code>string</code> | filterByFormula string to filter table data by |
| data | <code>Object</code> | Data to update if where condition is met |
| [config] | <code>Object</code> | Optional configuration override |
| [config.baseID] | <code>string</code> | Airtable base ID |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.camelCase] | <code>string</code> | Converts column name object keys to camel case in JSON response |
| [config.concurrency] | <code>string</code> | Sets concurrency for async iteration functions |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.transform] | <code>function</code> | Optional global transform function for reads |

**Example**  
```js
const res = await inst.updateWhere('firstName = "foo"', { firstName: 'fooBar' });
```
<a name="AirtablePlus+replace"></a>

### airtablePlus.replace(rowID, data, [config]) ⇒ <code>Promise</code>
Replaces a given row in airtable. Similar to the update function,
the only difference is this will completely overwrite the row. 
Any cells not passed in will be deleted from source row.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Record object  

| Param | Type | Description |
| --- | --- | --- |
| rowID | <code>string</code> | Airtable Row ID to replace |
| data | <code>Object</code> | row data with keys that you'd like to replace |
| [config] | <code>Object</code> | Optional config override |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.base] | <code>function</code> | Airtable sdk base instance |

**Example**  
```js
const res = await inst.replace('1234', { firstName: 'foobar' });
```
<a name="AirtablePlus+replaceWhere"></a>

### airtablePlus.replaceWhere(where, data, [config]) ⇒ <code>Promise</code>
Performs a bulk replace based on a given search criteria. The criteria must
be formatted in the valid Airtable formula syntax (see Airtable API docs)

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| where | <code>string</code> | filterByFormula string to filter table data by |
| data | <code>Object</code> | Data to replace if where condition is met |
| [config] | <code>Object</code> | Optional configuration override |
| [config.baseID] | <code>string</code> | Airtable base ID |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.camelCase] | <code>string</code> | Converts column name object keys to camel case in JSON response |
| [config.concurrency] | <code>string</code> | Sets concurrency for async iteration functions |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.transform] | <code>function</code> | Optional global transform function for reads |

**Example**  
```js
const res = await inst.replaceWhere('firstName = "foo"', { firstName: 'fooBar' });
```
<a name="AirtablePlus+delete"></a>

### airtablePlus.delete(rowID, data, [config]) ⇒ <code>Promise</code>
Deletes a row in the provided table

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Record object  

| Param | Type | Description |
| --- | --- | --- |
| rowID | <code>string</code> | Airtable Row ID to delete |
| data | <code>Object</code> | row data with keys that you'd like to delete |
| [config] | <code>Object</code> | Optional config override |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.base] | <code>function</code> | Airtable sdk base instance |

**Example**  
```js
const res = await inst.delete('1234');
```
<a name="AirtablePlus+deleteWhere"></a>

### airtablePlus.deleteWhere(where, data, [config]) ⇒ <code>Promise</code>
Performs a bulk delete based on a search criteria. The criteria must
be formatted in the valid Airtable formula syntax (see Airtable API docs)

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| where | <code>string</code> | filterByFormula string to filter table data by |
| data | <code>Object</code> | Data to delete if where condition is met |
| [config] | <code>Object</code> | Optional configuration override |
| [config.baseID] | <code>string</code> | Airtable base ID |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.camelCase] | <code>string</code> | Converts column name object keys to camel case in JSON response |
| [config.concurrency] | <code>string</code> | Sets concurrency for async iteration functions |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.transform] | <code>function</code> | Optional global transform function for reads |

**Example**  
```js
const res = await inst.deleteWhere('firstName = "foo"');
```
<a name="AirtablePlus+truncate"></a>

### airtablePlus.truncate(config) ⇒ <code>Promise</code>
Truncates a table specified in the configuration object

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | override configuration object |
| [config.tableName] | <code>string</code> | Airtable table name |

**Example**  
```js
const res = await inst.truncate();
```
<a name="AirtablePlus+appendTable"></a>

### airtablePlus.appendTable(source, dest) ⇒ <code>Promise</code>
Reads all the values from one table and appends to another table. Allows for
selective appending by sending optional fields and filters.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>Object</code> \| <code>string</code> | if string, source represents source table name |
| source.tableName | <code>string</code> | Source table name |
| [source.baseID] | <code>string</code> | Source base id |
| [source.fields] | <code>string</code> | What fields to copy over to destination table |
| [source.where] | <code>string</code> | Filter passed in to conditionally copy |
| dest | <code>Object</code> \| <code>string</code> | if string, dest represents dest table name |
| dest.tableName | <code>string</code> | Dest table name |
| [dest.baseID] | <code>string</code> | Dest base id |
| [dest.concurrency] | <code>string</code> | Dest concurrency when creating new values |

**Example**  
```js
// complex usage in the same base
const res = await inst.appendTable('Read', 'Write');

// allows for configuration of both source and dest
const res = await inst.appendTable({ tableName: 'Read', baseID: 'xxx' },  { tableName: 'Write' })
```
<a name="AirtablePlus+overwriteTable"></a>

### airtablePlus.overwriteTable(source, dest) ⇒ <code>Promise</code>
Copies/Overwrites one table into another. The source table will have all rows deleted
prior to having the source rows inserted.

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>Object</code> \| <code>string</code> | if string, source represents source table name |
| source.tableName | <code>string</code> | Source table name |
| [source.baseID] | <code>string</code> | Source base id |
| [source.fields] | <code>string</code> | What fields to copy over to destination table |
| [source.where] | <code>string</code> | Filter passed in to conditionally copy |
| dest | <code>Object</code> \| <code>string</code> | if string, dest represents dest table name |
| dest.tableName | <code>string</code> | Dest table name |
| [dest.baseID] | <code>string</code> | Dest base id |
| [dest.concurrency] | <code>string</code> | Dest concurrency when creating new values |

**Example**  
```js
// complex usage in the same base
const res = await inst.overwriteTable('Read', 'Write');

// allows for configuration of both source and dest
const res = await inst.overwriteTable({ tableName: 'Read', baseID: 'xxx' },  { tableName: 'Write' })
```
<a name="AirtablePlus+upsert"></a>

### airtablePlus.upsert(key, data, [config]) ⇒ <code>Promise</code>
Attempts to upsert based on passed in primary key.
Inserts if a new entry or updates if entry is already found

**Kind**: instance method of [<code>AirtablePlus</code>](#AirtablePlus)  
**Returns**: <code>Promise</code> - Array of record objects  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Primary key to compare value in passed in data object with dest row |
| data | <code>Object</code> | Updated data |
| [config] | <code>Object</code> | Optional config override |
| [config.tableName] | <code>string</code> | Airtable table name |
| [config.complex] | <code>boolean</code> | Flag to return full Airtable record object with helper methods attached |
| [config.baseID] | <code>string</code> | Airtable base id |

**Example**  
```js
const res = await inst.upsert('primarKeyID', data);
```

MIT © Victor Hahn