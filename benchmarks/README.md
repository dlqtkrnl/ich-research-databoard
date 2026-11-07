# Benchmarks (v1.0.8)

These scripts were added in response to the peer review of the SoftwareX manuscript
(SOFTX-D-26-01381). They call the unmodified governance functions of `src/app.js` through
`test/env-shim.js`, so they measure the code that runs in the browser, not a reimplementation.
The application itself still has no dependencies; the Python scripts are optional.

| Script | Question | Requires |
|---|---|---|
| `scalability.bench.js` (`npm run bench:scale`) | How long do the leakage check, a split move, the rights gate, audit-chain verification and serializing the state take for 1,000, 10,000 and 100,000 sample rows, and how large is the stored state? | Node.js ≥ 22 |
| `chrome_crosscheck.py` | Do the Node timings of the leakage check and chain verification hold inside a browser page? | Python 3, Playwright, Chromium |
| `quota_chromium.py` | How many characters does Chromium's `localStorage` accept? | Python 3, Playwright, Chromium |
| `leakage_robustness.bench.js` (`npm run bench:leakage`) | How much of a known, injected leakage is still found when identifiers are missing, inconsistently written or wrong? | Node.js ≥ 22 |
| `near_duplicate_phash.py` | Can perceptual hashes supply `phash` / `duplicate_group_id`, and do they group different photographs of one object? | Python 3, Pillow, `imagehash` |

Results of the run reported in the paper are in `results/`. Timings depend on the machine
(reported run: Node 22.23, Chromium 153, Intel Xeon 2.1 GHz, 2 cores). Interface rendering is
not measured.

## Synthetic collections and their limits

`synthetic.js` generates objects photographed 10 times in one capture session each; 5 objects
share a collection visit (`event_id`) and 10 objects form a dataset. Every dataset has a rights
record and two evidence records shaped like the bundled manifests. A seeded generator makes every
run identical. The collections are uniform and are not heritage records: they test scale and the
validator's logic, not the heterogeneity of real collections. In them `phash` and
`duplicate_group_id` are exact labels and each session holds one object, so results for the
image keys are an upper bound.

## Leakage robustness protocol

2,000 objects (20,000 rows) are split at dataset level (75 % train, 25 % eval), which is
leakage-free. For a random 10 % of training objects one photograph is then moved to evaluation;
these objects are the ground truth. Identifiers are then degraded with probability 0, 0.1, 0.3 or
0.5:

- **missing**: each identifier of each row is emptied independently;
- **session missing**: all identifiers of all rows of a capture session are emptied together;
- **inconsistent**: each identifier is rewritten for the same entity in one fixed alternative
  spelling (lower case, `_` for `-`);
- **wrong**: each identifier is replaced by that of a randomly chosen other object.

An alert (a flagged key value) is *genuine* when some training and some evaluation row carrying
it truly belong to the same entity for that key; otherwise it is *spurious*. A leaking object
counts as found only if one of its rows carries a genuine alert; a non-leaking object counts as
falsely flagged if one of its rows carries a spurious alert. Five seeds are averaged.

## Storage limits

`quota_chromium.py` found that Chromium accepts at most 5,242,879 characters in one
`localStorage` value; the optional `src/server.mjs` accepts request bodies up to 10 MB. With the
synthetic records the stored state grows by about 241 characters per sample row and about 310
characters per audit entry, and the audit log grows with every logged action. The browser thus
holds about 20,000 sample rows with a log of 1,000 entries, or about 9,500 if every row has one
logged action; the server holds about 42,000 or 19,000. Since v1.0.8 a failed browser or server
write is shown on the Overview ("Storage: ... NOT SAVED").
