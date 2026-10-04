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

test("a revision bump records the head of the discarded audit chain", () => {
  // Newest first, as the app stores it, with a malformed row that must be ignored.
  const old = [
    { sequence: 9, entry_hash: "not-a-hash", action: "corrupt" },
    { sequence: 2, entry_hash: "b".repeat(64), previous_hash: "a".repeat(64), action: "y" },
    { sequence: 1, entry_hash: "a".repeat(64), previous_hash: "GENESIS", action: "x" },
    null,
  ];
  const migrated = app.normalizeStoredState({ validationRevision: "validated-20260703-sha256-chain", auditLog: old });
  assert.equal(migrated.auditLog.length, 1);
  assert.equal(migrated.auditSequence, 1);
  assert.match(migrated.auditLog[0].detail, new RegExp(`ended at sequence 2 with entry hash ${"b".repeat(64)}`));
  assert.doesNotMatch(app.normalizeStoredState({ validationRevision: "old" }).auditLog[0].detail, /discarded chain/);
  app.replaceState(migrated);
  assert.equal(app.verifyAuditChain().pass, true);
});

test("state saved under the current validation revision is kept", () => {
  const current = app.normalizeStoredState({}).validationRevision;
  const migrated = app.normalizeStoredState({ validationRevision: current, rights: staleRights });
  assert.ok(migrated.rights.some((record) => record.dataset_id === "DS-STALE"));
});
