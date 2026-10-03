# Related Work & Research Gap

**Status: DRAFT — auto-compiled from parallel automated literature searches (WebSearch), 2026-07-12/13.**
**⚠️ Before citing any of this in a submission: independently verify every title/author/venue/URL below. Automated web search can misattribute authorship or venue, and preprint status may have changed since search time. Entries flagged "unconfirmed" below are especially in need of manual check.**

This document supports the Research Gap section for a paper on the browser-based AI governance platform in `ich_ai_test_platform/` (Rights Gate, Knowledge Graph + lightweight ontology, Generation Lab, Audit hash-chain) applied to Jiangxi ICH (非遗) data. Four literature areas were searched in parallel; findings and gap statements are summarized per area, then synthesized into one overall gap statement.

---

## 1. AI/ML Data Governance, Dataset Rights & Provenance

Two disconnected literatures were found: (a) general-purpose dataset documentation/audit tooling — **Datasheets for Datasets** (Gebru et al., *CACM* 2021), **Model Cards** (Mitchell et al., FAT* 2019), **Dataset Nutrition Label** (Holland/Hosny et al. 2018), **Croissant** (Akhtar et al., NeurIPS 2024 D&B), **The Data Provenance Initiative** (Longpre et al., arXiv 2310.16787), **NIST AI RMF 1.0** (2023) — which describe/audit datasets but do not technically enforce access at generation time; and (b) rights/ethics frameworks for culturally-sensitive data — **CARE Principles for Indigenous Data Governance** (Carroll et al., *Data Science Journal* 2020), **FAIR for AI** (*Scientific Data* 2023), **The Esethu Framework** (ACL 2025), and **Indigenous data sovereignty in ICH governance** (*Int'l J. of Cultural Property*, 2025, author names unconfirmed) — which articulate community-control principles but stop at policy/licensing recommendations. The position paper **"Data Authenticity, Consent, & Provenance for AI are all broken"** (Longpre et al., ICML 2024) most directly motivates this project's evidence-hash + permission_scope design. A directly relevant prior KG effort — **"Knowledge graph based on domain ontology and NLP for Chinese ICH"** (*J. Visual Languages & Computing*, ~2018) — has a KG component but no rights-gating, generation, or audit layer.

**Gap:** No source combines a machine-checked, per-record `permission_scope` (research/publication/public_demo/derivative/commercial) with cryptographic evidence of consent/rights, verified *before* an LLM/T2I pipeline may train, publish, or generate from a record — nor pairs that gate with a tamper-evident hash-chain audit of the governance decisions themselves. CARE-style community authority for ICH has not been operationalized as an enforced, auditable software gate integrated with a KG-grounded generation pipeline.

## 2. Knowledge Graphs & Ontology for (Intangible) Cultural Heritage

Heavy-weight modeling is mature: **CIDOC-CRM** (ISO 21127:2023) and its ICH extensions (IJUNESST vol.7 no.1), and the **Europeana Data Model**. Competency-question (CQ) methodology is well established generally (**CQ survey**, Conceptual Modeling 2023; **EKAW 2024 position paper**; METHONTOLOGY/NeOn) but rarely paired with a *minimal* predicate vocabulary purpose-built for non-specialist governance use. Chinese ICH KGs found include **CICHMKG** (Fan, Wang, Hodel; *npj Heritage Science* 2023, 1.77M triples, national-scale/multimodal), **Yunjin KG + QA system** (Xu, Lu, Liu; *Heritage Science* 2023) and its **RAG/LLM extension** (*Heritage Science* 2024), **Qingyang sachets embroidery KG** (Liang, Xie, Tan, Zhang; *PLOS ONE* 2025, the closest single-craft analog), and a graph-attention attribute-extraction study (ScienceDirect 2021). Outside China, **Phum Riang Silk Heritage** (*Informatics*/MDPI 2026) is the closest CQ-driven, craft-focused parallel; **SILKNOW** (arXiv 2021) models European silk heritage similarly. A *JOCCH* 2023 editorial explicitly notes ICH is under-served relative to tangible heritage in Semantic Web literature. No academic KG paper specific to 夏布绣 (xiabu embroidery) was found; only a non-academic digitization platform (traditionowlab.cn) surfaced.

**Gap:** Existing Chinese ICH KGs are either large NLP-extracted graphs built for downstream ML tasks (VQA, entity extraction) or single-craft case studies reusing full CIDOC-CRM/Time/FOAF stacks — not lightweight, class/domain/range-constrained predicate vocabularies validated in situ via competency questions by non-specialist governance users (e.g., provincial ICH administrators). The combination of (i) minimal ontology engineering, (ii) CQ validation as a user-facing governance mechanism, and (iii) regional practitioner-centric (传承人) scope appears unaddressed.

## 3. Generative AI for Heritage & Associated Risks

Generative-restoration work exists (**diffusion-based 3D reconstruction**, arXiv 2410.10927; **pigment restoration for Harappan artifacts**, ScienceDirect; **Stable Diffusion synthetic data for porcelain classification**, arXiv 2601.14791; **npj Heritage Science 2025 review** of generative tech in digital museums). The closest technical analog is **"A KG-guided interactive system... for Song Dynasty ceramics"** (*npj Heritage Science*, 2026), combining Stable Diffusion/LoRA/FLUX.1 Kontext with ontology-defined prompt slots — but without a described rights gate or standardized non-authenticity label. KG-grounding-reduces-hallucination is supported generally (arXiv 2311.07914 survey; *ACM TOIS*/arXiv 2311.05232; EMNLP 2024 factuality survey) but untested for culturally sensitive image generation specifically. Bias/appropriation risk is documented: **cultural bias in T2I systematic review** (IEEE, 2025, 58 studies), **"Fix or Fake?"** (CHI 2026, Dunhuang AIGC workshop — diagnoses the problem, proposes no architecture), **community-driven cultural-sensitivity evaluation** (arXiv 2510.27361), plus policy framing from **UNESCO** and the **ABA** on Indigenous appropriation. Labeling/provenance standards exist independently: **C2PA v2.4** and **EU AI Act Article 50 watermarking analysis** (arXiv 2503.18156).

**Gap:** No located source unifies (1) KG-grounded generation for *intangible* (not just object) heritage, (2) an explicit pre-generation rights/consent gate reflecting community authority, and (3) machine-readable non-authenticity labeling (`content_class` tag) enforced at export. This is the specific niche the Generation Lab occupies. Note: coverage of KG-grounded T2I for heritage specifically was thin (mostly preprints); this sub-area needs supplementing before submission.

## 4. Audit Trails, Hash-Chains & Trustworthy AI Systems

Tamper-evident logging is technically mature but almost universally distributed/blockchain-oriented: **Crosby & Wallach** (USENIX Security 2009, foundational history-tree construction), **Koisser & Sadeghi** (arXiv 2308.05557, device-fleet hash trees), **BlockAudit** (arXiv 1811.09944, Hyperledger), **LogStamping** (arXiv 2505.17236, 2025, on-chain/IPFS hybrid), **Forensic-chain** (*Digital Investigation* 2019, Hyperledger chain-of-custody), **VLDB 2019 blockchain-relational-database** paper. ML-accountability literature defines *what* to audit without prescribing a cryptographic mechanism: **Hutchinson et al.** (FAccT 2021), **Fernsel, Kalff, Simbeck** (arXiv 2411.08906, three-part auditability framework), **Lam et al.** (FAccT 2024, criterion audits), and — closest match found — **"Audit Trails for Accountability in LLMs"** (Ojewale, Suresh, Venkatasubramanian, arXiv 2601.20727, 2026, tamper-evident LLM lifecycle ledger with reference implementation, but not for data-governance events like rights gates or split assignment). **Kapoor & Narayanan** (*Patterns*, 2023) document leakage/reproducibility failure across 294 papers, motivating split governance but not connecting it to tamper-evident logging. **Meylan et al.** (*ACM TOPS* 2020) show checksum verification is rarely used correctly when manual — supporting this project's automated two-layer checksum registry.

**Gap:** (1) Tamper-evident logging techniques are validated for generic IT/device/forensic logs, not governance-specific ML data-lifecycle events (rights-gate decisions, split assignment, generation provenance) in a single-institution, non-blockchain deployment. (2) ML-accountability literature defines auditability requirements without a lightweight, dependency-free reference implementation suited to resource-constrained GLAM/cultural-heritage institutions. (3) No found work integrates split-governance/leakage prevention with cryptographic audit evidence in one system, and none targets culturally-sensitive/rights-encumbered data as the object of a hash-chain audit trail.

---

## Synthesized Overall Research Gap

Across ~50 real sources spanning data governance, KG/ontology engineering, generative AI risk, and audit/accountability, each of this project's four pillars (Rights Gate, lightweight KG/ontology, KG-grounded Generation Lab, SHA-256 audit hash-chain) has partial precedent individually, but **no located work integrates all four into one governed pipeline for Intangible Cultural Heritage data**:

- Data-governance literature enforces documentation, not runtime access control tied to cryptographic evidence.
- ICH knowledge-graph literature is either large-scale/NLP-extracted or single-craft/CRM-heavy — not a minimal, CQ-validated vocabulary usable by non-specialist heritage administrators.
- Generative-heritage literature demonstrates KG-grounded generation but without consent gating or standardized non-authenticity labeling.
- Audit/accountability literature specifies *what* to log but defaults to blockchain/distributed infrastructure, and never targets ICH governance events specifically.

**Candidate gap statement for the paper:** *Existing systems address rights documentation, heritage knowledge representation, generative grounding, or tamper-evident logging in isolation; none combine evidence-based permission gating, a governance-oriented lightweight ontology, KG-grounded generation with mandatory non-authenticity disclosure, and an independently verifiable audit hash-chain into a single, low-dependency, browser-deployable governance pipeline for living (intangible) cultural heritage data.*

---

## Known Limitations of This Search

- All searches were performed by automated agents via WebSearch; no manual database search (Scopus/Web of Science/CNKI) was performed — coverage is not guaranteed to be exhaustive or fully bibliometric.
- Some entries are arXiv preprints, not peer-reviewed — flagged inline above; these need upgrading to peer-reviewed equivalents where possible before submission, or explicit acknowledgment as preprints.
- One entry (*Int'l J. of Cultural Property*, 2025) has unconfirmed authorship.
- Coverage was thin for: KG-grounded text-to-image specifically for heritage (mostly preprints), C2PA/heritage intersection, and XAI governance dashboards (mostly non-academic vendor content, deliberately excluded).
- No Chinese-language academic database (CNKI, Wanfang) was systematically searched; only English-web-indexed Chinese-heritage KG papers were found. A targeted CNKI pass is recommended, especially for 夏布绣/夏布 specific prior art.

## Next Steps

1. Manually verify each citation (author spelling, exact venue, DOI) before use in the manuscript.
2. Run a targeted CNKI/Wanfang search for 江西夏布, 夏布绣, and 非遗知识图谱 prior art in Chinese-language venues.
3. Decide whether to supplement the thin sub-areas (KG-grounded T2I for heritage; XAI governance dashboards) with additional targeted search.
4. Convert the "Synthesized Overall Research Gap" into the paper's formal Research Gap / Contribution section, cross-referenced against the four pillars already implemented in `app.js` and `data/ontology/`.
