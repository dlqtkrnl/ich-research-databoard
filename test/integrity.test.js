// Repository-integrity checks that shell out to the audit-layer scripts, so `npm test`
// fails if a canonical file's bytes drift from data/checksum_manifest.json, if
// data/manifest_bundle.js is stale relative to data/*.json, or if a KG claim breaks the
// controlled vocabulary.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.join(__dirname, "..");

function runScript(script, args = []) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], { cwd: root, encoding: "utf8" });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

test("every registered file matches its SHA-256 in checksum_manifest.json", () => {
  const { status, output } = runScript("hash_files.mjs", ["--verify"]);
  assert.equal(status, 0, output);
});

test("manifest_bundle.js is in sync with the canonical data/*.json files", () => {
  const { status, output } = runScript("build_manifest_bundle.mjs", ["--check"]);
  assert.equal(status, 0, output);
});

test("every evidence record flagged source_file_present has its file on disk with a matching SHA-256", () => {
  const fs = require("node:fs");
  const crypto = require("node:crypto");
  const { evidence_files: evidence } = JSON.parse(fs.readFileSync(path.join(root, "data", "evidence_manifest.json"), "utf8"));
  const fileBacked = evidence.filter((record) => record.source_file_present === true);
  assert.ok(fileBacked.length > 0, "expected at least one file-backed evidence record");
  const problems = fileBacked.flatMap((record) => {
    const relPath = record.source_file_path;
    if (!relPath) return [`${record.evidence_file_id}: source_file_present is true but source_file_path is missing`];
    const abs = path.join(root, relPath);
    if (!fs.existsSync(abs)) return [`${record.evidence_file_id}: missing file ${relPath}`];
    const digest = `sha256:${crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex")}`;
    return digest === record.sha256 ? [] : [`${record.evidence_file_id}: registered ${record.sha256}, actual ${digest}`];
  });
  assert.deepEqual(problems, []);
});

test("kg_claims.json conforms to the controlled predicate vocabulary", () => {
  const { status, output } = runScript("validate_ontology.mjs");
  assert.equal(status, 0, output);
});
