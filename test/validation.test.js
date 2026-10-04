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
    evidenceFiles: [{ dataset_id: "DS-1", evidence_role: "rights", verification_status: "verified", sha256: "sha256:abc", source_file_present: true, permission_scope: ["research", "publication"] }],
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

const AUTHENTIC_PUB = { dataset_id: "DS-1", evidence_file_id: "DOC-1", evidence_type: "license_page", evidence_role: "rights", verification_status: "verified", sha256: "sha256:abc", source_file_present: true, permission_scope: ["research", "publication"] };
const FULL_SCOPE = { research: true, publication: true, public_demo: true, derivative: false, commercial: false };
// Conditions that the gate treats as resolved; tests that are not about them spread this into the rights record.
const CLEAR = { consent_form_id: "not_applicable", expiry_date: "not_applicable", sensitive_culture_status: "not_applicable" };

test("rightsGate blocks when required consent has no authentic evidence file, and admits it once the consent file is present", () => {
  const rights = [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", consent_form_id: "CONSENT-1", permission_scope: FULL_SCOPE }];
  const pendingConsent = { dataset_id: "DS-1", evidence_file_id: "CONSENT-1", evidence_type: "inheritor_consent", evidence_role: "consent", verification_status: "pending", sha256: "sha256:pending", source_file_present: false, permission_scope: [] };
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
  const review = { dataset_id: "DS-1", evidence_file_id: "REVIEW-1", evidence_role: "sensitivity_review", verification_status: "verified", sha256: "sha256:rev", source_file_present: true, permission_scope: [] };
  app.replaceState(baseState({ rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", sensitive_culture_status: "reviewed_no_restriction", sensitive_culture_review: { reviewed_by: "curator", evidence_file_id: "REVIEW-1" }, permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB, review] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "pass");
});

test("a review status of reviewed_no_restriction clears step 8 only with the authentic review file it names", () => {
  const dataset = { id: "DS-1", reuse_layers: [] };
  const record = { ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", sensitive_culture_status: "reviewed_no_restriction", sensitive_culture_review: { reviewed_by: "curator", evidence_file_id: "REVIEW-1" }, permission_scope: FULL_SCOPE };
  const review = { dataset_id: "DS-1", evidence_file_id: "REVIEW-1", evidence_role: "sensitivity_review", verification_status: "verified", sha256: "sha256:rev", source_file_present: true, permission_scope: [] };
  const cases = [
    [[AUTHENTIC_PUB], "no review file"],
    [[AUTHENTIC_PUB, { ...review, source_file_present: false }], "placeholder review file"],
    [[AUTHENTIC_PUB, { ...review, evidence_role: "content" }], "file without the review role"],
    [[AUTHENTIC_PUB, { ...review, evidence_file_id: "REVIEW-2" }], "a review file the record does not name"],
  ];
  for (const [evidenceFiles, label] of cases) {
    app.replaceState(baseState({ datasets: [dataset], selectedId: "DS-1", generation: { settings: { mode: "text-to-image" }, runs: [] }, rights: [record], evidenceFiles }));
    assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "conditional", label);
    assert.equal(app.generationGate(app.findDataset("DS-1")).state, "blocked", label);
  }
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
  const derivativeRecord = [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", permission_scope: { ...FULL_SCOPE, derivative: true } }];
  app.replaceState(baseState({ datasets: [dataset], selectedId: "DS-1", generation: generation("image-to-image"), rights: derivativeRecord, evidenceFiles: [AUTHENTIC_PUB] }));
  assert.equal(app.generationGate(app.findDataset("DS-1")).state, "blocked", "derivative granted in the record but not in the rights file");
  app.replaceState(baseState({ datasets: [dataset], selectedId: "DS-1", generation: generation("image-to-image"), rights: derivativeRecord, evidenceFiles: [{ ...AUTHENTIC_PUB, permission_scope: ["research", "publication", "derivative"] }] }));
  assert.notEqual(app.generationGate(app.findDataset("DS-1")).state, "blocked");
});

test("an imported package cannot assert unregistered source files or lift a curator's block", () => {
  const bundled = [{ evidence_file_id: "E-1", dataset_id: "DS-1", sha256: "sha256:aaa", source_file_present: true, evidence_role: "content", permission_scope: [] }];
  const imported = app.reconcileImportedEvidence(bundled, [
    { evidence_file_id: "E-1", dataset_id: "DS-1", sha256: "sha256:aaa", source_file_present: true, evidence_role: "rights", permission_scope: ["publication"] },
    { evidence_file_id: "E-1", dataset_id: "DS-1", sha256: "sha256:bbb", source_file_present: true },
    { evidence_file_id: "E-2", dataset_id: "DS-1", sha256: "sha256:ccc", source_file_present: true },
  ]);
  assert.deepEqual(imported.map((file) => file.source_file_present), [true, false, false]);
  assert.equal(imported[0].evidence_role, "content", "role and scope come from the bundled record");
  assert.deepEqual(imported[0].permission_scope, []);
  const rights = app.reconcileImportedRights([{ dataset_id: "DS-1", rights_gate: "blocked" }], [{ dataset_id: "DS-1", rights_gate: "pass" }, { dataset_id: "DS-2", rights_gate: "pass" }]);
  assert.deepEqual(rights.map((record) => record.rights_gate), ["blocked", "pass"]);
});

test("import cannot turn on a placeholder's file flag, move a known file to another dataset, or lift a bundled block in two steps", () => {
  const bundled = [
    { evidence_file_id: "PH-1", dataset_id: "DS-1", sha256: "sha256:ph", source_file_present: false, evidence_role: "rights", permission_scope: ["research"] },
    { evidence_file_id: "IMG-1", dataset_id: "DS-2", sha256: "sha256:img", source_file_present: true, evidence_role: "content", permission_scope: [] },
  ];
  const [flipped, moved] = app.reconcileImportedEvidence(bundled, [
    { ...bundled[0], source_file_present: true },
    { ...bundled[1], dataset_id: "DS-1", evidence_role: "rights", permission_scope: ["publication"] },
  ]);
  assert.equal(flipped.source_file_present, false);
  assert.equal(moved.source_file_present, false);
  assert.notEqual(moved.evidence_role, "rights");
  const bundledRights = [{ dataset_id: "DS-1", rights_gate: "blocked" }];
  const afterFirst = app.reconcileImportedRights([...bundledRights, { dataset_id: "DS-1", rights_gate: "blocked" }], []);
  const afterSecond = app.reconcileImportedRights([...bundledRights, ...afterFirst], [{ dataset_id: "DS-1", rights_gate: "pass" }]);
  assert.equal(afterSecond[0].rights_gate, "blocked");
});

test("import may narrow a bundled dataset's scope but not widen it, and cannot change its consent, expiry or sensitivity", () => {
  const bundled = [{ dataset_id: "DS-1", rights_gate: "pending_review", consent_form_id: "CONSENT-1", expiry_date: "2027-07-01", sensitive_culture_status: "review_required", permission_scope: { research: true, publication: false, derivative: false } }];
  const [record] = app.reconcileImportedRights(bundled, [{ dataset_id: "DS-1", rights_gate: "pending_review", consent_form_id: "not_applicable", expiry_date: "not_applicable", sensitive_culture_status: "reviewed_no_restriction", permission_scope: { research: false, publication: true, derivative: true } }], bundled);
  assert.deepEqual(record.permission_scope, { research: false, publication: false, derivative: false });
  assert.equal(record.consent_form_id, "CONSENT-1");
  assert.equal(record.expiry_date, "2027-07-01");
  assert.equal(record.sensitive_culture_status, "review_required");
  const [other] = app.reconcileImportedRights(bundled, [{ dataset_id: "DS-NEW", consent_form_id: "not_applicable", permission_scope: { research: true } }], bundled);
  assert.equal(other.consent_form_id, "not_applicable", "a dataset that is not in the bundle is taken as imported");
});

test("a content file cannot supply the publication scope: only evidence with the rights role counts at step 7", () => {
  const researchOnly = { ...AUTHENTIC_PUB, permission_scope: ["research"] };
  const content = { ...AUTHENTIC_PUB, evidence_file_id: "IMG-1", evidence_role: "content" };
  app.replaceState(baseState({ rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", permission_scope: FULL_SCOPE }], evidenceFiles: [researchOnly, content] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "conditional");
});

test("step 2 needs an authentic rights file, and research must be listed in it as well as granted in the record", () => {
  const rights = [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", permission_scope: FULL_SCOPE }];
  app.replaceState(baseState({ rights, evidenceFiles: [{ ...AUTHENTIC_PUB, evidence_role: "content" }] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked", "a content file alone does not open the gate");
  app.replaceState(baseState({ rights, evidenceFiles: [{ ...AUTHENTIC_PUB, permission_scope: ["publication"] }] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked", "research granted in the record but not in the rights file");
});

test("consent is satisfied only by a file with the consent role, not by a rights file that happens to carry the id", () => {
  const rights = [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", consent_form_id: "DOC-1", permission_scope: FULL_SCOPE }];
  app.replaceState(baseState({ rights, evidenceFiles: [AUTHENTIC_PUB] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked");
});

test("only the listed no-expiry, no-consent and cleared-sensitivity values are exempt", () => {
  assert.equal(app.expiryStatus("not_applicable_whatever"), "unresolved");
  app.replaceState(baseState({ rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", consent_form_id: "not_applicable_trust_me", permission_scope: FULL_SCOPE }], evidenceFiles: [AUTHENTIC_PUB] }));
  assert.equal(app.rightsGate(app.rightsFor("DS-1")).gate, "blocked");
  assert.equal(app.sensitivityCleared({ sensitive_culture_status: "not_applicable_foreign_public_museum_collection" }), false);
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

test("moving a dataset to another split is refused, audited and left unchanged when it would create leakage", () => {
  global.window.alert = () => {};
  const samples = [
    { dataset_id: "DS-1", object_id: "OBJ-1", event_id: "E1", capture_session_id: "C1", split: "train" },
    { dataset_id: "DS-2", object_id: "OBJ-1", event_id: "E2", capture_session_id: "C2", split: "eval" },
  ];
  app.replaceState(baseState({
    rights: [{ ...CLEAR, dataset_id: "DS-2", rights_gate: "conditional", permission_scope: FULL_SCOPE }],
    evidenceFiles: [{ ...AUTHENTIC_PUB, dataset_id: "DS-2" }],
    splits: [{ dataset_id: "DS-2", split: "eval", locked: false }],
    samples,
  }));
  assert.equal(app.validateSampleLeakage().pass, false, "fixture starts with one shared object");
  app.replaceState({ ...app.getState(), samples: [samples[0], { ...samples[1], split: "holdout" }], splits: [{ dataset_id: "DS-2", split: "holdout", locked: false }] });
  app.setSplit("DS-2", "eval");
  const state = app.getState();
  assert.equal(app.splitFor("DS-2").split, "holdout");
  assert.equal(state.samples[1].split, "holdout");
  assert.equal(state.auditLog[0].action, "split_change_rejected");
  assert.equal(app.sampleLeakage(state.samples.map((sample) => (sample.dataset_id === "DS-2" ? { ...sample, split: "train" } : sample))).pass, true);
});

test("only leakage that a move adds blocks it: earlier leakage neither blocks unrelated moves nor a move that removes it", () => {
  const samples = [
    { dataset_id: "A", object_id: "OBJ-1", split: "train" },
    { dataset_id: "B", object_id: "OBJ-1", split: "eval" },
    { dataset_id: "C", object_id: "OBJ-9", split: "holdout" },
  ];
  assert.deepEqual(app.splitMove(samples, "C", "train").added, []);
  assert.deepEqual(app.splitMove(samples, "B", "holdout").added, []);
  assert.equal(app.sampleLeakage(app.splitMove(samples, "B", "holdout").samples).pass, true);
  assert.deepEqual(app.splitMove([...samples, { dataset_id: "D", object_id: "OBJ-9", split: "eval" }], "C", "train").added, ["object_id:OBJ-9"]);
});

test("import cannot clear step 8: a forged review file is not authentic and a bundled review pointer is restored", () => {
  const bundledEvidence = [{ evidence_file_id: "REVIEW-1", dataset_id: "DS-1", sha256: "sha256:rev", source_file_present: true, evidence_role: "sensitivity_review", verification_status: "verified", permission_scope: [] }];
  const [forged] = app.reconcileImportedEvidence(bundledEvidence, [{ evidence_file_id: "REVIEW-X", dataset_id: "DS-2", sha256: "sha256:fake", source_file_present: true, evidence_role: "sensitivity_review", verification_status: "verified" }]);
  assert.equal(forged.source_file_present, false);
  const bundledRights = [{ dataset_id: "DS-1", sensitive_culture_status: "review_required", permission_scope: FULL_SCOPE }];
  const [record] = app.reconcileImportedRights(bundledRights, [{ dataset_id: "DS-1", sensitive_culture_status: "reviewed_no_restriction", sensitive_culture_review: { evidence_file_id: "REVIEW-1" }, permission_scope: FULL_SCOPE }], bundledRights);
  assert.equal(record.sensitive_culture_status, "review_required");
  assert.equal("sensitive_culture_review" in record, false);
});

test("review entries may be an object or an array; null and non-object entries are ignored", () => {
  const review = { dataset_id: "DS-1", evidence_file_id: "REVIEW-1", evidence_role: "sensitivity_review", verification_status: "verified", sha256: "sha256:rev", source_file_present: true };
  const base = { dataset_id: "DS-1", sensitive_culture_status: "reviewed_no_restriction" };
  assert.equal(app.sensitivityCleared({ ...base, sensitive_culture_review: [null, "x", 3, { evidence_file_id: "REVIEW-1" }] }, [review]), true);
  assert.equal(app.sensitivityCleared({ ...base, sensitive_culture_review: [null, "REVIEW-1"] }, [review]), false);
  assert.equal(app.sensitivityCleared({ ...base, sensitive_culture_review: null }, [review]), false);
  assert.equal(app.sensitivityCleared({ ...base }, [review]), false);
});

test("a dataset whose sample rows already span several splits is not moved, so a per-sample split is kept", () => {
  const samples = [
    { dataset_id: "DTD", object_id: "T-1", split: "train" },
    { dataset_id: "DTD", object_id: "E-1", split: "eval" },
    { dataset_id: "OTHER", object_id: "O-1", split: "holdout" },
  ];
  const move = app.splitMove(samples, "DTD", "train");
  assert.deepEqual(move.mixed, ["eval", "train"]);
  assert.deepEqual(move.samples.map((sample) => sample.split), ["train", "eval", "holdout"]);
  assert.deepEqual(app.splitMove(samples, "OTHER", "train").mixed, []);
});

test("an imported package with leaking samples is rejected, and blocked train/eval datasets are moved to holdout with their samples", () => {
  const leaking = { dataset_manifest: { datasets: [] }, sample_manifest: { samples: [{ dataset_id: "A", object_id: "OBJ-1", split: "train" }, { dataset_id: "B", object_id: "OBJ-1", split: "eval" }] } };
  const check = app.validateImportedPackage(leaking);
  assert.equal(check.pass, false);
  assert.match(check.failures.join(" "), /object_id:OBJ-1/);
  const result = app.reconcileImportedSplits(
    [{ dataset_id: "A", split: "eval", locked: true }, { dataset_id: "B", split: "train" }],
    [{ dataset_id: "A", object_id: "OBJ-2", split: "eval" }, { dataset_id: "B", object_id: "OBJ-3", split: "train" }],
    (id) => id === "A",
  );
  assert.deepEqual(result.demoted, ["A"]);
  assert.deepEqual(result.assignments.map((item) => [item.split, Boolean(item.locked)]), [["holdout", false], ["train", false]]);
  assert.deepEqual(result.samples.map((sample) => sample.split), ["holdout", "train"]);
});

test("a blocked dataset is blocked on every reuse layer, and validateEvidence counts only authentic evidence", () => {
  app.replaceState(baseState({
    datasets: [{ id: "DS-1", reuse_layers: ["appearance", "rights"] }],
    rights: [{ ...CLEAR, dataset_id: "DS-1", rights_gate: "conditional", permission_scope: FULL_SCOPE }],
    evidenceFiles: [{ ...AUTHENTIC_PUB, source_file_present: false }],
    splits: [{ dataset_id: "DS-1", split: "train", locked: false }],
  }));
  for (const layer of ["appearance", "rights", "history", "semantic", "inheritor"]) {
    assert.equal(app.reuseGateState(layer, app.findDataset("DS-1")).state, "blocked", layer);
  }
  assert.match(app.validateEvidence().detail, /DS-1: no authentic evidence/);
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
