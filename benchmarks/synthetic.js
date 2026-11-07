// Synthetic manifest generator shared by the benchmarks. Records are shaped exactly like the bundled
// manifests (src/data/*.json) so that the unmodified app.js functions run on them.
"use strict";

// Small deterministic PRNG (mulberry32) so every run produces the same collection.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A collection of `objects` physical objects, each photographed `perObject` times in one capture session.
// Every `objectsPerEvent` objects share one collection visit; every `objectsPerDataset` objects form a dataset.
function makeCollection({ objects, perObject = 10, objectsPerEvent = 5, objectsPerDataset = 10, seed = 1 }) {
  const samples = [];
  for (let o = 0; o < objects; o++) {
    const ds = `SYN-DS-${String(Math.floor(o / objectsPerDataset)).padStart(5, "0")}`;
    for (let k = 0; k < perObject; k++) {
      samples.push({
        sample_id: `SYN-IMG-${o}-${k}`,
        dataset_id: ds,
        object_id: `SYN-OBJ-${o}`,
        event_id: `SYN-EVT-${Math.floor(o / objectsPerEvent)}`,
        capture_session_id: `SYN-CAP-${o}`,
        duplicate_group_id: `dup-${o}-${Math.floor(k / 2)}`,
        split: "holdout",
        rights_id: `RGT-${ds}`,
      });
    }
  }
  const datasetIds = [...new Set(samples.map((s) => s.dataset_id))];
  return { samples, datasetIds, rand: rng(seed) };
}

function governanceRecords(datasetIds) {
  const datasets = [];
  const rights = [];
  const evidenceFiles = [];
  datasetIds.forEach((id, i) => {
    datasets.push({ id, name: id, source_url: "synthetic", owner: "synthetic", version: "v1", checksum: "sha256:synthetic",
      annotation_schema: "synthetic", risk_level: "low", readiness: 1, status: "ready", archived: false, tags: [], supports: ["2D"], reuse_layers: ["appearance", "rights"] });
    rights.push({ rights_id: `RGT-${id}`, dataset_id: id, license: "synthetic", license_document_id: `DOC-${id}`,
      consent_form_id: `CONSENT-${id}`,
      permission_scope: { research: true, publication: i % 2 === 0, public_demo: i % 2 === 0, derivative: false, commercial: false },
      sensitive_culture_status: i % 3 === 0 ? "review_required" : "not_applicable", expiry_date: "2099-12-31", rights_gate: "pending_review" });
    const digest = "sha256:" + "0".repeat(64);
    evidenceFiles.push({ evidence_file_id: `DOC-${id}`, dataset_id: id, evidence_role: "rights", sha256: digest, verification_status: "verified",
      permission_scope: ["research", "publication", "public_demo"], source_file_present: true });
    evidenceFiles.push({ evidence_file_id: `CONSENT-${id}`, dataset_id: id, evidence_role: "consent", sha256: digest, verification_status: "verified",
      permission_scope: [], source_file_present: i % 5 !== 4 });
  });
  return { datasets, rights, evidenceFiles };
}

module.exports = { rng, makeCollection, governanceRecords };
