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

test("16 evidence records ship with the release, 11 of them authentic", () => {
  const state = app.replaceState(app.createInitialState());
  assert.equal(state.evidenceFiles.length, 16);
  assert.equal(state.evidenceFiles.filter((file) => file.verification_status === "verified" && file.source_file_present === true).length, 11);
});
