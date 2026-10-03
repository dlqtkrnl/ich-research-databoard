#!/usr/bin/env node
// Generates data/manifest_bundle.js from the JSON files under data/. This makes the
// JSON files the single source of truth: nobody should hand-edit manifest_bundle.js
// again. The bundle exists only because index.html is opened via file:// in the
// browser-only MVP, where `fetch()`-ing local JSON is blocked by CORS — so the data
// gets inlined as a plain <script> instead.
//
// Run scripts/hash_files.mjs first so checksum_manifest.json (bundled below) reflects
// the current file bytes.
//
// Usage:
//   node scripts/build_manifest_bundle.mjs          writes data/manifest_bundle.js
//   node scripts/build_manifest_bundle.mjs --check  exit 1 if the committed bundle is stale
//                                                   (ignores the "Generated at" timestamp)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const dataDir = join(root, "data");

const MANIFEST_KEYS = [
  "dataset_manifest",
  "rights_manifest",
  "split_manifest",
  "kg_claims",
  "evidence_manifest",
  "sample_manifest",
  "checksum_manifest",
];

const bundle = {};
for (const key of MANIFEST_KEYS) {
  const raw = readFileSync(join(dataDir, `${key}.json`), "utf8");
  bundle[key] = JSON.parse(raw);
}

const header = [
  "// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.",
  "// Source of truth: data/*.json (see MANIFEST_KEYS in scripts/build_manifest_bundle.mjs)",
  "// Regenerate with: node scripts/hash_files.mjs && node scripts/build_manifest_bundle.mjs",
  `// Generated at: ${new Date().toISOString()}`,
].join("\n");

const body = `window.JXICH_MANIFESTS = ${JSON.stringify(bundle, null, 2)};\n`;
const bundlePath = join(dataDir, "manifest_bundle.js");

if (process.argv.includes("--check")) {
  const committed = existsSync(bundlePath) ? readFileSync(bundlePath, "utf8").replace(/\r\n/g, "\n") : "";
  const committedBody = committed.slice(committed.indexOf("window.JXICH_MANIFESTS"));
  if (committedBody !== body) {
    console.error("[build_manifest_bundle] FAIL — data/manifest_bundle.js is out of date with data/*.json.");
    console.error("  Regenerate with: node scripts/hash_files.mjs && node scripts/build_manifest_bundle.mjs");
    process.exit(1);
  }
  console.log("[build_manifest_bundle] OK — data/manifest_bundle.js matches data/*.json");
  process.exit(0);
}

writeFileSync(bundlePath, `${header}\n${body}`);
console.log(`[build_manifest_bundle] wrote data/manifest_bundle.js from ${MANIFEST_KEYS.length} JSON files`);
