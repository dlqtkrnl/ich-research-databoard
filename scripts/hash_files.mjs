#!/usr/bin/env node
// Recomputes real SHA-256 digests (byte-level, via Node's crypto) for every canonical
// source file and writes/verifies data/checksum_manifest.json. This is the audit-layer
// counterpart to app.js's validateChecksumRegistry(), which only checks registry
// *format* (does every entry look like "sha256:<64 hex>" and non-pending) — it never
// re-reads file bytes, so it cannot by itself prove a file hasn't changed.
//
// Usage:
//   node scripts/hash_files.mjs           writes data/checksum_manifest.json
//   node scripts/hash_files.mjs --verify  recomputes and diffs against the existing file, exit 1 on mismatch

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data");

const CANONICAL_FILES = [
  { path: "data/dataset_manifest.json", role: "core_manifest" },
  { path: "data/dataset_manifest.schema.json", role: "schema" },
  { path: "data/rights_manifest.json", role: "core_manifest" },
  { path: "data/evidence_manifest.json", role: "core_manifest" },
  { path: "data/split_manifest.json", role: "core_manifest" },
  { path: "data/sample_manifest.json", role: "core_manifest" },
  { path: "data/kg_claims.json", role: "core_manifest" },
  { path: "data/public_dataset_registry.json", role: "reference_only" },
  { path: "data/generation_manifest.schema.json", role: "schema" },
  { path: "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv", role: "evidence_source" },
  { path: "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_1959-150-2_katagami.jpg", role: "evidence_source" },
  { path: "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_1976-103-105_katagami.jpg", role: "evidence_source" },
  { path: "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_01.jpg", role: "evidence_source" },
  { path: "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_02.jpg", role: "evidence_source" },
  { path: "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_03.jpg", role: "evidence_source" },
  { path: "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_04.jpg", role: "evidence_source" },
  { path: "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_05.jpg", role: "evidence_source" },
  { path: "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_06.jpg", role: "evidence_source" },
];

function sha256File(absPath) {
  const bytes = readFileSync(absPath);
  return { sha256: `sha256:${createHash("sha256").update(bytes).digest("hex")}`, bytes: bytes.length };
}

function computeRegistry() {
  return {
    manifest_version: "2026.10-v1.0",
    generated_at: new Date().toISOString(),
    generated_by: "scripts/hash_files.mjs (Node crypto, byte-level SHA-256 of files on disk)",
    files: CANONICAL_FILES.map(({ path, role }) => {
      const abs = join(root, path);
      statSync(abs); // throws if the file is missing — never silently skip a canonical file
      const { sha256, bytes } = sha256File(abs);
      return { path, sha256, bytes, role };
    }),
  };
}

const verifyOnly = process.argv.includes("--verify");
const outPath = join(dataDir, "checksum_manifest.json");
const fresh = computeRegistry();

if (!verifyOnly) {
  writeFileSync(outPath, JSON.stringify(fresh, null, 2) + "\n");
  console.log(`[hash_files] wrote ${fresh.files.length} file hashes to data/checksum_manifest.json`);
  process.exit(0);
}

const existing = JSON.parse(readFileSync(outPath, "utf8"));
const existingByPath = new Map(existing.files.map((f) => [f.path, f]));
const mismatches = [];
for (const file of fresh.files) {
  const prior = existingByPath.get(file.path);
  if (!prior) { mismatches.push(`${file.path}: not present in registry`); continue; }
  if (prior.sha256 !== file.sha256) mismatches.push(`${file.path}: registry=${prior.sha256} actual=${file.sha256}`);
}
if (mismatches.length) {
  console.error(`[hash_files] FAIL — ${mismatches.length} mismatch(es):`);
  mismatches.forEach((m) => console.error(`  ${m}`));
  process.exit(1);
}
console.log(`[hash_files] OK — all ${fresh.files.length} registered files match their on-disk bytes`);
