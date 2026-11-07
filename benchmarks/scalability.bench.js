// Scalability benchmark (reviewer request, SOFTX-D-26-01381 R1.7): times the unmodified governance functions
// of src/app.js on synthetic collections of increasing size and reports the size of the state that the
// browser would write to localStorage. Run: node benchmarks/scalability.bench.js [--json out.json]
"use strict";
const fs = require("node:fs");
const app = require("../test/env-shim");
const { makeCollection, governanceRecords } = require("./synthetic");

const REPEATS = 7;
function median(values) { const s = [...values].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }
function time(fn) {
  const runs = [];
  let result;
  for (let r = 0; r < REPEATS; r++) { const t0 = process.hrtime.bigint(); result = fn(); runs.push(Number(process.hrtime.bigint() - t0) / 1e6); }
  return { ms: median(runs), result };
}

function buildState(samplesN) {
  const objects = samplesN / 10;
  const { samples, datasetIds } = makeCollection({ objects, perObject: 10, objectsPerDataset: 10 });
  // Datasets alternate train / eval / holdout, a leakage-free assignment at dataset level.
  const splitOf = new Map(datasetIds.map((id, i) => [id, ["train", "train", "eval", "holdout"][i % 4]]));
  samples.forEach((s) => { s.split = splitOf.get(s.dataset_id); });
  const { datasets, rights, evidenceFiles } = governanceRecords(datasetIds);
  const state = app.createInitialState();
  Object.assign(state, { datasets, rights, evidenceFiles, samples, splits: datasetIds.map((id) => ({ dataset_id: id, split: splitOf.get(id) })), selectedId: datasetIds[0] });
  return { state, datasetIds };
}

function buildChain(entries) {
  const log = [];
  let previous = "GENESIS";
  for (let i = 1; i <= entries; i++) {
    const entry = app.createAuditEntry("assign_split", `SYN-DS-${i}`, `synthetic action ${i}`, previous, i);
    log.unshift(entry);
    previous = entry.entry_hash;
  }
  return log;
}

const rows = [];
for (const n of [1000, 10000, 100000]) {
  const { state, datasetIds } = buildState(n);
  app.replaceState(state);
  const leakage = time(() => app.sampleLeakage(state.samples));
  if (!leakage.result.pass) throw new Error("synthetic assignment should be leakage-free");
  const move = time(() => app.splitMove(state.samples, datasetIds[2], "train"));
  const gate = time(() => datasetIds.map((id) => app.rightsGate(app.rightsFor(id)).gate));
  const gateCounts = gate.result.reduce((acc, g) => ((acc[g] = (acc[g] || 0) + 1), acc), {});
  const entries = n; // one audit entry per sample row: a deliberately heavy log
  const log = buildChain(entries);
  state.auditLog = log; state.auditSequence = entries;
  const chain = time(() => app.verifyAuditChain());
  if (!chain.result.pass) throw new Error("chain should verify");
  // saveState() serializes the whole state after every logged action; time that serialization (with the log).
  const serialize = time(() => JSON.stringify(state).length);
  const stateChars = serialize.result;
  const logChars = JSON.stringify(state.auditLog).length;
  rows.push({
    sample_rows: n, datasets: datasetIds.length, audit_entries: entries,
    leakage_check_ms: +leakage.ms.toFixed(2),
    split_move_ms: +move.ms.toFixed(2),
    rights_gate_all_datasets_ms: +gate.ms.toFixed(2),
    gate_results: gateCounts,
    audit_chain_verify_ms: +chain.ms.toFixed(1),
    serialize_state_ms: +serialize.ms.toFixed(1),
    state_without_log_chars: stateChars - logChars,
    audit_log_chars_per_entry: Math.round(logChars / entries),
    stored_state_chars: stateChars,
  });
}
const out = { node: process.version, platform: `${process.platform}-${process.arch}`, repeats: REPEATS, rows };
console.table(rows.map(({ gate_results, ...r }) => r));
const jsonArg = process.argv.indexOf("--json");
if (jsonArg > 0) fs.writeFileSync(process.argv[jsonArg + 1], JSON.stringify(out, null, 2));
