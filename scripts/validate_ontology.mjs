#!/usr/bin/env node
// Validates data/kg_claims.json against the controlled predicate vocabulary and
// competency questions in data/ontology/, and cross-checks each claim's evidence_id
// against data/evidence_manifest.json. This is a constraint/coverage checker, not a
// full OWL/SHACL reasoner — see data/ontology/predicate_vocabulary.json for scope notes.
//
// Usage: node scripts/validate_ontology.mjs
// Exit code 1 if any claim uses an out-of-vocabulary predicate, an invalid
// review_status, or an out-of-range confidence value.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const readJson = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const vocab = readJson("data/ontology/predicate_vocabulary.json");
const cqs = readJson("data/ontology/competency_questions.json").questions;
const claims = readJson("data/kg_claims.json").claims;
const evidenceIds = new Set(readJson("data/evidence_manifest.json").evidence_files.map((e) => e.evidence_file_id));

const predicateNames = new Set(vocab.predicates.map((p) => p.name));
const statusEnum = new Set(vocab.review_status_enum);

const errors = [];
claims.forEach((c) => {
  if (!predicateNames.has(c.predicate)) errors.push(`${c.claim_id}: predicate "${c.predicate}" not in controlled vocabulary`);
  if (!statusEnum.has(c.review_status)) errors.push(`${c.claim_id}: review_status "${c.review_status}" not in enum`);
  if (typeof c.confidence !== "number" || c.confidence < 0 || c.confidence > 1) errors.push(`${c.claim_id}: confidence ${c.confidence} out of [0,1]`);
});

const claimsWithResolvedEvidence = claims.filter((c) => evidenceIds.has(c.evidence_id));
console.log(`[validate_ontology] ${claims.length} claims checked against ${predicateNames.size} vocabulary predicates`);
console.log(`[validate_ontology] evidence_id resolves to an actual evidence_manifest.json entry for ${claimsWithResolvedEvidence.length}/${claims.length} claims`);
if (claimsWithResolvedEvidence.length < claims.length) {
  console.log(`[validate_ontology]   the remaining ${claims.length - claimsWithResolvedEvidence.length} use informal evidence_id labels (fieldnote/interview/official-source references) that are not yet evidence_manifest-backed — do not describe these as "evidence-verified" claims.`);
}

console.log(`[validate_ontology] competency question coverage:`);
cqs.forEach((cq) => {
  const matching = claims.filter((c) => cq.predicates.includes(c.predicate));
  const verified = matching.filter((c) => c.review_status === "source_verified");
  const state = matching.length === 0 ? "NO CLAIMS" : verified.length > 0 ? "source_verified claim(s) exist" : "only unverified/pending claims";
  console.log(`  ${cq.id} (${matching.length} claim(s), ${verified.length} source_verified) — ${state}`);
});

if (errors.length) {
  console.error(`[validate_ontology] FAIL — ${errors.length} constraint violation(s):`);
  errors.forEach((e) => console.error(`  ${e}`));
  process.exit(1);
}
console.log(`[validate_ontology] OK — no vocabulary/enum/range violations`);
