// Tests for the opt-in Storage adapter added in app.js (see docs/persistence-design.md).
// These exercise the parts that don't require a live server process: the localStorage
// fallback path (which must behave identically to the pre-adapter code), and init()'s
// feature-detection against a mocked global fetch. A real server.mjs process is not
// started here — that would make this suite flaky/slow for no real coverage gain, since
// server.mjs's HTTP handlers are simple enough to have been verified manually (see
// docs/persistence-design.md) and the adapter's fallback behavior is what actually
// protects the no-build-step MVP promise.
const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("./env-shim");

function resetStorage() {
  app.Storage.serverAvailable = false;
  app.Storage.probed = false;
}

test("Storage.serverAvailable defaults to false (offline/localStorage-only until proven otherwise)", () => {
  resetStorage();
  assert.equal(app.Storage.serverAvailable, false);
});

test("Storage.set writes synchronously to localStorage, and Storage.get reads it back, with no server involved", async () => {
  resetStorage();
  const key = "jxich_test_storage_roundtrip";
  const value = { a: 1, nested: { b: [1, 2, 3] } };
  app.Storage.set(key, value);
  const got = await app.Storage.get(key);
  assert.deepEqual(got, value);
});

test("Storage.get returns null when nothing is stored and the server is unavailable", async () => {
  resetStorage();
  const got = await app.Storage.get("jxich_test_storage_missing_key");
  assert.equal(got, null);
});

test("Storage.init() leaves serverAvailable false when fetch throws (server not running / file:// origin)", async () => {
  resetStorage();
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error("network error: connection refused"); };
  try {
    const result = await app.Storage.init();
    assert.equal(result, false);
    assert.equal(app.Storage.serverAvailable, false);
    assert.equal(app.Storage.probed, true);
  } finally {
    global.fetch = originalFetch;
  }
});

test("Storage.init() sets serverAvailable true when /api/health responds ok", async () => {
  resetStorage();
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    assert.equal(url, "/api/health");
    return { ok: true };
  };
  try {
    const result = await app.Storage.init();
    assert.equal(result, true);
    assert.equal(app.Storage.serverAvailable, true);
  } finally {
    global.fetch = originalFetch;
  }
});

test("Storage.get prefers the server when available, and falls back to localStorage if the server read fails", async () => {
  resetStorage();
  const key = "jxich_test_storage_server_preference";
  app.Storage.set(key, { source: "local" }); // seeds the localStorage fallback value
  const originalFetch = global.fetch;

  app.Storage.serverAvailable = true;
  global.fetch = async () => ({ ok: true, json: async () => ({ source: "server" }) });
  try {
    const fromServer = await app.Storage.get(key);
    assert.deepEqual(fromServer, { source: "server" });
  } finally {
    global.fetch = originalFetch;
  }

  app.Storage.serverAvailable = true;
  global.fetch = async () => { throw new Error("server dropped mid-session"); };
  try {
    const fallback = await app.Storage.get(key);
    assert.deepEqual(fallback, { source: "local" });
    assert.equal(app.Storage.serverAvailable, false, "a failed server read should mark the server unavailable again");
  } finally {
    global.fetch = originalFetch;
  }
});

test("Storage.list falls back to jxich_-prefixed localStorage keys when the server is unavailable", async () => {
  resetStorage();
  app.Storage.set("jxich_test_storage_list_a", { x: 1 });
  const keys = await app.Storage.list();
  assert.ok(keys.includes("jxich_test_storage_list_a"));
  assert.ok(keys.every((key) => key.startsWith("jxich_")));
});
