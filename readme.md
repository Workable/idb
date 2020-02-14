# idb

A simple cache mechanisms that is based on IndexDB.

## Installing

Using npm:

```
$ npm install @workablehr/idb
```

## Basic usage

```javascript
import makeIDB from "@workablehr/idb";

const idb = makeIDB("workable-store");
idb.get("myKey", { fetch: performFetch, maxAge: 100 });
// if 'myKey' does not exists, it fetches and stores the result for 100 seconds
```

## API

```javascript
import makeIDB from "@workablehr/idb";
const { store, set, get, clear, del } = makeIDB("workable-store");
```

All the actions are namespaced by the store name.

### set (key, value)

Sets the an entry in the indexed db

### get (key, {fetch, maxAge})

Gets a value from the indexed db.
If the value does not exists, it calls the `fetch` function and stores the
result for `maxAge` period.

### clear

Clears all the entries that are owned by the `workable-store`

### del (key)

Deletes a specific entry in the index db.
