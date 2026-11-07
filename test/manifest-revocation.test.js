// A revocation edited into the bundled rights manifest must take effect in a browser that already holds saved state
// from the same validation revision, where stored records otherwise take precedence over bundled ones.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const app = require("./env-shim");

function loadBundle() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "src", "data", "manifest_bundle.js"), "utf8"), sandbox);
  return sandbox.window.JXICH_MANIFESTS;
}

test("a block or narrowed scope in the bundled manifests overrides a more permissive record saved in the browser", () => {
  const bundle = loadBundle();
  const id = "PUB-CHNDM-HEMP-JP-009";
  // Saved state from before the revocation: the record as it was, permissive.
  global.window.JXICH_MANIFESTS = bundle;
  const before = app.createInitialState();
  const current = app.normalizeStoredState({}).validationRevision;
  const saved = JSON.parse(JSON.stringify({ ...before, validationRevision: current }));
  // The curator revokes in the manifests: research withdrawn and the record blocked.
  const revoked = JSON.parse(JSON.stringify(bundle));
  const record = revoked.rights_manifest.rights.find((r) => r.dataset_id === id);
  record.permission_scope.research = false;
  record.rights_gate = "blocked";
  global.window.JXICH_MANIFESTS = revoked;
  try {
    const migrated = app.normalizeStoredState(saved);
    const merged = migrated.rights.find((r) => r.dataset_id === id);
    assert.equal(merged.rights_gate, "blocked");
    assert.equal(merged.permission_scope.research, false);
    assert.equal(app.rightsGate(merged).gate, "blocked");
  } finally {
    global.window.JXICH_MANIFESTS = {};
  }
});
