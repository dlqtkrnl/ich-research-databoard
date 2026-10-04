// Golden check of the gate results reported in the paper (Table 2): the bundled manifests are loaded
// exactly as the browser loads them, and the gate is computed for every shipped dataset.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const app = require("./env-shim");
const { t } = require("../src/i18n.js");

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "src", "data", "manifest_bundle.js"), "utf8"), sandbox);
global.window.JXICH_MANIFESTS = sandbox.window.JXICH_MANIFESTS;

const EXPECTED = {
  "JXICH-XB-001": ["blocked", "gate.reason.noAuthentic"],
  "PUB-DTD-001": ["blocked", "gate.reason.noAuthentic"],
  "PUB-FASHIONPEDIA-002": ["blocked", "gate.reason.noAuthentic"],
  "PUB-DEEPFASHION2-004": ["blocked", "gate.reason.noAuthentic"],
  "JXICH-XBEMB-KG-P12": ["conditional", "gate.reason.sensitiveReview"],
  "PUB-CHNDM-HEMP-JP-009": ["pass", "gate.reason.pass"],
};

test("the bundled datasets produce the gate results reported in Table 2", () => {
  const state = app.replaceState(app.createInitialState());
  assert.deepEqual(state.datasets.map((dataset) => dataset.id).sort(), Object.keys(EXPECTED).sort());
  for (const [id, [gate, reasonKey]] of Object.entries(EXPECTED)) {
    const result = app.rightsGate(app.rightsFor(id));
    assert.equal(result.gate, gate, id);
    assert.equal(result.reason, t(reasonKey), id);
  }
  assert.equal(app.generationGate(app.findDataset("JXICH-XBEMB-KG-P12")).state, "blocked");
  assert.equal(app.validateSampleLeakage().pass, true);
});

test("splitting the bundled photographs of one Cooper Hewitt object across train and eval is caught", () => {
  // Six of the eight shipped images show horse cover 2001-2-1; putting three of them in evaluation shares the
  // object, its duplicate group and the digitization event and session with the training images.
  const state = app.replaceState(app.createInitialState());
  const photos = state.samples.filter((sample) => sample.object_id === "CHNDM-2001-2-1");
  assert.equal(photos.length, 6);
  const moved = new Set(photos.slice(3).map((sample) => sample.sample_id));
  const result = app.sampleLeakage(state.samples.map((sample) => (moved.has(sample.sample_id) ? { ...sample, split: "eval" } : sample)));
  assert.equal(result.pass, false);
  for (const key of ["object_id:CHNDM-2001-2-1", "duplicate_group_id:dup-chndm-2001-2-1", "event_id:CHNDM-SI-OPENACCESS-DIGITIZATION", "capture_session_id:CHNDM-SI-OPENACCESS-2026"]) {
    assert.ok(result.violations.includes(key), key);
  }
  assert.equal(result.violations.length, 4);
});

test("17 evidence records ship with the release, 12 of them authentic", () => {
  const state = app.replaceState(app.createInitialState());
  assert.equal(state.evidenceFiles.length, 17);
  assert.equal(state.evidenceFiles.filter((file) => file.verification_status === "verified" && file.source_file_present === true).length, 12);
});

// A dataset checksum is the SHA-256 of its file-backed content digests, sorted, one "sha256:<hex>" per line.
test("dataset checksums of the file-backed datasets follow the documented definition", () => {
  const crypto = require("node:crypto");
  const state = app.replaceState(app.createInitialState());
  for (const id of ["JXICH-XBEMB-KG-P12", "PUB-CHNDM-HEMP-JP-009"]) {
    const digests = state.evidenceFiles.filter((file) => file.dataset_id === id && file.evidence_role === "content" && file.source_file_present === true).map((file) => file.sha256).sort();
    const expected = "sha256:" + crypto.createHash("sha256").update(digests.map((digest) => `${digest}\n`).join("")).digest("hex");
    assert.equal(app.findDataset(id).checksum, expected, id);
  }
});
