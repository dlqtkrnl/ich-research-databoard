# Archiving to Zenodo (for DOI-based academic citation)

This is a **manual runbook for a human maintainer**, to follow for each
release. Nothing in this file is executed automatically.

Do not follow step (b)/Release creation until you have completed the
pre-flight checklist in section (d) below.

## a) Link the GitHub repository to Zenodo

1. Go to https://zenodo.org and log in (Zenodo supports GitHub OAuth login).
2. Go to your Zenodo account settings, GitHub tab
   (https://zenodo.org/account/settings/github/).
3. Zenodo will list your GitHub repositories (it needs the repo to exist and
   be **public** on GitHub first — private repos will not appear).
4. Find `dlqtkrnl/ich-research-databoard` in the list and flip its
   toggle **ON**. This authorizes Zenodo to watch the repo for new Releases.
   No archiving happens yet — the toggle just arms the webhook.

## b) Trigger a DOI mint via a GitHub Release/tag

5. Once the toggle is on, any **new GitHub Release** (not just a git tag —
   it must be created via GitHub's "Releases" UI/API, which creates a tag
   under the hood) fires a webhook to Zenodo.
6. Zenodo downloads a snapshot of the tagged repository contents, archives
   it as a new "upload" on Zenodo, and mints a new **DOI** for that specific
   version. A top-level "concept DOI" also exists that always resolves to
   the latest version, useful for citing "the project" rather than one
   version.
7. Recommended practice before creating the Release:
   - Bump `version` and `date-released` in `CITATION.cff` to match the tag.
   - Use a version tag like `v1.0.0`.
   - Write real release notes summarizing what's included.
8. After the Release is published, check the Zenodo GitHub settings page
   (or your Zenodo uploads) for the new record and confirm the DOI was
   minted successfully. It can take a minute or two.

## c) Add the DOI badge to README

9. On the Zenodo record page for the archived version (or the concept DOI,
   if you want a badge that always points at the latest version), find the
   DOI badge markdown snippet Zenodo generates automatically (usually shown
   near the top of the record page as a clickable badge image with a
   "copy markdown" option).
10. It looks like:
    ```markdown
    [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
    ```
11. Paste that near the top of `README.md` (e.g. just under the title).
12. Also update `CITATION.cff` with the real DOI if you want GitHub's
    "Cite this repository" box to show it (Zenodo DOIs can be added as an
    `identifiers` entry with `type: doi`).

## d) Pre-flight checklist — do this before making the repo public

Stop and re-read the "Known limitations" and "Bundled data and rights
status" sections of README.md before any of the steps above. A Zenodo archive is
effectively permanent and gets its own DOI/citation trail — mistakes here
are much harder to walk back than a normal git push. Specifically confirm:

- [ ] The `data/` directory's mixed rights status is understood and
      accepted: some files are CC0 (Cooper Hewitt hemp textile images,
      `data/public_dataset_sources/chndm_hemp_textile_jp/`), one is the
      sole author's own manuscript data released under CC BY 4.0 on
      2026-10-03 (`JXICH-XBEMB-KG-P12`, `data/kg_sources/` — see
      `data/kg_sources/LICENSE.md`), and most
      of the `JXICH-XB-001` pilot dataset is explicitly placeholder/pilot
      data, not real records.
- [ ] You have re-checked `data/rights_manifest.json` and
      `data/evidence_manifest.json` per-record before archiving — do not
      rely on memory of this checklist; rights status can change.
- [ ] Nothing under `data/` is redistributed publicly unless its
      `rights_manifest.json` entry actually permits `public_demo` /
      `publication` (currently only `PUB-CHNDM-HEMP-JP-009` does).
- [ ] Entries in `evidence_manifest.json` where `source_file_present: false`
      are illustrative placeholders, not real evidence documents — do not
      describe them as verified in any public-facing text.
- [x] `LICENSE` (MIT) copyright holder and `CITATION.cff` author fields
      (name, ORCID, affiliation) are filled in (2026-10-03).
- [ ] `CITATION.cff`'s `version` and `date-released` match the Release tag.
- [ ] The repo is genuinely ready to be public — Zenodo archiving requires
      a public GitHub repo, and once a DOI is minted for a version, that
      version's snapshot is expected to remain permanently resolvable.

If in doubt about any single `data/` file, treat it as **not** cleared for
public archiving until its manifest entry explicitly says otherwise.
