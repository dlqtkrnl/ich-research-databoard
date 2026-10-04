# ICH Research DataBoard

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23121468.svg)](https://doi.org/10.5281/zenodo.23121468)

**A browser-only governance toolkit for intangible cultural heritage (ICH) AI datasets.**

ICH Research DataBoard couples four governance mechanisms directly to the workflow of
building an AI dataset from cultural-heritage material, so that rights, provenance and
evaluation-set integrity are checked at the point of use rather than documented
afterwards:

1. **Rights Gate**: checks a five-part permission scope (research, publication,
   public demo, derivative, commercial) against *authentic* evidence files before a
   dataset can enter training, evaluation or public display.
2. **Evidence-authenticity registry**: keeps "the record is schema-complete and
   reviewed" (`verified`) separate from "the source file is present and its SHA-256 was
   recomputed from the actual bytes" (`authentic`).
3. **Split-leakage validator**: blocks train / eval / holdout splits that share an
   `object_id`, `event_id` or `capture_session_id`.
4. **Client-side audit hash-chain**: every state change is appended to a SHA-256
   hash-chained log that detects later tampering with recorded entries.

The case data comes from Jiangxi ramie-cloth (夏布, *xiabu*) textile heritage, with a
CC0 museum image set and a CC BY 4.0 knowledge-graph triple set as the real,
re-hashable evidence.

No build step and no dependencies: open `src/index.html` in a browser.

## Quick start

```text
# 1. Run the app: open src/index.html directly (file://) in any modern browser.

# 2. Optional: serve it with persistent state on disk instead of browser storage.
npm run serve                   # http://127.0.0.1:8787 (runs src/server.mjs)

# 3. Run the tests (Node.js 22 or later).
npm test
```

The interface is in English by default. Use the **中文 / English** button in the top bar
to switch to Chinese. The choice is remembered per browser and is not part of the
research state, the audit log or exported packages.

## Interface

| Tab | Purpose |
|---|---|
| Overview | KPI cards for active datasets, Rights Gate blocks, the research board, locked eval sets, generation runs and audit-chain status. Each card opens its module. |
| Datasets | Manifest-driven dataset list, registration form, archive / restore. |
| Board | Personal research board: train / eval / holdout assignment with leakage checks, eval-set locking, reuse layers, and a gallery of authentic source images. |
| Generation Lab | Builds prompts from the selected dataset, reuse layers and KG claims, and records text-to-image / image-to-image runs as auditable manifests. Gated by the Rights Gate. |
| Governance | Rights Gate, validation evidence, KG claim provenance, ontology fields and the audit hash-chain. |

## Governance mechanisms

**Rights Gate** (`rightsGate` in `app.js`). A dataset is blocked unless it has at least
one authentic evidence file (`verification_status: "verified"` **and**
`source_file_present: true`) and the `research` scope is granted. It passes fully only
when `publication` and `public_demo` are also granted and backed by evidence whose own
scope covers publication; otherwise it is *conditional* (research use only).
Three recorded conditions are also enforced, and a value the gate does not recognise
counts against the dataset. `expiry_date` must be a valid `YYYY-MM-DD` date that has not
passed (it expires at the end of that day, UTC) or a value beginning `not_applicable`;
anything else, including a missing or malformed date, blocks. A `consent_form_id` other
than `not_applicable…` must name an authentic evidence file with that exact
`evidence_file_id` (a missing id blocks). `sensitive_culture_status` must be
`not_applicable…` or `reviewed_no_restriction`; `review_required` or any other value caps
the result at *conditional* and stops generation. The Generation Lab refuses
image-to-image modes and source-copying reuse layers when `derivative` is not granted;
`commercial`, `portrait_status` and `cross_border_transfer_status` are recorded and
displayed but not enforced. A permission toggle in the interface changes the scope only
and never lifts a `rights_gate: "blocked"` status recorded by the curator, and an
imported research package can neither lift such a block nor mark an evidence record as
file-backed unless the same id and digest are already registered.
The `rights_gate` field stored in `rights_manifest.json` is the curator's status, of
which only `blocked` binds the gate; the result shown in the app is computed on every
render. Each dataset that passes or is conditional has a *rights* evidence file (the P12
`LICENSE.md`, the Smithsonian Open Access API records for the Cooper Hewitt objects)
alongside its content files, and only the rights files carry a publication scope.

**Evidence authenticity** (`authenticEvidenceFor` vs. `verifiedEvidenceFor`). A
`verified` record can still be a placeholder. Only records whose file is in the
repository and whose SHA-256 matches the recomputed digest count as authentic, and the
UI reports the number of placeholder records explicitly.

**Split leakage** (`validateSampleLeakage`). Reports the exact shared key, for example
`object_id:XB-OBJ-07`, when one physical object, collection event or capture session
appears in more than one split.

**Audit hash-chain** (`createAuditEntry`, `verifyAuditChain`). Entries carry `sequence`,
`previous_hash` and `entry_hash`. Hashes are standard SHA-256 (a pure-JS
implementation, `sha256Hex`, checked against Node's `crypto` in the tests).
This chain is **client-side**: it detects edits to recorded entries, but it is not
anchored to an external timestamp authority, is not replicated, and does not stop
someone with access to browser storage from deleting the log.

**Ontology layer** (`data/ontology/`, `scripts/validate_ontology.mjs`). Checks every KG
claim against a controlled vocabulary of 30 predicates and fixed status enums, reports
coverage of 8 competency questions, and cross-checks each claim's `evidence_id` against
the evidence registry (currently 35 of 40 claims resolve; 5 use informal labels). It is
a lightweight vocabulary and constraint checker, not an OWL / SHACL reasoner.

**Checksums, two layers.** In the browser, `validateChecksumRegistry` only checks that
registry entries are well-formed `sha256:<64 hex>` values. Byte-level integrity is
checked by `scripts/hash_files.mjs --verify`, which re-reads the 20 registered files and
recomputes their digests.

## Data model

`data/*.json` is the single source of truth:

| File | Contents |
|---|---|
| `dataset_manifest.json` (+ `.schema.json`) | Dataset records |
| `rights_manifest.json` | Permission scope, consent and portrait status per dataset |
| `evidence_manifest.json` | Evidence files: hash, verification status, `source_file_present` |
| `split_manifest.json`, `sample_manifest.json` | Split assignments and sample-level split units |
| `kg_claims.json` | 40 knowledge-graph claims with provenance |
| `checksum_manifest.json` | SHA-256 registry for 20 manifests, schemas and evidence sources |
| `public_dataset_registry.json` | Reference metadata only (not loaded by the app) |

`data/manifest_bundle.js` is generated from the JSON files so the app can run from
`file://`, where browsers block `fetch()` of local files. Do not edit it by hand.

```text
npm run rehash        # recompute checksum_manifest.json, then regenerate manifest_bundle.js
npm run verify        # check every registered file against its SHA-256
npm run check:bundle  # check manifest_bundle.js is in sync with data/*.json
npm test              # unit tests plus all of the integrity checks above
```

Line endings are pinned in `.gitattributes` (LF for text; evidence sources keep their
original bytes), so the registered hashes hold on Windows, macOS and Linux checkouts.

## Bundled data and rights status

| Dataset | What it is | Rights Gate | Redistributable |
|---|---|---|---|
| `JXICH-XBEMB-KG-P12` | 32 source-linked KG triples on Xiabu embroidery (夏布绣) from the author's own manuscript | conditional (cultural-sensitivity review pending) | Yes, **CC BY 4.0** ([`data/kg_sources/LICENSE.md`](./src/data/kg_sources/LICENSE.md)) |
| `PUB-CHNDM-HEMP-JP-009` | 8 images of 3 Japanese hemp textiles (katagami stencils, *umakake*), Cooper Hewitt, Smithsonian Open Access | pass | Yes, **CC0** |
| `JXICH-XB-001` | Jiangxi Xiabu pilot: metadata structure only, 4 example sample rows, inheritor consent pending | blocked | No (placeholder / pilot) |
| `PUB-DTD-001`, `PUB-FASHIONPEDIA-002`, `PUB-DEEPFASHION2-004` | Metadata connectors for public datasets; no files included | blocked | No (no files bundled) |

Rights Gate values are what the app computes from the bundled manifests.

Notes on the real data:

- **KG triples.** 26 of the 32 triples are `release_ready` in the source package and
  appear as `source_verified`. The other 6 are `review_flagged` and appear as
  `expert_review_required`; they are released as-is and remain flagged.
- **Cooper Hewitt images.** All three objects are Japanese. They share the bast-fibre
  material family with Jiangxi ramie cloth but come from a different craft tradition, so
  they serve as a process-adjacent comparison set, not a substitute for Jiangxi data
  (`CLM-CHNDM-003` records this with `isNotIdenticalTo`).

## Known limitations

- `JXICH-XB-001` is pilot data. Its dataset checksum is the placeholder
  `sha256:pilot-placeholder-...`, and `sample_manifest.json` holds 4 example rows for it against
  the manifest's target of 320 images and 42 records.
- 5 of the 14 evidence records have `source_file_present: false`; their hashes are
  illustrative. Do not describe them as verified evidence.
- Inheritor (传承人) consent is pending, so no inheritor images or personal data are
  included.
- The 2D / 2.5D / 3D view is a schematic CSS preview, not a photogrammetry, NeRF or mesh
  reconstruction.
- Generation Lab outputs are AI-generated, are always badged
  "AI-GENERATED — NOT AN AUTHENTIC ARTIFACT", and carry
  `content_class: "ai_generated_not_authentic"` in exported manifests.
- Without `src/server.mjs`, state lives in browser `localStorage` and is lost if site data is
  cleared; use **Export package** for backups. The optional server is a single-user local
  convenience with no authentication (see [`docs/persistence-design.md`](./docs/persistence-design.md)).
- Dataset names, categories and analyses in `data/*.json` are shown in their original
  language (mostly Chinese); only the interface is translated.

## Testing

`npm test` runs 38 tests with Node's built-in test runner:

- `test/validation.test.js`: Rights Gate, audit hash-chain (including tamper detection),
  split leakage, schema, checksum registry and evidence authenticity, run against the
  real `app.js` code.
- `test/integrity.test.js`: fails if any registered file's bytes change, if any file-backed evidence record does not match its file, if
  `manifest_bundle.js` is stale, or if a KG claim breaks the vocabulary.
- `test/storage-adapter.test.js`: the optional persistence adapter and its
  `localStorage` fallback.
- `test/i18n.test.js`: every interface string exists in both English and Chinese.
- `test/state-migration.test.js`: stale browser state from an older revision is replaced
  by the bundled manifests.

GitHub Actions runs the suite on Ubuntu and Windows with Node 22 and 24
(`.github/workflows/ci.yml`).

## Project structure

```text
src/
  index.html, app.js, styles.css the application (no build step)
  i18n.js                        English / Chinese interface strings
  server.mjs                     optional local persistence server
  data/                          manifests, ontology, evidence source files
scripts/                         hashing, bundle generation, ontology validation
test/                            Node test suites
docs/                            design notes
```

Data paths elsewhere in this README (`data/...`) are relative to `src/`, which is also
how the manifests record them.

## License

Code and data are licensed separately.

- **Code** (`src/index.html`, `src/app.js`, `src/i18n.js`, `src/styles.css`,
  `src/server.mjs`, `scripts/`, `test/`): [MIT License](./LICENSE.txt), © 2026 Yun Kyung Lee.
- **Data** (`src/data/`): not covered by the MIT License. Rights are recorded per dataset in
  [`data/rights_manifest.json`](./src/data/rights_manifest.json) and
  [`data/evidence_manifest.json`](./src/data/evidence_manifest.json). Only the two datasets
  marked redistributable above may be reused: the Cooper Hewitt images (CC0) and the KG
  triples (CC BY 4.0). Everything else under `data/` is placeholder or pilot material.

See [`ARCHIVING.md`](./ARCHIVING.md) for the release and Zenodo archiving checklist.

## Citation

If you use this software, please cite it using [`CITATION.cff`](./CITATION.cff).
Archived on Zenodo: concept DOI (all versions)
[10.5281/zenodo.23121468](https://doi.org/10.5281/zenodo.23121468); v1.0.2
[10.5281/zenodo.23131690](https://doi.org/10.5281/zenodo.23131690); v1.0.1
[10.5281/zenodo.23121906](https://doi.org/10.5281/zenodo.23121906); v1.0.0
[10.5281/zenodo.23121469](https://doi.org/10.5281/zenodo.23121469).

## Author

Yun Kyung Lee, Department of Fashion Design, Jiangxi Institute of Fashion Technology,
Nanchang 330201, China. ORCID: [0009-0009-4634-825X](https://orcid.org/0009-0009-4634-825X)

A Korean version of this README is available in [`README.ko.md`](./README.ko.md).
