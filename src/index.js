import {
  get as indexDBGet,
  set as indexDBSet,
  Store,
  clear as indexDBClear,
  del as indexDBDelete
} from "idb-keyval";

const defaultCacheAge = 24 * 60 * 60;

const wrap = value => ({ value, timestamp: Date.now() });

/**
 * @description A simple cache mechanisms that is based on IndexDB.
 * @example
 * const { store, set, get, clear, del } = makeIDB("workable-store");
 *
 * idb.get("myKey", { fetch: performFetch, maxAge: 100 });
 * // if 'myKey' does not exists, it fetches and stores the result for 100 seconds
 */

export default name => {
  if (!name) {
    throw new Error("Please pass a name for the idb store");
  }

  const store = new Store(name, `${name}-cache`);

  const set = (key, value) => indexDBSet(key, wrap(value), store);

  const get = (key, { fetch, maxAge = defaultCacheAge } = {}) => {
    let fetchPromise;

    const getPromise = indexDBGet(key, store).then(datum => {
      const maxAgeInMs = maxAge * 1000;
      if (datum && datum.timestamp + maxAgeInMs > Date.now())
        return datum.value;

      fetchPromise = fetch();

      return fetchPromise.then(value => {
        set(key, value);
        return value;
      });
    });
    getPromise.abort = () => fetchPromise && fetchPromise.abort();

    return getPromise;
  };

  const clear = () => indexDBClear(store);

  const del = key => indexDBDelete(key, store);

  return {
    store,
    set,
    get,
    clear,
    del
  };
};
