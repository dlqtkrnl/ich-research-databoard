const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const app = require("./env-shim");

function baseState(overrides = {}) {
  return {
    version: "test",
    splitPolicy: {},
    samplePolicy: {},
    datasets: [],
    rights: [],
    splits: [],
    kgClaims: [],
    evidenceFiles: [],
    samples: [],
    checksumFiles: [],
    board: [],
    selectedId: null,
    viewMode: "2d",
    auditLog: [],
    auditSequence: 0,
    generation: { settings: {}, runs: [] },
    ...overrides,
  };
}

test("chainHash produces a real, independently-verifiable SHA-256 digest", () => {
  const value = { a: 1, b: [1, 2, 3] };
  const got = app.chainHash(value);
  const expected = "sha256:" + crypto.createHash("sha256").update(app.stableStringify(value)).digest("hex");
  assert.equal(got, expected);
});

test("verifyAuditChain passes on an untampered chain and fails when an entry is tampered with", () => {
  const e1 = app.createAuditEntry("create_dataset", "DS-1", "first entry", "GENESIS", 1);
  const e2 = app.createAuditEntry("set_split", "DS-1", "second entry", e1.entry_hash, 2);
  app.replaceState(baseState({ auditLog: [e2, e1], auditSequence: 2 }));
  assert.equal(app.verifyAuditChain().pass, true);

  const tampered = { ...e1, detail: "attacker changed this after the hash was computed" };
  app.replaceState(baseState({ auditLog: [e2, tampered], auditSequence: 2 }));
  assert.equal(app.verifyAuditChain().pass, false);
});

test("rightsGate blocks a dataset with no verified evidence, even if permissions look complete", () => {
  app.replaceState(baseState({
    rights: [{
      dataset_id: "DS-1",
      rights_gate: "conditional",
      permission_scope: { research: true, publication: true, public_demo: true, derivative: false, commercial: false },
    }],
    evidenceFiles: [],
  }));
  const gate = app.rightsGate(app.rightsFor("DS-1"));
  assert.equal(gate.gate, "blocked");
});

test("rightsGate requires the research scope before anything else", () => {
  app.replaceState(baseState({
    rights: [{
      dataset_id: "DS-1",
      rights_gate: "conditional",
      permission_scope: { research: false, publication: true, public_demo: true, derivative: false, commercial: false },
    }],
    evidenceFiles: [{ dataset_id: "DS-1", verification_status: "verified", sha256: "sha256:abc", source_file_present: true, permission_scope: ["research", "publication"] }],
  }));
  const gate = app.rightsGate(app.rightsFor("DS-1"));
  assert.equal(gate.gate, "blocked");
});

test("rightsGate passes only when research+publication+public_demo scopes AND authentic publication evidence are present", () => {
  app.replaceState(baseState({
    rights: [{
      consent_form_id: "not_applicable", expiry_date: "not_applicable", sensitive_culture_status: "not_applicable",
      dataset_id: "DS-1",
      rights_gate: "conditional",
      permission_scope: { research: true, publication: true, public_demo: true, derivative: false, commercial: false },
    }],
    evidenceFiles: [{ dataset_id: "DS-1", verification_status: "verified", sha256: "sha256:abc", source_file_present: true, permission_scope: ["research", "publication"] }],
  }));
  const gate = app.rightsGate(app.rightsFor("DS-1"));
  assert.equal(gate.gate, "pass");
});

test("rightsGate blocks verified-but-placeholder evidence (source_file_present:false), even with complete permission scope", () => {
  app.replaceState(baseState({
    rights: [{
      dataset_id: "DS-1",
      rights_gate: "conditional",
      permission_scope: { research: true, publication: true, public_demo: true, derivative: false, commercial: false },
    }],
    evidenceFiles: [{ dataset_id: "DS-1", verification_status: "verified", sha256: "sha256:abc", source_file_present: false, permission_scope: ["research", "publication"] }],
  }));
  const gate = app.rightsGate(app.rightsFor("DS-1"));
  assert.equal(gate.gate, "blocked");
});

const AUTHENTIC_PUB = { dataset_id: "DS-1", evidence_file_id: "DOC-1", evidence_type: "license_page", verification_status: "verified", sha256: "sha256:abc", source_file_present: true, permission_scope: ["research", "publication"] };
const FULL_SCOPE = { research: true, publication: true, public_demo: true, derivative: false, commercial: false };
// Conditions that the gate treats as resolved; tests that are not about them spread this into the rights record.
const CLEAR = { consent_form_id: "not_applicable", expiry_date: "not_applicable", sensitive_culture_status: "not_applicable" };

test("rightsGate blocks when required consent has no authentic evidence file, and admits it once the consent file is present", () => {
  const rights = [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", consent_form_id: "CONSENT-1", permission_scope: FULL_SCOPE }];
  const pendingConsent = { dataset_id: "DS-1", evidence_file_id: "CONSENT-1", evidence_type: "inheritor_consent", verification_status: "pending", sha256: "sha256:pending", source_file_present: false, permission_scope: [] };
  app.replaceState(baseState({ rights, evidenceFiles: [AUTHENTIC_PUB, pendingConsent] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked");

  const presentConsent = { ...pendingConsent, verification_status: "verified", sha256: "sha256:def", source_file_present: true };
  app.replaceState(baseState({ rights, evidenceFiles: [AUTHENTIC_PUB, presentConsent] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "pass");
});

test("rightsGate blocks a rights record whose expiry date has passed", () => {
  app.replaceState(baseState({
    rights: [{ dataset_id: "DS-1", rights_gate: "conditional", consent_form_id: "not_applicable", expiry_date: "2000-01-01", permission_scope: FULL_SCOPE }],
    evidenceFiles: [AUTHENTIC_PUB],
  }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked");
  assert.equal(app.isExpired("2999-12-31"), false);
  assert.equal(app.isExpired("source_terms_dependent"), false);
});

test("rightsGate blocks an expiry date it cannot read instead of treating it as open-ended", () => {
  for (const expiry of ["pending", "source_terms_dependent", "2026-13-45", "2026-02-30", "", undefined]) {
    app.replaceState(baseState({ rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", expiry_date: expiry, permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB] }));
    assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked", `expiry ${expiry}`);
  }
  assert.equal(app.expiryStatus("not_applicable_cc0_no_expiry"), "none");
  assert.equal(app.expiryStatus("2999-12-31"), "valid");
});

test("consent is satisfied only by the authentic file named in consent_form_id, and a missing id blocks", () => {
  const refused = { ...AUTHENTIC_PUB, evidence_file_id: "OTHER-1", evidence_type: "consent_refused", permission_scope: [] };
  app.replaceState(baseState({ rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", consent_form_id: "CONSENT-1", permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB, refused] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked");
  app.replaceState(baseState({ rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", consent_form_id: "", permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked");
});

test("a missing or unrecognised cultural-sensitivity status holds the dataset at conditional; a recorded review clears it", () => {
  for (const status of [undefined, "", "pending", "not_assessed"]) {
    app.replaceState(baseState({ rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", sensitive_culture_status: status, permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB] }));
    assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "conditional", `status ${status}`);
  }
  app.replaceState(baseState({ rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", sensitive_culture_status: "reviewed_no_restriction", permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "pass");
});

test("generation is refused without derivative permission for image-to-image, and while a sensitivity review is pending", () => {
  const dataset = { id: "DS-1", reuse_layers: [] };
  const generation = (mode) => ({ settings: { mode }, runs: [] });
  app.replaceState(baseState({ datasets: [dataset], selectedId: "DS-1", generation: generation("image-to-image"), rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB] }));
  assert.equal(app.generationGate(app.findDataset("DS-1")).state, "blocked");
  app.replaceState(baseState({ datasets: [dataset], selectedId: "DS-1", generation: generation("text-to-image"), rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", sensitive_culture_status: "review_required", permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB] }));
  assert.equal(app.generationGate(app.findDataset("DS-1")).state, "blocked");
  app.replaceState(baseState({ datasets: [dataset], selectedId: "DS-1", generation: generation("text-to-image"), rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB] }));
  assert.equal(app.generationGate(app.findDataset("DS-1")).state, "pass");
});

test("an imported package cannot assert unregistered source files or lift a curator's block", () => {
  const current = [{ evidence_file_id: "E-1", sha256: "sha256:aaa", source_file_present: true }];
  const imported = app.reconcileImportedEvidence(current, [
    { evidence_file_id: "E-1", sha256: "sha256:aaa", source_file_present: true },
    { evidence_file_id: "E-1", sha256: "sha256:bbb", source_file_present: true },
    { evidence_file_id: "E-2", sha256: "sha256:ccc", source_file_present: true },
  ]);
  assert.deepEqual(imported.map((file) => file.source_file_present), [true, false, false]);
  const rights = app.reconcileImportedRights([{ dataset_id: "DS-1", rights_gate: "blocked" }], [{ dataset_id: "DS-1", rights_gate: "pass" }, { dataset_id: "DS-2", rights_gate: "pass" }]);
  assert.deepEqual(rights.map((record) => record.rights_gate), ["blocked", "pass"]);
});

test("rightsGate caps a dataset under cultural-sensitivity review at conditional", () => {
  app.replaceState(baseState({
    rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", sensitive_culture_status: "review_required", permission_scope: FULL_SCOPE }],
    evidenceFiles: [AUTHENTIC_PUB],
  }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "conditional");
});

test("a permission toggle never lifts an explicit blocked status recorded by the curator", () => {
  app.replaceState(baseState({
    rights: [{ dataset_id: "DS-1", rights_gate: "blocked", consent_form_id: "not_applicable", permission_scope: { ...FULL_SCOPE, research: false } }],
    evidenceFiles: [AUTHENTIC_PUB],
  }));
  const record = app.rightsFor("DS-1");
  app.applyPermissionToggle(record, "research", true);
  assert.equal(record.rights_gate, "blocked");
  assert.equal(app.rightsGate(record).gate, "blocked");
});

test("validateSampleLeakage flags an object_id that appears in both train and eval", () => {
  app.replaceState(baseState({
    samples: [
      { object_id: "OBJ-1", event_id: "E1", capture_session_id: "C1", split: "train" },
      { object_id: "OBJ-1", event_id: "E1", capture_session_id: "C1", split: "eval" },
    ],
  }));
  const result = app.validateSampleLeakage();
  assert.equal(result.pass, false);
  assert.match(result.detail, /object_id:OBJ-1/);
});

test("validateSampleLeakage passes when train/eval/holdout share no split-unit keys", () => {
  app.replaceState(baseState({
    samples: [
      { object_id: "OBJ-1", event_id: "E1", capture_session_id: "C1", split: "train" },
      { object_id: "OBJ-2", event_id: "E2", capture_session_id: "C2", split: "eval" },
    ],
  }));
  assert.equal(app.validateSampleLeakage().pass, true);
});

test("validateSchema reports every dataset missing a required manifest field", () => {
  app.replaceState(baseState({
    datasets: [{ id: "DS-1", name: "", source_url: "x", owner: "x", version: "x", checksum: "x", annotation_schema: "x", risk_level: "x", readiness: 0 }],
  }));
  const result = app.validateSchema();
  assert.equal(result.pass, false);
  assert.match(result.detail, /DS-1\.name/);
});

test("validateChecksumRegistry fails on an empty registry and on any pending hash", () => {
  app.replaceState(baseState({ checksumFiles: [] }));
  assert.equal(app.validateChecksumRegistry().pass, false);

  app.replaceState(baseState({ checksumFiles: [{ path: "x", sha256: "sha256:pending", bytes: 1 }] }));
  assert.equal(app.validateChecksumRegistry().pass, false);

  app.replaceState(baseState({ checksumFiles: [{ path: "x", sha256: "sha256:" + "a".repeat(64), bytes: 1 }] }));
  assert.equal(app.validateChecksumRegistry().pass, true);
});

test("authenticEvidenceFor excludes verified-but-placeholder evidence (no real file on disk)", () => {
  app.replaceState(baseState({
    evidenceFiles: [
      { dataset_id: "DS-1", verification_status: "verified", sha256: "sha256:abc", source_file_present: false },
      { dataset_id: "DS-1", verification_status: "verified", sha256: "sha256:def", source_file_present: true },
    ],
  }));
  assert.equal(app.verifiedEvidenceFor("DS-1").length, 2);
  assert.equal(app.authenticEvidenceFor("DS-1").length, 1);
});

test("validateEvidence surfaces the count of placeholder evidence records so the UI can't silently overclaim", () => {
  app.replaceState(baseState({
    splits: [],
    evidenceFiles: [
      { dataset_id: "DS-1", verification_status: "verified", sha256: "sha256:abc", source_file_present: false },
      { dataset_id: "DS-2", verification_status: "verified", sha256: "sha256:def", source_file_present: true },
    ],
  }));
  const result = app.validateEvidence();
  assert.match(result.detail, /1\/2 evidence records are placeholder\/demo entries/);
});
