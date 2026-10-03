// normalizeStoredState(): stored browser state normally takes precedence over the bundled
// manifests, so a validation-revision bump must replace stale stored records and restart
// the audit chain, while state saved under the current revision is kept.
const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("./env-shim");

const staleRights = [{ dataset_id: "DS-STALE", rights_gate: "conditional", permission_scope: { research: true } }];

test("state saved under an older validation revision is replaced by the bundled manifests", () => {
  const fresh = app.createInitialState();
  const migrated = app.normalizeStoredState({ validationRevision: "validated-20260703-sha256-chain", version: "old", rights: staleRights });
  assert.deepEqual(migrated.rights, fresh.rights);
  assert.equal(migrated.version, fresh.version);
  assert.equal(migrated.auditLog.length, 1);
  assert.equal(migrated.auditLog[0].action, "reset_audit_chain_for_revision");
});

test("state saved under the current validation revision is kept", () => {
  const current = app.normalizeStoredState({}).validationRevision;
  const migrated = app.normalizeStoredState({ validationRevision: current, rights: staleRights });
  assert.ok(migrated.rights.some((record) => record.dataset_id === "DS-STALE"));
});
