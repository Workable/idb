import { get as indexDBGet } from "idb-keyval";
import { jestMockTime } from "testHelpers";
import makeIDB from "./index";

let idb;
beforeEach(() => {
  idb = makeIDB("my-store");
});

describe("cache", () => {
  it("sets a value", async () => {
    jestMockTime();
    expect(await indexDBGet("myKey", store)).toBeUndefined();
    await idb.set("myKey", "myValue");
    expect(await indexDBGet("myKey", store)).toEqual({
      timestamp: 1000,
      value: "myValue"
    });
  });

  it("sets a value if not exist", async () => {
    jestMockTime();
    expect(await indexDBGet("myKey", store)).toBeUndefined();

    const fetchSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve("myValue"));
    const value = await idb.get("myKey", { fetch: fetchSpy, maxAge: 100 });

    expect(value).toBe("myValue");
    expect(fetchSpy).toBeCalledTimes(1);
    expect(await indexDBGet("myKey", store)).toEqual({
      timestamp: 1000,
      value: "myValue"
    });
  });

  it("gets the cached value if exists", async () => {
    const setTime = jestMockTime();
    expect(await indexDBGet("myKey", store)).toBeUndefined();

    const fetchSpy = jest.fn();
    await idb.set("myKey", "myValue");

    setTime(100);
    const value = await idb.get("myKey", { fetch: fetchSpy, maxAge: 1000 });

    expect(fetchSpy).not.toBeCalled();
    expect(value).toBe("myValue");
  });

  it("deletes the cached value", async () => {
    const setTime = jestMockTime();
    expect(await indexDBGet("myKey", store)).toBeUndefined();

    await idb.set("myKey", "myValue");

    setTime(100);
    expect(await indexDBGet("myKey", store)).toEqual({
      timestamp: 1000,
      value: "myValue"
    });
    await idb.del("myKey");

    expect(await indexDBGet("myKey", store)).toBeUndefined();
  });

  it("clears the cache", async () => {
    const setTime = jestMockTime();
    expect(await indexDBGet("myKey", store)).toBeUndefined();

    await idb.set("myKey", "myValue");

    setTime(100);
    expect(await indexDBGet("myKey", store)).toEqual({
      timestamp: 1000,
      value: "myValue"
    });
    await idb.clear();

    expect(await indexDBGet("myKey", store)).toBeUndefined();
  });

  it("fetches the value if expires", async () => {
    const setTime = jestMockTime();
    expect(await indexDBGet("myKey", store)).toBeUndefined();

    await idb.set("myKey", "myValue");

    setTime(1000 * 1000 + 1);
    const fetchSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve("myFetchedValue"));
    const value = await idb.get("myKey", { fetch: fetchSpy, maxAge: 1000 });

    expect(fetchSpy).toBeCalledTimes(1);
    expect(value).toBe("myFetchedValue");
    expect(await idb.get("myKey")).toBe("myFetchedValue");
  });

  it("expires by default and fetches new", async () => {
    const setTime = jestMockTime();

    await idb.set("myKey", "myValue");

    setTime(24 * 60 * 60 * 1000 + 1);
    const fetchSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve("myFetchedValue"));
    const value = await idb.get("myKey", { fetch: fetchSpy });

    expect(fetchSpy).toBeCalledTimes(1);
    expect(value).toBe("myFetchedValue");
  });

  it("doesn't fetch if doesn't expire for just a ms", async () => {
    const setTime = jestMockTime();
    expect(await indexDBGet("myKey", store)).toBeUndefined();

    await idb.set("myKey", "myValue");

    setTime(1000 * 1000 - 1);
    const fetchSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve("myFetchedValue"));
    const value = await idb.get("myKey", { fetch: fetchSpy, maxAge: 1000 });

    expect(fetchSpy).toBeCalledTimes(1);
    expect(value).toBe("myFetchedValue");
    expect(await idb.get("myKey")).toBe("myFetchedValue");
  });

  it("doesn't expire on default maxAge nor fetches new for just a ms", async () => {
    const setTime = jestMockTime();

    await idb.set("myKey", "myValue");

    setTime(24 * 60 * 60 * 1000 - 1);
    const fetchSpy = jest
      .fn()
      .mockImplementation(() => Promise.resolve("myFetchedValue"));
    const value = await idb.get("myKey", { fetch: fetchSpy });

    expect(fetchSpy).toBeCalledTimes(1);
    expect(value).toBe("myFetchedValue");
  });

  it("aborts the fetch process", async () => {
    const setTime = jestMockTime();
    expect(await indexDBGet("myKey", store)).toBeUndefined();

    await idb.set("myKey", "myValue");

    setTime(2000000);
    const abortPromise = jest.fn();
    const fetchSpy = jest.fn().mockImplementation(() => {
      const promise = Promise.resolve("myFetchedValue");
      promise.abort = abortPromise;
      return promise;
    });
    const promise = idb.get("myKey", { fetch: fetchSpy, maxAge: 1000 });
    await promise;
    promise.abort();

    expect(abortPromise).toBeCalledTimes(1);
  });
});
