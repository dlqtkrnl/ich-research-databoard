// Leakage-detection robustness (reviewer request, SOFTX-D-26-01381 R1.4): how much of a known, injected
// train/eval leakage does the unmodified validator (app.sampleLeakage) still find when the identifiers it
// relies on are missing, inconsistently written or wrongly assigned? Run:
//   node benchmarks/leakage_robustness.bench.js [--json out.json]
"use strict";
const fs = require("node:fs");
const app = require("../test/env-shim");
const { rng, makeCollection } = require("./synthetic");

const OBJECTS = 2000;          // 20,000 sample rows, 10 per object
const LEAK_FRACTION = 0.10;    // share of training objects with one image moved into evaluation
const SEEDS = [1, 2, 3, 4, 5];
const RATES = [0, 0.1, 0.3, 0.5];
const KEY_SETS = {
  "object_id only": ["object_id"],
  "object + event + session": ["object_id", "event_id", "capture_session_id"],
  "all five keys": ["object_id", "event_id", "capture_session_id", "duplicate_group_id", "phash"],
};
const ALL_KEYS = ["object_id", "event_id", "capture_session_id", "duplicate_group_id", "phash"];

function scenario(seed) {
  const { samples, datasetIds } = makeCollection({ objects: OBJECTS, perObject: 10, objectsPerDataset: 10, seed });
  const rand = rng(seed * 7919);
  // Clean assignment at dataset level (75 % train, 25 % eval): no object, visit or session crosses the split.
  const evalSets = new Set(datasetIds.filter((_, i) => i % 4 === 3));
  samples.forEach((s) => { s.split = evalSets.has(s.dataset_id) ? "eval" : "train"; s.phash = `p:${s.duplicate_group_id}`; });
  // Inject leakage: for a random 10 % of training objects, one photograph is moved to evaluation.
  const trainObjects = [...new Set(samples.filter((s) => s.split === "train").map((s) => s.object_id))];
  const leaking = new Set(trainObjects.filter(() => rand() < LEAK_FRACTION));
  const moved = new Set();
  samples.forEach((s) => { if (leaking.has(s.object_id) && !moved.has(s.object_id)) { s.split = "eval"; moved.add(s.object_id); } });
  return { samples, leaking, rand };
}

// Degrade every identifier independently with probability `rate`.
function degrade(samples, mode, rate, rand, objectsTotal) {
  if (mode === "session missing") {                                                                     // correlated: a whole capture session lost its metadata
    const lost = new Map();
    return samples.map((s) => {
      if (!lost.has(s.capture_session_id)) lost.set(s.capture_session_id, rand() < rate);
      return lost.get(s.capture_session_id) ? { ...s, ...Object.fromEntries(ALL_KEYS.map((k) => [k, ""])) } : { ...s };
    });
  }
  return samples.map((s) => {
    const next = { ...s };
    ALL_KEYS.forEach((key) => {
      if (rand() >= rate) return;
      if (mode === "missing") next[key] = "";
      else if (mode === "inconsistent") next[key] = String(next[key]).toLowerCase().replace(/-/g, "_"); // same entity, different spelling
      else if (mode === "wrong") {                                                                      // reassigned to another entity
        const other = Math.floor(rand() * objectsTotal);
        next[key] = { object_id: `SYN-OBJ-${other}`, event_id: `SYN-EVT-${Math.floor(other / 5)}`, capture_session_id: `SYN-CAP-${other}`,
          duplicate_group_id: `dup-${other}-0`, phash: `p:dup-${other}-0` }[key];
      }
    });
    return next;
  });
}

// An alert (a flagged key value) is genuine if some training and some evaluation row carrying it truly belong to the
// same entity for that key (the same object, visit, session or duplicate group before degradation); otherwise it is
// spurious. A leaking object counts as found only if one of its rows carries a genuine alert. A non-leaking object
// counts as falsely flagged if one of its rows carries a spurious alert.
function evaluate(degraded, truth, leaking, keys) {
  const subset = degraded.map((s) => Object.fromEntries(Object.entries(s).filter(([k]) => !ALL_KEYS.includes(k) || keys.includes(k))));
  const { violations } = app.sampleLeakage(subset);
  const flagged = new Set(violations);
  const holders = new Map();
  subset.forEach((s, i) => keys.forEach((k) => {
    if (!s[k]) return;
    const tag = `${k}:${s[k]}`;
    if (!flagged.has(tag)) return;
    if (!holders.has(tag)) holders.set(tag, []);
    holders.get(tag).push(i);
  }));
  const found = new Set();
  const falselyFlagged = new Set();
  let spurious = 0;
  holders.forEach((idx, tag) => {
    const key = tag.slice(0, tag.indexOf(":"));
    const trainTrue = new Set(idx.filter((i) => subset[i].split === "train").map((i) => truth[i][key]));
    const genuine = idx.some((i) => subset[i].split === "eval" && trainTrue.has(truth[i][key]));
    if (!genuine) spurious++;
    idx.forEach((i) => {
      const obj = truth[i].object_id;
      if (genuine && leaking.has(obj)) found.add(obj);
      if (!genuine && !leaking.has(obj)) falselyFlagged.add(obj);
    });
  });
  const objects = new Set(truth.map((s) => s.object_id)).size;
  return { recall: [...leaking].filter((o) => found.has(o)).length / leaking.size, alerts: violations.length, spurious,
    falseFlagShare: falselyFlagged.size / (objects - leaking.size) };
}

const results = [];
for (const mode of ["missing", "session missing", "inconsistent", "wrong"]) {
  for (const rate of RATES) {
    for (const [label, keys] of Object.entries(KEY_SETS)) {
      const recalls = [], alerts = [], spurious = [], ffs = [];
      for (const seed of SEEDS) {
        const { samples, leaking, rand } = scenario(seed);
        const degraded = degrade(samples, mode, rate, rand, OBJECTS);
        const r = evaluate(degraded, samples, leaking, keys);
        recalls.push(r.recall); alerts.push(r.alerts); spurious.push(r.spurious); ffs.push(r.falseFlagShare);
      }
      const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
      results.push({ mode, rate, keys: label, leaking_objects_found: +mean(recalls).toFixed(3), found_min: +Math.min(...recalls).toFixed(3),
        alerts: Math.round(mean(alerts)), spurious_alerts: Math.round(mean(spurious)), clean_objects_falsely_flagged: +mean(ffs).toFixed(3) });
    }
  }
}
console.table(results);
const jsonArg = process.argv.indexOf("--json");
if (jsonArg > 0) fs.writeFileSync(process.argv[jsonArg + 1], JSON.stringify({ objects: OBJECTS, sample_rows: OBJECTS * 10, leak_fraction: LEAK_FRACTION, seeds: SEEDS, results }, null, 2));
