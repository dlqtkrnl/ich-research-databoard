// Minimal browser-global shim so app.js (a plain <script> file, not a module) can be
// require()'d under Node's built-in test runner without pulling in a DOM dependency.
// Only the globals app.js touches at load time are stubbed; render()/DOM-mutating
// functions are intentionally out of scope here — see test/validation.test.js.

// Stored keys live as ordinary (enumerable) own properties directly on the localStorage
// object itself, with getItem/setItem/removeItem defined non-enumerable — this mirrors
// real browser Storage objects, where Object.keys(localStorage) returns the stored keys.
// That's relied on by test/storage-adapter.test.js's Storage.list() localStorage fallback.
const localStorageShim = {};
Object.defineProperties(localStorageShim, {
  getItem: { value: (key) => (Object.prototype.hasOwnProperty.call(localStorageShim, key) ? localStorageShim[key] : null), enumerable: false },
  setItem: { value: (key, value) => { localStorageShim[key] = String(value); }, enumerable: false },
  removeItem: { value: (key) => { delete localStorageShim[key]; }, enumerable: false },
});
global.localStorage = localStorageShim;
global.window = {
  JXICH_MANIFESTS: {},
  addEventListener: () => {},
  location: { hash: "" },
};

module.exports = require("../src/app.js");
