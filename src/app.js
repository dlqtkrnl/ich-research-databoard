const STORAGE_KEY = "jxich_research_databoard_state_v2";

// UI strings (English / Chinese). index.html loads i18n.js before this file; under Node
// (tests) it is required directly.
const i18n = (typeof window !== "undefined" && window.JXICH_I18N) || require("./i18n.js");
const t = i18n.t;

// Opt-in persistence adapter. Browser localStorage remains the always-on, synchronous
// source of truth so the file://-openable, no-build-step MVP keeps working exactly as
// before with zero setup. If the optional local persistence server (see server.mjs, run
// with `node server.mjs`) is reachable at the same origin the page was loaded from, reads
// and writes are additionally mirrored there so state can survive a browser cache clear
// and be shared across browsers/devices on one machine. See docs/persistence-design.md
// for the full design, what this does/doesn't handle, and known limitations.
const STORAGE_HEALTH_TIMEOUT_MS = 400;
const Storage = {
  serverAvailable: false,
  probed: false,
  // Fast, bounded feature-detect for the optional server. Never throws; any failure
  // (no server running, file:// origin, timeout) just leaves serverAvailable false and
  // every subsequent call transparently falls back to localStorage.
  async init() {
    if (typeof fetch !== "function") { this.serverAvailable = false; this.probed = true; return false; }
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), STORAGE_HEALTH_TIMEOUT_MS) : null;
    try {
      const res = await fetch("/api/health", controller ? { signal: controller.signal } : {});
      this.serverAvailable = !!(res && res.ok);
    } catch (error) {
      this.serverAvailable = false;
    } finally {
      if (timer) clearTimeout(timer);
      this.probed = true;
    }
    return this.serverAvailable;
  },
  // Reads `key` from the server if reachable; otherwise (or on any server error) falls
  // back to localStorage. Returns the parsed value, or null if nothing is stored anywhere.
  async get(key) {
    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/state/${encodeURIComponent(key)}`);
        if (res.ok) return await res.json();
        if (res.status !== 404) console.warn(`Storage.get: server returned ${res.status} for ${key}`);
      } catch (error) {
        console.warn("Storage.get: server unreachable, falling back to localStorage", error);
        this.serverAvailable = false;
      }
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn(`Storage.get: could not parse localStorage[${key}]`, error);
      return null;
    }
  },
  // Always writes to localStorage synchronously first — local durability must never
  // depend on the network. If the server is reachable, the write is additionally
  // mirrored there in the background, best-effort; callers do not need to await this.
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.warn(`Storage.set: localStorage write failed for ${key}`, error); }
    if (this.serverAvailable) {
      fetch(`/api/state/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      }).catch((error) => { console.warn(`Storage.set: server mirror failed for ${key}`, error); this.serverAvailable = false; });
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (error) { console.warn(`Storage.remove: localStorage removeItem failed for ${key}`, error); }
    if (this.serverAvailable) {
      fetch(`/api/state/${encodeURIComponent(key)}`, { method: "DELETE" }).catch((error) => { console.warn(`Storage.remove: server mirror failed for ${key}`, error); });
    }
  },
  // Lists known persisted state keys: the server's registry if reachable, else only the
  // local keys this app recognizes as its own (avoids leaking unrelated localStorage
  // entries from other tools when the page happens to share an origin/dev server).
  async list() {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/keys");
        if (res.ok) return await res.json();
      } catch (error) { console.warn("Storage.list: server unreachable, falling back to localStorage", error); this.serverAvailable = false; }
    }
    try { return Object.keys(localStorage).filter((key) => key.startsWith("jxich_")); } catch (error) { return []; }
  },
};

const reuseCatalog = [
  { id: "semantic", get label() { return t("reuse.semantic"); }, get hint() { return t("reuse.semanticHint"); }, icon: `<svg viewBox="0 0 24 24"><path d="M6 7h12M6 12h8M6 17h11"/><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5z"/></svg>` },
  { id: "history", get label() { return t("reuse.history"); }, get hint() { return t("reuse.historyHint"); }, icon: `<svg viewBox="0 0 24 24"><path d="M12 8v5l3 2"/><path d="M4 12a8 8 0 1 0 2.2-5.5"/><path d="M4 4v5h5"/></svg>` },
  { id: "appearance", get label() { return t("reuse.appearance"); }, get hint() { return t("reuse.appearanceHint"); }, icon: `<svg viewBox="0 0 24 24"><path d="M4 7c4-4 12-4 16 0"/><path d="M4 12c4-4 12-4 16 0"/><path d="M4 17c4-4 12-4 16 0"/></svg>` },
  { id: "inheritor", get label() { return t("reuse.inheritor"); }, get hint() { return t("reuse.inheritorHint"); }, icon: `<svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>` },
  { id: "rights", get label() { return t("reuse.rights"); }, get hint() { return t("reuse.rightsHint"); }, icon: `<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-2.8 8.3-7 10-4.2-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-5"/></svg>` },
];

const splitLabels = {
  train: { get title() { return t("split.train"); }, get hint() { return t("split.trainHint"); } },
  eval: { get title() { return t("split.eval"); }, get hint() { return t("split.evalHint"); } },
  holdout: { get title() { return t("split.holdout"); }, get hint() { return t("split.holdoutHint"); } },
};

const els = {};
// Must be initialized before createInitialState() below, since it synchronously builds the
// genesis audit entry via chainHash() -> sha256Hex(), which reads this table.
const SHA256_K = [
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
];
let state = createInitialState();

function $(selector) { return document.querySelector(selector); }
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function saveState() { Storage.set(STORAGE_KEY, state); }

function findDataset(id = state.selectedId) { return state.datasets.find((item) => item.id === id) || state.datasets[0] || null; }
function createRightsRecord(datasetId) {
  return {
    rights_id: `RGT-${datasetId}`, dataset_id: datasetId, license: "pending_review", license_document_id: "DOC-PENDING", consent_form_id: "CONSENT-PENDING",
    permission_scope: { research: false, publication: false, public_demo: false, derivative: false, commercial: false },
    portrait_status: "review_required", personal_data_status: "review_required", sensitive_culture_status: "review_required", cross_border_transfer_status: "not_allowed_until_review",
    expiry_date: "pending", rights_gate: "blocked",
  };
}
function rightsFor(id = state.selectedId) {
  let record = state.rights.find((item) => item.dataset_id === id);
  if (!record && id) { record = createRightsRecord(id); state.rights.push(record); }
  return record;
}
function splitFor(id = state.selectedId) {
  let record = state.splits.find((item) => item.dataset_id === id);
  if (!record && id) { record = { dataset_id: id, split: "holdout", locked: false, leakage_risk: "medium", note: t("split.newNote") }; state.splits.push(record); }
  return record;
}
function claimsFor(id = state.selectedId) { return state.kgClaims.filter((claim) => claim.dataset_id === id); }

function statusClass(dataset) {
  if (!dataset) return "";
  const gate = rightsGate(rightsFor(dataset.id));
  if (dataset.archived || gate.cls === "block" || dataset.risk_level === "high") return "block";
  if (gate.cls === "warn" || dataset.risk_level === "medium") return "warn";
  return "good";
}

function evidenceClass(status) {
  if (["source_verified", "approved", "可用"].includes(status)) return "good";
  if (["access_pending", "blocked", "阻止", "rejected"].includes(status)) return "block";
  return "warn";
}
function addToBoard(id) {
  const dataset = findDataset(id);
  if (!dataset || dataset.archived) return;
  if (!state.board.includes(id)) state.board.push(id);
  state.selectedId = id;
  audit("add_to_board", id, "Dataset added to personal research board.");
  render();
}
function removeFromBoard(id) {
  state.board = state.board.filter((item) => item !== id);
  if (state.selectedId === id) state.selectedId = state.board[0] || state.datasets.find((item) => !item.archived)?.id || null;
  audit("remove_from_board", id, "Dataset removed from board only; manifest record retained.");
  render();
}
function archiveDataset(id) {
  const dataset = findDataset(id);
  if (!dataset) return;
  dataset.archived = true;
  state.board = state.board.filter((item) => item !== id);
  if (state.selectedId === id) state.selectedId = state.board[0] || state.datasets.find((item) => !item.archived)?.id || null;
  audit("archive_dataset", id, "Dataset archived instead of hard delete.");
  render();
}
function restoreDataset(id) {
  const dataset = findDataset(id);
  if (!dataset) return;
  dataset.archived = false;
  state.selectedId = id;
  audit("restore_dataset", id, "Dataset restored from archive.");
  render();
}
function createDataset(formData) {
  const id = `USER-${Date.now().toString(36).toUpperCase()}`;
  const name = formData.get("datasetName").trim();
  const category = formData.get("datasetType");
  const source = formData.get("datasetSource").trim() || "local://pending-source";
  const volume = formData.get("datasetVolume").trim() || t("ds.volumeTbd");
  const dataset = {
    id, name, category, source_url: source, owner: t("ds.ownerTbd"), volume,
    collection_date: new Date().toISOString().slice(0, 10), version: "draft-v0.1", checksum: "sha256:pending",
    annotation_schema: "image_id, object_id, event_id, capture_session_id, label, rights_id", risk_level: "medium", readiness: 48,
    status: "draft_requires_review", archived: false, tags: [category, "user-added", "draft"], supports: ["2D", "2.5D"], reuse_layers: ["appearance", "rights"],
    analysis: t("ds.analysisNew"),
  };
  state.datasets.unshift(dataset);
  state.rights.push(createRightsRecord(id));
  state.splits.push({ dataset_id: id, split: "holdout", locked: false, leakage_risk: "medium", note: t("split.newNoteGate") });
  state.kgClaims.push({ claim_id: `CLM-${id}`, dataset_id: id, subject: name, predicate: "requires", object: "source_and_rights_review", evidence_id: "EVD-PENDING", source_url: source, confidence: 0.3, review_status: "expert_review_required" });
  state.board.unshift(id);
  state.selectedId = id;
  audit("create_dataset", id, "User-created dataset added with pending rights and holdout split.");
}
function setSplit(id, split) {
  const assignment = splitFor(id);
  const gate = rightsGate(rightsFor(id));
  if (assignment.locked && assignment.split === "eval") {
    audit("split_change_rejected", id, "Eval split is locked; unlock or export a new split version.");
    window.alert(t("alert.evalLocked"));
    return;
  }
  if ((split === "train" || split === "eval") && gate.gate === "blocked") {
    audit("split_change_rejected", id, `Rights Gate blocked assignment to ${split}.`);
    window.alert(t("alert.gateBlocked"));
    return;
  }
  assignment.split = split;
  assignment.note = `Manually assigned to ${split} on ${new Date().toISOString()}.`;
  if (split !== "eval") assignment.locked = false;
  audit("set_split", id, `Dataset assigned to ${split}.`);
  render();
}
function lockEval() {
  state.splits.forEach((item) => { if (item.split === "eval") item.locked = true; });
  audit("lock_eval_split", "split_manifest", "All current eval assignments locked.");
  render();
}
// The gate is computed by rightsGate(); a scope toggle changes the scope only and never lifts an
// explicit "blocked" status recorded by the curator.
function applyPermissionToggle(rights, key, checked) {
  rights.permission_scope[key] = checked;
  return rights;
}
function togglePermission(datasetId, key, checked) {
  applyPermissionToggle(rightsFor(datasetId), key, checked);
  audit("update_rights_scope", datasetId, `${key}=${checked}`);
  render();
}
function toggleReuse(layerId) {
  const dataset = findDataset();
  if (!dataset) return;
  const gate = rightsGate(rightsFor(dataset.id));
  if (layerId === "inheritor" && gate.gate !== "pass") {
    audit("reuse_layer_rejected", dataset.id, "Inheritor layer requires full publication/public_demo rights.");
    window.alert(t("alert.inheritor"));
    return;
  }
  if (dataset.reuse_layers.includes(layerId)) dataset.reuse_layers = dataset.reuse_layers.filter((item) => item !== layerId);
  else dataset.reuse_layers.push(layerId);
  audit("toggle_reuse_layer", dataset.id, layerId);
  render();
}
function updateClaimStatus(claimId, status) {
  const claim = state.kgClaims.find((item) => item.claim_id === claimId);
  if (!claim) return;
  claim.review_status = status;
  audit("update_kg_claim_status", claim.dataset_id, `${claimId} -> ${status}`);
  render();
}

function renderStats() {
  const active = state.datasets.filter((item) => !item.archived).length;
  const archived = state.datasets.filter((item) => item.archived).length;
  const blocked = state.datasets.filter((item) => rightsGate(rightsFor(item.id)).gate === "blocked").length;
  els.libraryCount.textContent = `${active} active`;
  els.libraryCount.className = `status-chip ${blocked ? "warn" : "good"}`;
  els.libraryStats.innerHTML = [[state.datasets.length, t("stats.manifest")], [blocked, t("stats.blocked")], [archived, t("stats.archived")]]
    .map(([value, label]) => `<div class="stat-tile"><strong>${value}</strong><span>${label}</span></div>`).join("");
}
function renderDatasetList() {
  const showArchived = els.showArchived.checked;
  const rows = state.datasets.filter((item) => showArchived || !item.archived);
  if (!rows.length) { els.datasetList.innerHTML = `<div class="empty-state">${t("empty.datasets")}</div>`; return; }
  els.datasetList.innerHTML = rows.map((record) => {
    const gate = rightsGate(rightsFor(record.id));
    const tags = record.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    const archiveButton = record.archived ? `<button class="mini-btn" data-action="restore" data-id="${record.id}" type="button">${t("btn.restore")}</button>` : `<button class="mini-btn" data-action="archive" data-id="${record.id}" type="button">${t("btn.archive")}</button>`;
    return `<article class="dataset-card ${record.id === state.selectedId ? "active" : ""} ${record.archived ? "archived" : ""}" draggable="${!record.archived}" data-id="${record.id}">
      <div class="dataset-card-head"><div class="dataset-title"><strong>${escapeHtml(record.name)}</strong><span>${escapeHtml(record.source_url)}</span></div><div class="dataset-actions"><button class="mini-btn" data-action="add" data-id="${record.id}" type="button">${t("btn.add")}</button>${archiveButton}</div></div>
      <div class="dataset-meta"><p>${escapeHtml(record.analysis)}</p><div class="score-ring" style="--score:${record.readiness}"><span>${record.readiness}</span></div></div>
      <div class="tag-row"><span class="status-chip ${gate.cls}">${escapeHtml(gate.label)}</span><span class="tag">${escapeHtml(record.version)}</span><span class="tag">${escapeHtml(record.volume)}</span>${tags}</div>
    </article>`;
  }).join("");
}
function renderBoard() {
  const rows = state.board.map((id) => findDataset(id)).filter(Boolean).filter((item) => !item.archived);
  if (!rows.length) { els.boardItems.innerHTML = `<div class="empty-state">${t("empty.board")}</div>`; return; }
  els.boardItems.innerHTML = rows.map((record) => {
    const gate = rightsGate(rightsFor(record.id));
    return `<div class="board-item ${record.id === state.selectedId ? "active" : ""}" data-id="${record.id}" role="button" tabindex="0"><span class="board-icon" aria-hidden="true">${record.category.includes("织") || record.category.includes("纹") ? "T" : "D"}</span><span><strong>${escapeHtml(record.name)}</strong><span>${escapeHtml(splitFor(record.id).split)} · ${escapeHtml(record.category)}</span></span><span class="status-chip ${gate.cls}">${escapeHtml(gate.label)}</span><button class="mini-btn board-item-remove" data-action="remove" data-id="${record.id}" type="button" aria-label="${escapeHtml(t("aria.removeFromBoard", { name: record.name }))}" title="${escapeHtml(t("board.removeTitle"))}">${t("btn.remove")}</button></div>`;
  }).join("");
}
function renderSplitLanes() {
  els.splitLanes.innerHTML = Object.entries(splitLabels).map(([split, meta]) => {
    const assignments = state.splits.filter((item) => item.split === split).map((assignment) => ({ assignment, dataset: findDataset(assignment.dataset_id) })).filter((row) => row.dataset && !row.dataset.archived);
    const items = assignments.length ? assignments.map(({ assignment, dataset }) => `<div class="split-row"><div><strong>${escapeHtml(dataset.name)}</strong><span>${escapeHtml(assignment.leakage_risk)} leakage ${assignment.locked ? "· locked" : ""}</span></div><div class="split-actions">${split !== "train" ? `<button class="mini-btn" data-split="train" data-id="${dataset.id}" type="button">Train</button>` : ""}${split !== "eval" ? `<button class="mini-btn" data-split="eval" data-id="${dataset.id}" type="button">Eval</button>` : ""}${split !== "holdout" ? `<button class="mini-btn" data-split="holdout" data-id="${dataset.id}" type="button">Hold</button>` : ""}</div></div>`).join("") : `<div class="empty-state">${escapeHtml(t("split.empty", { title: meta.title }))}</div>`;
    return `<div class="split-lane" data-split="${split}"><div class="split-lane-head"><h4>${meta.title}</h4><span class="tag">${assignments.length}</span></div><p class="tag">${meta.hint}</p>${items}</div>`;
  }).join("");
}

function renderViewerMode() {
  els.artifactViewer.className = `artifact-viewer mode-${state.viewMode}`;
  document.querySelectorAll(".view-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === state.viewMode));
}

function initDragAndDrop() {
  els.datasetList.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".dataset-card");
    if (!card || card.classList.contains("archived")) return;
    card.classList.add("dragging");
    event.dataTransfer.setData("text/plain", card.dataset.id);
    event.dataTransfer.effectAllowed = "copy";
  });
  els.datasetList.addEventListener("dragend", (event) => event.target.closest(".dataset-card")?.classList.remove("dragging"));
  ["dragenter", "dragover"].forEach((type) => els.boardDrop.addEventListener(type, (event) => { event.preventDefault(); els.boardDrop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((type) => els.boardDrop.addEventListener(type, () => els.boardDrop.classList.remove("is-over")));
  els.boardDrop.addEventListener("drop", (event) => { event.preventDefault(); addToBoard(event.dataTransfer.getData("text/plain")); });
}
window.addEventListener("DOMContentLoaded", () => {
  // cacheElements/initEvents/initDragAndDrop only wire up DOM refs and listeners that
  // read `state` lazily at event time, so they can run immediately; only the initial
  // render needs to wait for loadInitialState()'s (bounded, always-resolving) server probe.
  cacheElements();
  i18n.applyStatic(document);
  initEvents();
  initDragAndDrop();
  loadInitialState().then((stored) => {
    if (stored) state = stored;
    ensureGenerationState();
    saveState();
    render();
  });
});

/* Validated research platform overrides: evidence-aware rights, sample leakage, schema/checksum registry, append-only audit hash-chain. */
function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}
function rotr32(x, n) { return (x >>> n) | (x << (32 - n)); }
// Standalone FIPS 180-4 SHA-256 (synchronous, no Web Crypto dependency) so audit hashes stay real digests
// instead of a forgeable 32-bit checksum, while every existing chainHash() call site stays synchronous.
function sha256Hex(bytes) {
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  const len = bytes.length;
  const bitLen = len * 8;
  const bitLenHi = Math.floor(bitLen / 0x100000000) >>> 0;
  const bitLenLo = (bitLen % 0x100000000) >>> 0;
  let totalLen = len + 9;
  while (totalLen % 64 !== 0) totalLen++;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(totalLen - 8, bitLenHi, false);
  dv.setUint32(totalLen - 4, bitLenLo, false);
  const w = new Uint32Array(64);
  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(w[i - 15], 7) ^ rotr32(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr32(w[i - 2], 17) ^ rotr32(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((x) => x.toString(16).padStart(8, "0")).join("");
}
function chainHash(value) {
  const text = stableStringify(value);
  return `sha256:${sha256Hex(new TextEncoder().encode(text))}`;
}
function createAuditEntry(action, target, detail, previousHash, sequence) {
  const entry = { at: new Date().toISOString(), sequence, previous_hash: previousHash, action, target, detail };
  entry.entry_hash = chainHash(entry);
  return entry;
}
function createInitialState() {
  const bundle = window.JXICH_MANIFESTS || {};
  const datasetManifest = bundle.dataset_manifest || { manifest_version: "local-empty", datasets: [] };
  const rightsManifest = bundle.rights_manifest || { rights: [] };
  const splitManifest = bundle.split_manifest || { assignments: [], split_policy: {} };
  const kgManifest = bundle.kg_claims || { claims: [] };
  const evidenceManifest = bundle.evidence_manifest || { evidence_files: [] };
  const sampleManifest = bundle.sample_manifest || { samples: [], sample_policy: {} };
  const checksumManifest = bundle.checksum_manifest || { files: [] };
  const datasets = datasetManifest.datasets.map((item) => ({
    id: item.dataset_id,
    name: item.name,
    category: item.category || t("ds.uncategorized"),
    source_url: item.source_url || "",
    owner: item.owner || "",
    volume: item.volume || t("ds.volumeTbd"),
    collection_date: item.collection_date || "unknown",
    version: item.version || "v0",
    checksum: item.checksum || "sha256:missing",
    annotation_schema: item.annotation_schema || "pending",
    risk_level: item.risk_level || "medium",
    readiness: Number(item.readiness || 0),
    status: item.status || "draft",
    archived: Boolean(item.archived),
    tags: item.tags || [],
    supports: item.supports || ["2D"],
    reuse_layers: item.reuse_layers || ["appearance", "rights"],
    analysis: item.analysis || t("ds.analysisTbd"),
  }));
  const board = datasets.filter((item) => !item.archived).slice(0, 2).map((item) => item.id);
  const stateObject = {
    version: datasetManifest.manifest_version || "2026.07-validated-platform",
    splitPolicy: splitManifest.split_policy || {},
    samplePolicy: sampleManifest.sample_policy || {},
    datasets,
    rights: rightsManifest.rights || [],
    splits: splitManifest.assignments || [],
    kgClaims: kgManifest.claims || [],
    evidenceFiles: evidenceManifest.evidence_files || [],
    samples: sampleManifest.samples || [],
    checksumFiles: checksumManifest.files || [],
    board,
    selectedId: board[0] || datasets[0]?.id || null,
    viewMode: "2d",
    auditLog: [],
    auditSequence: 0,
  };
  const first = createAuditEntry("init_from_validated_manifests", "system", "Loaded dataset, rights, split, KG, evidence, sample and checksum manifests.", "GENESIS", 1);
  stateObject.auditSequence = 1;
  stateObject.auditLog = [first];
  return stateObject;
}
// Deliberately reads localStorage directly (not via Storage.get) so this stays a
// guaranteed-synchronous, network-independent fallback — the exact behavior the app had
// before the opt-in server existed. loadInitialState() below tries the server first and
// falls back to this unchanged.
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.datasets || !parsed.rights || !parsed.splits) return null;
    return normalizeStoredState(parsed);
  } catch (error) { console.warn("Failed to load stored state", error); return null; }
}
// Startup entry point: probes the optional server (bounded by STORAGE_HEALTH_TIMEOUT_MS),
// tries to load state from it if reachable, and otherwise (or on any server-side failure)
// falls back to the plain localStorage path unchanged. Always resolves — never rejects —
// so callers don't need their own try/catch around app startup.
async function loadInitialState() {
  await Storage.init();
  if (Storage.serverAvailable) {
    try {
      const remote = await Storage.get(STORAGE_KEY);
      if (remote && remote.datasets && remote.rights && remote.splits) return normalizeStoredState(remote);
    } catch (error) {
      console.warn("loadInitialState: server-backed load failed, falling back to localStorage", error);
    }
  }
  return loadState();
}
function audit(action, target, detail) {
  const previousHash = state.auditLog[0]?.entry_hash || "GENESIS";
  const sequence = (state.auditSequence || 0) + 1;
  const entry = createAuditEntry(action, target, detail, previousHash, sequence);
  state.auditSequence = sequence;
  state.auditLog.unshift(entry);
  saveState();
}
function evidenceFor(datasetId = state.selectedId) {
  return (state.evidenceFiles || []).filter((file) => file.dataset_id === datasetId);
}
function verifiedEvidenceFor(datasetId = state.selectedId) {
  return evidenceFor(datasetId).filter((file) => file.verification_status === "verified" && file.sha256 && file.sha256 !== "sha256:pending");
}
// verifiedEvidenceFor() only checks the *asserted* verification_status; this separately reports how many
// of those verified entries have an actual source file backing them (vs. placeholder/demo records).
function authenticEvidenceFor(datasetId = state.selectedId) {
  return verifiedEvidenceFor(datasetId).filter((file) => file.source_file_present === true);
}
// Real, on-disk image files (as opposed to authentic-but-non-image evidence like the P12 CSV):
// used to render an actual photo gallery instead of the CSS specimen mockup in the board pane.
function imageEvidenceFor(datasetId = state.selectedId) {
  return authenticEvidenceFor(datasetId).filter((file) => file.source_file_path && /\.(jpe?g|png|webp|gif)$/i.test(file.file_name || ""));
}
// Conditions recorded with the rights record that the gate enforces (in addition to scope and evidence):
// an expiry date in the past blocks; a consent form that is not "not_applicable" must be backed by an
// authentic evidence file (matched by id, or by an evidence_type naming consent); sensitive-culture review caps at conditional.
function isExpired(expiry, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(expiry || ""))) return false;
  return new Date(`${expiry}T23:59:59Z`) < today;
}
function consentRequired(record) {
  const id = String(record?.consent_form_id || "");
  return Boolean(id) && !id.startsWith("not_applicable");
}
function authenticConsentFor(record, authenticEvidence) {
  return authenticEvidence.some((file) => file.evidence_file_id === record.consent_form_id || /consent/i.test(file.evidence_type || ""));
}
function rightsGate(record = rightsFor()) {
  if (!record) return { gate: "blocked", label: t("gate.blocked"), cls: "block", reason: t("gate.reason.noRecord") };
  const authenticEvidence = authenticEvidenceFor(record.dataset_id);
  if (!authenticEvidence.length) return { gate: "blocked", label: t("gate.blocked"), cls: "block", reason: t("gate.reason.noAuthentic") };
  if (record.rights_gate === "blocked") return { gate: "blocked", label: t("gate.blocked"), cls: "block", reason: t("gate.reason.markedBlocked") };
  if (!record.permission_scope?.research) return { gate: "blocked", label: t("gate.blocked"), cls: "block", reason: t("gate.reason.noResearch") };
  if (isExpired(record.expiry_date)) return { gate: "blocked", label: t("gate.blocked"), cls: "block", reason: t("gate.reason.expired") };
  if (consentRequired(record) && !authenticConsentFor(record, authenticEvidence)) return { gate: "blocked", label: t("gate.blocked"), cls: "block", reason: t("gate.reason.noConsent") };
  const evidenceScopes = new Set(authenticEvidence.flatMap((file) => file.permission_scope || []));
  const hasPublicationEvidence = evidenceScopes.has("publication") || evidenceScopes.has("public_demo");
  if (!record.permission_scope?.publication || !record.permission_scope?.public_demo || !hasPublicationEvidence) return { gate: "conditional", label: t("gate.conditional"), cls: "warn", reason: t("gate.reason.conditional") };
  if (record.sensitive_culture_status === "review_required") return { gate: "conditional", label: t("gate.conditional"), cls: "warn", reason: t("gate.reason.sensitiveReview") };
  return { gate: "pass", label: t("gate.pass"), cls: "good", reason: t("gate.reason.pass") };
}
function verifyAuditChain() {
  const rows = [...(state.auditLog || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  let previous = "GENESIS";
  for (const row of rows) {
    const copy = { ...row };
    const declaredHash = copy.entry_hash;
    delete copy.entry_hash;
    if (row.previous_hash !== previous) return { pass: false, reason: `Broken previous_hash at sequence ${row.sequence}` };
    if (chainHash(copy) !== declaredHash) return { pass: false, reason: `Hash mismatch at sequence ${row.sequence}` };
    previous = declaredHash;
  }
  return { pass: true, reason: `${rows.length} chained audit entries verified` };
}
function validateSchema() {
  const required = ["id", "name", "source_url", "owner", "version", "checksum", "annotation_schema", "risk_level", "readiness"];
  const missing = [];
  state.datasets.forEach((dataset) => required.forEach((key) => { if (dataset[key] === undefined || dataset[key] === "") missing.push(`${dataset.id}.${key}`); }));
  return { pass: missing.length === 0, count: missing.length, detail: missing.slice(0, 5).join(", ") || "All dataset records satisfy required schema fields" };
}
// Registry-format check only (no file bytes are re-read); real byte-level integrity is scripts/hash_files.mjs --verify.
function validateChecksumRegistry() {
  const files = state.checksumFiles || [];
  const bad = files.filter((file) => !String(file.sha256 || "").startsWith("sha256:") || String(file.sha256).includes("pending"));
  return { pass: files.length > 0 && bad.length === 0, count: files.length, detail: `${files.length} local manifest file hashes registered` };
}
function validateSampleLeakage() {
  const keys = ["object_id", "event_id", "capture_session_id", "duplicate_group_id", "phash"];
  const violations = [];
  keys.forEach((key) => {
    const map = new Map();
    (state.samples || []).forEach((sample) => {
      const value = sample[key];
      if (!value) return;
      if (!map.has(value)) map.set(value, new Set());
      map.get(value).add(sample.split);
    });
    map.forEach((splits, value) => {
      if (splits.has("train") && splits.has("eval")) violations.push(`${key}:${value}`);
    });
  });
  return { pass: violations.length === 0, count: violations.length, detail: violations.length ? violations.slice(0, 4).join(", ") : `${state.samples?.length || 0} samples checked; no train/eval leakage` };
}
function renderRights() {
  const dataset = findDataset();
  const rights = rightsFor(dataset?.id);
  if (!dataset || !rights) { els.rightsFields.innerHTML = `<div class="empty-state">${t("empty.rights")}</div>`; els.rightsToggles.innerHTML = ""; return; }
  const gate = rightsGate(rights);
  els.rightsGateStatus.textContent = gate.label;
  els.rightsGateStatus.className = `status-chip ${gate.cls}`;
  const evidence = evidenceFor(dataset.id);
  const verifiedEvidence = verifiedEvidenceFor(dataset.id);
  const authenticEvidence = authenticEvidenceFor(dataset.id);
  const fields = {
    rights_id: rights.rights_id,
    license: rights.license,
    license_document_id: rights.license_document_id,
    consent_form_id: rights.consent_form_id,
    verified_evidence: `${verifiedEvidence.length}/${evidence.length}`,
    evidence_authenticity: verifiedEvidence.length
      ? `${authenticEvidence.length}/${verifiedEvidence.length} verified entries have a real source file attached — rest are placeholder/demo records`
      : "no verified evidence on file",
    portrait_status: rights.portrait_status,
    sensitive_culture_status: rights.sensitive_culture_status,
    cross_border_transfer_status: rights.cross_border_transfer_status,
    expiry_date: rights.expiry_date,
  };
  els.rightsFields.innerHTML = Object.entries(fields).map(([key, value]) => `<div class="field-row"><span>${escapeHtml(key)}</span><span>${escapeHtml(value)}</span></div>`).join("");
  els.rightsToggles.innerHTML = Object.entries(rights.permission_scope).map(([key, value]) => `<label class="rights-toggle"><input type="checkbox" data-permission="${key}" ${value ? "checked" : ""} /> ${escapeHtml(key)}</label>`).join("");
}
function renderAuditLog() {
  const chain = verifyAuditChain();
  if (els.auditSealStatus) {
    els.auditSealStatus.textContent = chain.pass ? "hash-chain verified" : "hash-chain broken";
    els.auditSealStatus.className = `status-chip ${chain.pass ? "good" : "block"}`;
  }
  if (!state.auditLog.length) { els.auditLog.innerHTML = `<div class="empty-state">${t("empty.audit")}</div>`; return; }
  els.auditLog.innerHTML = state.auditLog.slice(0, 30).map((row) => `<div class="audit-row"><strong>${escapeHtml(row.sequence)} · ${escapeHtml(row.action)} · ${escapeHtml(row.target)}</strong><span>${escapeHtml(row.at)}</span><span>${escapeHtml(row.detail)}</span><span class="hash">${escapeHtml(row.entry_hash)} ← ${escapeHtml(row.previous_hash)}</span></div>`).join("");
}

function validateEvidence() {
  const activeAssignments = (state.splits || []).filter((assignment) => assignment.split === "train" || assignment.split === "eval");
  const failures = [];
  activeAssignments.forEach((assignment) => {
    const verified = verifiedEvidenceFor(assignment.dataset_id);
    const gate = rightsGate(rightsFor(assignment.dataset_id));
    if (!verified.length) failures.push(`${assignment.dataset_id}: no verified evidence`);
    if (gate.gate === "blocked") failures.push(`${assignment.dataset_id}: rights blocked in active split`);
  });
  const holdoutPending = (state.splits || []).filter((assignment) => assignment.split === "holdout").filter((assignment) => !verifiedEvidenceFor(assignment.dataset_id).length).length;
  const allEvidence = state.evidenceFiles || [];
  const placeholderCount = allEvidence.filter((file) => file.source_file_present === false).length;
  const authenticityNote = placeholderCount
    ? ` — ${placeholderCount}/${allEvidence.length} evidence records are placeholder/demo entries with no real source file on disk`
    : "";
  return {
    pass: failures.length === 0,
    count: activeAssignments.length,
    pending: holdoutPending,
    detail: (failures.length ? failures.slice(0, 4).join(", ") : `${activeAssignments.length} train/eval datasets have verified evidence; ${holdoutPending} pending datasets isolated in holdout`) + authenticityNote,
  };
}

window.addEventListener("DOMContentLoaded", initSplitViewNavigation);

/* Reuse linkage refinement: connect reuse layers to ontology, KG provenance and rights conditions. */
const reuseLayerModel = {
  semantic: {
    get label() { return t("reuse.semantic"); },
    ontology: "heritage_semantics",
    predicate: "supportsSemanticReuse",
    get purpose() { return t("reuse.semanticPurpose"); },
    rights: "research evidence required",
    route: ["dataset", "ontology", "KG", "prompt"]
  },
  history: {
    get label() { return t("reuse.history"); },
    ontology: "symbolic_history",
    predicate: "supportsHistoricalNarrative",
    get purpose() { return t("reuse.historyPurpose"); },
    rights: "publication evidence required",
    route: ["dataset", "source", "expert", "claim"]
  },
  appearance: {
    get label() { return t("reuse.appearance"); },
    ontology: "visual_appearance",
    predicate: "supportsVisualReuse",
    get purpose() { return t("reuse.appearancePurpose"); },
    rights: "research evidence required",
    route: ["image", "feature", "split", "model"]
  },
  inheritor: {
    get label() { return t("reuse.inheritor"); },
    ontology: "inheritor_context",
    predicate: "requiresInheritorConsent",
    get purpose() { return t("reuse.inheritorPurpose"); },
    rights: "full consent and public-demo evidence required",
    route: ["person", "consent", "review", "limited reuse"]
  },
  rights: {
    get label() { return t("reuse.rights"); },
    ontology: "rights_governance",
    predicate: "requiresRightsGate",
    get purpose() { return t("reuse.rightsPurpose"); },
    rights: "verified evidence hash required",
    route: ["evidence", "hash", "gate", "export"]
  }
};
function activeReuseLayers(dataset = findDataset()) {
  if (!dataset) return [];
  return (dataset.reuse_layers || []).map((id) => ({ id, ...(reuseLayerModel[id] || {}) })).filter((item) => item.label);
}
function reuseGateState(layerId, dataset = findDataset()) {
  const gate = rightsGate(rightsFor(dataset?.id));
  if (layerId === "inheritor" && gate.gate !== "pass") return { state: "blocked", label: "blocked by consent" };
  if ((layerId === "history" || layerId === "semantic") && gate.gate === "blocked") return { state: "blocked", label: "rights blocked" };
  if (gate.gate === "conditional") return { state: "conditional", label: "conditional reuse" };
  return { state: "pass", label: "linked" };
}
function renderReuseActions() {
  const record = findDataset();
  if (!record) { els.reuseActions.innerHTML = ""; if (els.reuseMap) els.reuseMap.innerHTML = ""; return; }
  els.reuseActions.innerHTML = reuseCatalog.map((item) => {
    const active = record.reuse_layers.includes(item.id);
    const gateState = reuseGateState(item.id, record);
    return `<button class="reuse-btn ${active ? "active" : ""} ${gateState.state === "blocked" ? "blocked" : ""}" data-reuse="${item.id}" type="button">${item.icon}<strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(gateState.label)}</span></button>`;
  }).join("");
  if (els.reuseMap) {
    const layers = activeReuseLayers(record);
    els.reuseMap.innerHTML = layers.length ? layers.map((layer) => {
      const gateState = reuseGateState(layer.id, record);
      return `<div class="reuse-map-card ${gateState.state === "blocked" ? "blocked" : gateState.state === "conditional" ? "conditional" : ""}"><strong>${escapeHtml(layer.label)}</strong><span>${escapeHtml(layer.purpose)}</span><div class="reuse-route">${layer.route.map((step) => `<b>${escapeHtml(step)}</b>`).join("")}</div><span>${escapeHtml(layer.ontology)} · ${escapeHtml(layer.predicate)} · ${escapeHtml(layer.rights)}</span></div>`;
    }).join("") : `<div class="empty-state">${t("empty.reuse")}</div>`;
  }
}
function renderSelectedSummary() {
  const record = findDataset();
  if (!record) { els.selectedSummary.innerHTML = `<div class="empty-state">${t("empty.selected")}</div>`; return; }
  const rights = rightsFor(record.id), gate = rightsGate(rights), split = splitFor(record.id);
  const layers = activeReuseLayers(record);
  const chips = layers.map((layer) => `<span class="reuse-linked-chip">${escapeHtml(layer.label)}</span>`).join("");
  els.selectedSummary.innerHTML = `<div class="summary-title"><div><strong>${escapeHtml(record.name)}</strong><span>${escapeHtml(record.id)} · ${escapeHtml(record.category)}</span></div><span class="status-chip ${gate.cls}">${escapeHtml(gate.label)}</span></div><p class="summary-note">${escapeHtml(record.analysis)}</p><div>${chips || `<span class="tag">${t("tag.noReuse")}</span>`}</div><div class="summary-grid"><div class="summary-cell"><span>Version</span><strong>${escapeHtml(record.version)}</strong></div><div class="summary-cell"><span>Checksum</span><strong>${escapeHtml(record.checksum)}</strong></div><div class="summary-cell"><span>Split</span><strong>${escapeHtml(split.split)}${split.locked ? " · locked" : ""}</strong></div><div class="summary-cell"><span>Rights</span><strong>${escapeHtml(gate.reason)}</strong></div><div class="summary-cell"><span>Reuse Predicate</span><strong>${escapeHtml(layers.map((l) => l.predicate).join(" / ") || "pending")}</strong></div><div class="summary-cell"><span>Supports</span><strong>${escapeHtml(record.supports.join(" / "))}</strong></div></div>`;
}
function renderEvidenceGallery() {
  if (!els.evidenceGallery) return;
  const dataset = findDataset();
  const images = dataset ? imageEvidenceFor(dataset.id) : [];
  if (els.evidenceGalleryNote) els.evidenceGalleryNote.textContent = `${images.length} real image${images.length === 1 ? "" : "s"}`;
  if (!dataset || !images.length) {
    els.evidenceGallery.innerHTML = `<div class="empty-state">${t("empty.gallery")}</div>`;
    return;
  }
  els.evidenceGallery.innerHTML = images.map((file) => `<a class="evidence-thumb" href="${escapeHtml(file.source_file_path)}" target="_blank" rel="noopener"><img src="${escapeHtml(file.source_file_path)}" alt="${escapeHtml(file.file_name)}" loading="lazy" /><span>${escapeHtml(file.file_name)}</span></a>`).join("");
}
function renderGraphAndOntology() {
  const dataset = findDataset();
  if (!dataset) { els.kgTitle.textContent = t("gov.waiting"); els.kgReadiness.textContent = "-"; els.graphLines.innerHTML = ""; els.graphNodes.innerHTML = `<div class="empty-state">${t("empty.graph")}</div>`; els.ontologyFields.innerHTML = ""; els.kgTable.innerHTML = ""; return; }
  const claims = claimsFor(dataset.id), rights = rightsFor(dataset.id), gate = rightsGate(rights), layers = activeReuseLayers(dataset);
  els.kgTitle.textContent = dataset.name;
  els.kgReadiness.textContent = `${dataset.readiness}%`;
  els.kgReadiness.className = `status-chip ${gate.cls}`;
  const nodeBase = [
    { id: "dataset", label: dataset.category, type: "core", x: 180, y: 56 },
    { id: "schema", label: "Annotation", type: "semantic", x: 64, y: 142 },
    { id: "rights", label: "Rights", type: "rights", x: 296, y: 142 },
    { id: "split", label: splitFor(dataset.id).split, type: "semantic", x: 180, y: 252 },
  ];
  const reuseNodes = layers.slice(0, 4).map((layer, index) => ({ id: `reuse-${layer.id}`, label: layer.label, type: layer.id === "rights" || layer.id === "inheritor" ? "rights" : "semantic", x: [92, 180, 268, 180][index], y: [214, 188, 214, 126][index] }));
  const nodes = nodeBase.concat(reuseNodes);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const edges = [["dataset", "schema"], ["dataset", "rights"], ["schema", "split"], ["rights", "split"]].concat(reuseNodes.map((node) => ["dataset", node.id])).concat(reuseNodes.map((node) => [node.id, "split"]));
  els.graphLines.innerHTML = edges.map(([from, to]) => { const a = nodeMap.get(from), b = nodeMap.get(to); return a && b ? `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>` : ""; }).join("");
  els.graphNodes.innerHTML = nodes.map((node) => `<div class="graph-node ${node.type}" style="left:${(node.x / 360) * 100}%; top:${(node.y / 300) * 100}%"><strong>${escapeHtml(node.label)}</strong><span>${escapeHtml(node.type)}</span></div>`).join("");
  const ontology = { dataset_id: dataset.id, category: dataset.category, source_url: dataset.source_url, owner: dataset.owner, annotation_schema: dataset.annotation_schema, reuse_layers: layers.map((l) => `${l.ontology}:${l.predicate}`).join(" / ") || "pending", split_policy: (state.splitPolicy.unit_of_separation || []).join(" / ") || "pending", rights_gate: gate.label };
  els.ontologyFields.innerHTML = Object.entries(ontology).map(([key, value]) => `<div class="field-row"><span>${escapeHtml(key)}</span><span>${escapeHtml(value)}</span></div>`).join("");
  const reuseRows = layers.map((layer) => `<tr><td>REUSE-${escapeHtml(layer.id)}</td><td>${escapeHtml(layer.predicate)}</td><td>${escapeHtml(layer.ontology)}<br><span class="tag">${escapeHtml(layer.rights)}</span></td><td><span class="status-text ${reuseGateState(layer.id, dataset).state === "blocked" ? "block" : reuseGateState(layer.id, dataset).state === "conditional" ? "warn" : "good"}">${escapeHtml(reuseGateState(layer.id, dataset).label)}</span></td></tr>`).join("");
  const claimRows = claims.map((claim) => `<tr><td>${escapeHtml(claim.claim_id)}<br><span class="tag">${escapeHtml(claim.subject)} → ${escapeHtml(claim.object)}</span></td><td>${escapeHtml(claim.predicate)}<br><span class="tag">${Math.round(claim.confidence * 100)}%</span></td><td>${escapeHtml(claim.evidence_id)}<br><span class="tag">${escapeHtml(claim.source_url)}</span></td><td><select class="claim-status" data-claim="${claim.claim_id}">${["source_verified", "expert_review_required", "inheritor_review_required", "access_pending", "rejected"].map((status) => `<option value="${status}" ${status === claim.review_status ? "selected" : ""}>${status}</option>`).join("")}</select></td></tr>`).join("");
  els.kgTable.innerHTML = (reuseRows + claimRows) || `<tr><td colspan="4">${t("empty.kg")}</td></tr>`;
}

/* Generation Lab connector: auditable text-to-image / image-to-image workflow. */
const generationDefaultSettings = {
  mode: "text-to-image",
  imageBackend: "comfyui",
  imageEndpoint: "",
  llmEndpoint: "",
  modelId: "SDXL-or-FLUX-heritage-workflow-v0.1",
  seed: "20260701",
  inputImageHash: "",
  negativePrompt: "watermark, logo, distorted weave, low-resolution texture, inaccurate heritage symbol, unauthorized portrait",
  prompt: "",
  promptDatasetId: "",
};

function defaultGenerationState() {
  return {
    settings: { ...generationDefaultSettings },
    runs: [],
  };
}

function ensureGenerationState() {
  if (!state.generation || typeof state.generation !== "object") state.generation = defaultGenerationState();
  state.generation.settings = { ...generationDefaultSettings, ...(state.generation.settings || {}) };
  state.generation.runs = Array.isArray(state.generation.runs) ? state.generation.runs : [];
  return state.generation;
}

// Keeps every record a returning browser already has locally (including edits to
// existing entries and user-created datasets), but appends any record that's new in
// the bundled manifest and wasn't present in localStorage yet — otherwise a manifest
// update (e.g. a newly registered dataset) would be silently invisible to anyone who
// already has older state cached, with no error, just a card that never appears.
function mergeById(freshArr, storedArr, key) {
  if (!Array.isArray(storedArr)) return freshArr;
  const storedIds = new Set(storedArr.map((item) => item?.[key]));
  const newFromFresh = freshArr.filter((item) => !storedIds.has(item?.[key]));
  return [...storedArr, ...newFromFresh];
}
// Bump whenever the bundled manifests change in a way stored browser state must not mask
// (stored records otherwise take precedence over bundled ones in mergeById).
const VALIDATION_REVISION = "validated-20261003-release-v1";
function normalizeStoredState(stored) {
  const fresh = createInitialState();
  const needsValidationRefresh = stored.validationRevision !== VALIDATION_REVISION;
  const migrated = {
    ...fresh,
    ...stored,
    validationRevision: VALIDATION_REVISION,
    version: needsValidationRefresh ? fresh.version : (stored.version || fresh.version),
    datasets: needsValidationRefresh ? fresh.datasets : mergeById(fresh.datasets, stored.datasets, "id"),
    rights: needsValidationRefresh ? fresh.rights : mergeById(fresh.rights, stored.rights, "dataset_id"),
    splits: needsValidationRefresh ? fresh.splits : mergeById(fresh.splits, stored.splits, "dataset_id"),
    kgClaims: needsValidationRefresh ? fresh.kgClaims : mergeById(fresh.kgClaims, stored.kgClaims, "claim_id"),
    evidenceFiles: needsValidationRefresh ? fresh.evidenceFiles : mergeById(fresh.evidenceFiles, stored.evidenceFiles, "evidence_file_id"),
    samples: needsValidationRefresh ? fresh.samples : mergeById(fresh.samples, stored.samples, "sample_id"),
    checksumFiles: needsValidationRefresh ? fresh.checksumFiles : mergeById(fresh.checksumFiles, stored.checksumFiles, "path"),
    samplePolicy: needsValidationRefresh ? fresh.samplePolicy : (stored.samplePolicy || fresh.samplePolicy),
    splitPolicy: stored.splitPolicy || fresh.splitPolicy,
    generation: stored.generation || defaultGenerationState(),
  };
  // A revision bump forces a fresh genesis chain rather than bridging into it: the bundled records were
  // replaced, and entries from older builds may be hashed under an older algorithm (e.g. the pre-SHA-256
  // 32-bit checksum) that today's chainHash() cannot re-verify.
  const chainReady = !needsValidationRefresh && Array.isArray(migrated.auditLog) && migrated.auditLog.length && migrated.auditLog.every((row) => row.entry_hash && row.previous_hash && row.sequence);
  if (!chainReady) {
    const migrationEntry = createAuditEntry("reset_audit_chain_for_revision", "system", `Bundled manifests refreshed to ${VALIDATION_REVISION}; audit log restarted from a new SHA-256 genesis entry.`, "GENESIS", 1);
    migrated.auditLog = [migrationEntry];
    migrated.auditSequence = 1;
  } else {
    migrated.auditSequence = Math.max(...migrated.auditLog.map((row) => row.sequence || 0), 0);
  }
  state = migrated;
  ensureGenerationState();
  return state;
}

function generationModeLabel(mode) {
  return {
    "text-to-image": "Text-to-Image",
    "image-to-image": "Image-to-Image",
    inpainting: "Inpainting",
    controlnet: "ControlNet",
  }[mode] || mode || "text-to-image";
}

function generationGate(dataset = findDataset()) {
  if (!dataset) return { state: "blocked", label: t("gen.state.noDataset"), cls: "block", reason: t("gen.state.noDatasetReason") };
  const rights = rightsFor(dataset.id);
  const gate = rightsGate(rights);
  const settings = ensureGenerationState().settings;
  if (gate.gate === "blocked") return { state: "blocked", label: t("gen.state.blocked"), cls: "block", reason: gate.reason };
  const derivativeMode = ["image-to-image", "inpainting", "controlnet"].includes(settings.mode);
  const needsDerivative = derivativeMode || activeReuseLayers(dataset).some((layer) => ["appearance", "history", "semantic"].includes(layer.id));
  if (needsDerivative && !rights.permission_scope?.derivative) {
    return { state: "conditional", label: t("gen.state.sketch"), cls: "warn", reason: t("gen.state.sketchReason") };
  }
  if (gate.gate === "conditional") return { state: "conditional", label: t("gen.state.conditional"), cls: "warn", reason: gate.reason };
  return { state: "pass", label: t("gen.state.pass"), cls: "good", reason: t("gen.state.passReason") };
}

function generationPromptTemplate(dataset = findDataset()) {
  if (!dataset) return t("prompt.noDataset");
  const gate = generationGate(dataset);
  const layers = activeReuseLayers(dataset);
  const sep = t("prompt.sep");
  const layerText = layers.length ? layers.map((layer) => t("prompt.layerItem", { label: layer.label, purpose: layer.purpose })).join(sep) : t("tag.noReuse");
  const ontologyText = layers.length ? layers.map((layer) => `${layer.ontology}:${layer.predicate}`).join(sep) : "pending";
  const claimText = claimsFor(dataset.id).slice(0, 4).map((claim) => `${claim.subject} ${claim.predicate} ${claim.object}`).join(sep) || t("prompt.noClaim");
  return [
    t("prompt.task"),
    t("prompt.dataset", { name: dataset.name, category: dataset.category, version: dataset.version, split: splitFor(dataset.id).split }),
    t("prompt.layers", { layers: layerText }),
    t("prompt.kg", { ontology: ontologyText, claims: claimText }),
    t("prompt.visual"),
    t("prompt.rights", { label: gate.label, reason: gate.reason }),
    t("prompt.output"),
  ].join("\n");
}

function setControlValue(control, value) {
  if (!control || document.activeElement === control) return;
  control.value = value ?? "";
}

function syncGenerationSettings({ save = false } = {}) {
  const generation = ensureGenerationState();
  const settings = generation.settings;
  if (els.generationMode) settings.mode = els.generationMode.value;
  if (els.imageBackend) settings.imageBackend = els.imageBackend.value;
  if (els.imageEndpoint) settings.imageEndpoint = els.imageEndpoint.value.trim();
  if (els.llmEndpoint) settings.llmEndpoint = els.llmEndpoint.value.trim();
  if (els.generationModel) settings.modelId = els.generationModel.value.trim() || generationDefaultSettings.modelId;
  if (els.generationSeed) settings.seed = els.generationSeed.value.trim() || generationDefaultSettings.seed;
  if (els.inputImageHash) settings.inputImageHash = els.inputImageHash.value.trim();
  if (els.negativePrompt) settings.negativePrompt = els.negativePrompt.value.trim() || generationDefaultSettings.negativePrompt;
  if (els.generationPrompt) settings.prompt = els.generationPrompt.value.trim();
  if (save) saveState();
  return generation;
}

function hydrateGenerationControls() {
  const generation = ensureGenerationState();
  const settings = generation.settings;
  if (!settings.prompt) {
    settings.prompt = generationPromptTemplate();
    settings.promptDatasetId = state.selectedId || "";
  }
  setControlValue(els.generationMode, settings.mode);
  setControlValue(els.imageBackend, settings.imageBackend);
  setControlValue(els.imageEndpoint, settings.imageEndpoint);
  setControlValue(els.llmEndpoint, settings.llmEndpoint);
  setControlValue(els.generationModel, settings.modelId);
  setControlValue(els.generationSeed, settings.seed);
  setControlValue(els.inputImageHash, settings.inputImageHash);
  setControlValue(els.negativePrompt, settings.negativePrompt);
  setControlValue(els.generationPrompt, settings.prompt);
}

function buildGenerationManifest(status, responsePayload = null, message = "") {
  const generation = syncGenerationSettings();
  const settings = generation.settings;
  const dataset = findDataset();
  const gate = generationGate(dataset);
  const prompt = settings.prompt || generationPromptTemplate(dataset);
  const runId = `GEN-${Date.now().toString(36).toUpperCase()}`;
  const outputImageUrl = responsePayload?.image_url || responsePayload?.output_image_url || responsePayload?.data?.image_url || "";
  const responseHash = responsePayload ? chainHash(responsePayload) : "sha256:manifest-only";
  const manifest = {
    run_id: runId,
    created_at: new Date().toISOString(),
    content_class: "ai_generated_not_authentic",
    synthetic: true,
    dataset_id: dataset?.id || "NO-DATASET",
    dataset_version: dataset?.version || "unknown",
    mode: settings.mode,
    image_backend: settings.imageBackend,
    image_endpoint: settings.imageEndpoint ? "configured" : "manifest_only",
    llm_endpoint: settings.llmEndpoint ? "configured" : "not_configured",
    model_id: settings.modelId,
    workflow_hash: chainHash({ backend: settings.imageBackend, model: settings.modelId, mode: settings.mode }),
    prompt,
    prompt_hash: chainHash(prompt),
    negative_prompt_hash: chainHash(settings.negativePrompt),
    seed: settings.seed,
    input_image_hash: settings.inputImageHash || "not_applicable",
    output_image_url: outputImageUrl,
    output_image_hash: responsePayload?.output_sha256 || responsePayload?.sha256 || responseHash,
    rights_gate_status: gate.label,
    rights_gate_reason: gate.reason,
    reuse_layers: activeReuseLayers(dataset).map((layer) => ({ id: layer.id, ontology: layer.ontology, predicate: layer.predicate, gate: reuseGateState(layer.id, dataset).label })),
    kg_claim_ids: claimsFor(dataset?.id).map((claim) => claim.claim_id),
    status,
    message,
    audit_previous_hash: state.auditLog[0]?.entry_hash || "GENESIS",
  };
  manifest.manifest_hash = chainHash({ ...manifest, manifest_hash: undefined });
  return manifest;
}

function commitGenerationRun(manifest) {
  ensureGenerationState();
  state.generation.runs.unshift(manifest);
  state.generation.runs = state.generation.runs.slice(0, 80);
  audit("generation_manifest_commit", manifest.dataset_id, `${manifest.run_id} · ${manifest.status} · ${manifest.manifest_hash}`);
  state.generation.runs[0].audit_entry_hash = state.auditLog[0]?.entry_hash || "pending";
  state.generation.runs[0].manifest_hash = chainHash({ ...state.generation.runs[0], manifest_hash: undefined });
  saveState();
}

async function runGeneration() {
  const generation = syncGenerationSettings({ save: true });
  const dataset = findDataset();
  const gate = generationGate(dataset);
  if (gate.state === "blocked") {
    audit("generation_rejected", dataset?.id || "system", gate.reason);
    window.alert(t("alert.genBlocked", { reason: gate.reason }));
    render();
    return;
  }
  const endpoint = generation.settings.imageEndpoint;
  if (!endpoint) {
    commitGenerationRun(buildGenerationManifest("manifest_only", null, t("gen.msg.noBackend")));
    render();
    return;
  }
  if (els.generationStatus) {
    els.generationStatus.textContent = "running";
    els.generationStatus.className = "status-chip warn";
  }
  const payload = {
    mode: generation.settings.mode,
    backend: generation.settings.imageBackend,
    model_id: generation.settings.modelId,
    prompt: generation.settings.prompt || generationPromptTemplate(dataset),
    negative_prompt: generation.settings.negativePrompt,
    seed: generation.settings.seed,
    input_image_hash: generation.settings.inputImageHash,
    dataset_id: dataset?.id,
    reuse_layers: activeReuseLayers(dataset).map((layer) => layer.id),
    rights_gate: gate,
  };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    let responsePayload;
    try { responsePayload = text ? JSON.parse(text) : {}; }
    catch { responsePayload = { raw_response: text.slice(0, 1200) }; }
    const status = response.ok ? "completed" : "backend_error";
    const message = response.ok ? t("gen.msg.ok") : t("gen.msg.http", { status: response.status });
    commitGenerationRun(buildGenerationManifest(status, responsePayload, message));
  } catch (error) {
    commitGenerationRun(buildGenerationManifest("connector_failed", { error: error.message }, t("gen.msg.unreachable")));
  }
  render();
}

function renderGenerationPromptPreview() {
  if (!els.generationPromptPreview) return;
  const generation = ensureGenerationState();
  const settings = generation.settings;
  const prompt = settings.prompt || generationPromptTemplate();
  const gate = generationGate();
  els.generationPromptPreview.innerHTML = `<strong>Prompt Hash</strong><span>${escapeHtml(chainHash(prompt))}</span><strong>Governance</strong><span>${escapeHtml(gate.label)} · ${escapeHtml(gate.reason)}</span><strong>Backend Contract</strong><span>${escapeHtml(settings.imageBackend)} · ${escapeHtml(settings.modelId)} · ${settings.imageEndpoint ? "endpoint configured" : "manifest-only dry run"}</span>`;
}

function renderGenerationLab() {
  if (!els.generationStatus) return;
  const generation = ensureGenerationState();
  hydrateGenerationControls();
  const dataset = findDataset();
  const gate = generationGate(dataset);
  const settings = generation.settings;
  els.generationStatus.textContent = gate.state === "blocked" ? "rights blocked" : (settings.imageEndpoint ? "endpoint linked" : "manifest-only");
  els.generationStatus.className = `status-chip ${gate.cls === "block" ? "block" : settings.imageEndpoint ? "good" : "info"}`;
  els.generationRights.textContent = gate.label;
  els.generationRights.className = `status-chip ${gate.cls}`;
  const layers = activeReuseLayers(dataset);
  const contextRows = [
    ["Dataset", dataset?.name || "-"],
    ["Split", dataset ? splitFor(dataset.id).split : "-"],
    ["Reuse", layers.map((layer) => layer.label).join(" / ") || "pending"],
    ["KG Claims", dataset ? `${claimsFor(dataset.id).length} claims` : "-"],
    ["Rights", gate.reason],
    ["Mode", generationModeLabel(settings.mode)],
  ];
  els.generationContext.innerHTML = contextRows.map(([label, value]) => `<div class="context-tile"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  if (els.runGenerationBtn) els.runGenerationBtn.disabled = gate.state === "blocked";
  renderGenerationPromptPreview();
  const latest = generation.runs[0];
  els.generationRunCount.textContent = `${generation.runs.length} runs`;
  const aiBadge = `<div class="ai-generated-badge" role="note">${t("gen.aiBadge")}</div>`;
  if (latest?.output_image_url) {
    els.generationPreview.innerHTML = `${aiBadge}<img src="${escapeHtml(latest.output_image_url)}" alt="AI-generated image, not an authentic heritage specimen" /><div class="generation-caption"><span>${escapeHtml(latest.status)}</span><span>${escapeHtml(latest.run_id)}</span></div>`;
  } else {
    els.generationPreview.innerHTML = `${aiBadge}<div class="generation-placeholder" aria-hidden="true"></div><div class="generation-caption"><span>${latest ? escapeHtml(latest.status) : "waiting manifest"}</span><span>${latest ? escapeHtml(latest.run_id) : "no run yet"}</span></div>`;
  }
  els.generationRuns.innerHTML = generation.runs.length ? generation.runs.slice(0, 12).map((run) => `<article class="generation-run"><div class="generation-run-head"><strong>${escapeHtml(run.run_id)}</strong><span class="status-text ${run.status === "completed" ? "good" : run.status === "manifest_only" ? "warn" : "block"}">${escapeHtml(run.status)}</span></div><span>${escapeHtml(generationModeLabel(run.mode))} · ${escapeHtml(run.model_id)} · ${escapeHtml(run.rights_gate_status)}</span><code>${escapeHtml(run.manifest_hash)}</code><span>${escapeHtml(run.message || "")}</span></article>`).join("") : `<div class="empty-state">${t("empty.runs")}</div>`;
}

function validateGenerationTrace() {
  const runs = ensureGenerationState().runs || [];
  if (!runs.length) return { pass: true, count: 0, detail: "Generation Lab is connector-ready; no generation run committed yet" };
  const bad = runs.filter((run) => !run.run_id || !run.dataset_id || !run.mode || !run.model_id || !run.prompt_hash || !run.workflow_hash || !run.output_image_hash || !run.rights_gate_status || !run.manifest_hash || !run.audit_entry_hash);
  return {
    pass: bad.length === 0,
    count: runs.length,
    detail: bad.length ? `${bad.length} generation manifests missing reproducibility fields` : `${runs.length} generation manifests include prompt/model/workflow/output hashes and audit anchors`,
  };
}

function validatedPlatformReport() {
  const auditCheck = verifyAuditChain();
  const schemaCheck = validateSchema();
  const checksumCheck = validateChecksumRegistry();
  const leakageCheck = validateSampleLeakage();
  const evidenceCheck = validateEvidence();
  const generationCheck = validateGenerationTrace();
  const checks = [auditCheck, schemaCheck, checksumCheck, leakageCheck, evidenceCheck, generationCheck];
  return {
    pass: checks.every((check) => check.pass),
    auditCheck, schemaCheck, checksumCheck, leakageCheck, evidenceCheck, generationCheck,
  };
}

function renderValidationEvidence() {
  const report = validatedPlatformReport();
  const platformState = document.querySelector("#platformState");
  if (platformState) {
    platformState.textContent = report.pass ? "validated platform" : "conditional review";
    platformState.classList.toggle("warn", !report.pass);
  }
  const stepStates = [
    report.schemaCheck.pass && report.checksumCheck.pass,
    true,
    report.evidenceCheck.pass && report.leakageCheck.pass,
    report.auditCheck.pass && report.schemaCheck.pass,
    report.generationCheck.pass,
    report.pass,
  ];
  document.querySelectorAll(".logic-step").forEach((step, index) => {
    step.classList.remove("good", "warn", "active");
    step.classList.add(stepStates[index] ? "good" : "warn");
  });
  els.validationStatus.textContent = report.pass ? "validated" : "conditional";
  els.validationStatus.className = `status-chip ${report.pass ? "good" : "warn"}`;
  const tiles = [
    [report.auditCheck.pass ? "PASS" : "FAIL", "Audit hash-chain"],
    [report.schemaCheck.pass ? "PASS" : "FAIL", "Schema fields"],
    [report.checksumCheck.pass ? "PASS" : "FAIL", "Checksum registry"],
    [report.leakageCheck.pass ? "PASS" : "FAIL", "Sample leakage"],
    [report.generationCheck.pass ? "PASS" : "FAIL", "Generation trace"],
  ];
  els.validationGrid.innerHTML = tiles.map(([value, label]) => `<div class="validation-tile"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join("");
  const rows = [
    ["audit", report.auditCheck.reason, report.auditCheck.pass],
    ["schema", report.schemaCheck.detail, report.schemaCheck.pass],
    ["checksum", report.checksumCheck.detail, report.checksumCheck.pass],
    ["sample", report.leakageCheck.detail, report.leakageCheck.pass],
    ["evidence", report.evidenceCheck.detail, report.evidenceCheck.pass],
    ["generation", report.generationCheck.detail, report.generationCheck.pass],
  ];
  els.validationList.innerHTML = rows.map(([key, detail, pass]) => `<div class="validation-row"><span>${escapeHtml(key)}</span><span>${escapeHtml(detail)}</span><span class="status-text ${pass ? "good" : "warn"}">${pass ? "pass" : "review"}</span></div>`).join("");
}

function validateImportedPackage(payload) {
  const failures = [];
  if (!payload.dataset_manifest?.datasets && !payload.datasets) failures.push("dataset_manifest.datasets missing");
  if (payload.dataset_manifest?.datasets) {
    payload.dataset_manifest.datasets.forEach((item, index) => {
      ["dataset_id", "name", "source_url", "owner", "version", "checksum", "annotation_schema", "risk_level", "readiness"].forEach((key) => {
        if (item[key] === undefined || item[key] === "") failures.push(`dataset[${index}].${key} missing`);
      });
    });
  }
  if (payload.audit_log && !Array.isArray(payload.audit_log)) failures.push("audit_log must be array");
  if (payload.generation_manifest?.runs && !Array.isArray(payload.generation_manifest.runs)) failures.push("generation_manifest.runs must be array");
  return { pass: failures.length === 0, failures };
}

function exportResearchPackage() {
  ensureGenerationState();
  audit("export_research_package", "system", "Exported datasets, rights, splits, KG claims, generation manifests, evidence, samples, checksum registry, validation report and audit log.");
  const validation_report = validatedPlatformReport();
  const payload = {
    package_type: "jxich_validated_generation_research_platform_export",
    exported_at: new Date().toISOString(),
    version: state.version,
    validation_report,
    dataset_manifest: { manifest_version: state.version, datasets: state.datasets.map((item) => ({ ...item, dataset_id: item.id })) },
    rights_manifest: { manifest_version: state.version, rights: state.rights },
    split_manifest: { manifest_version: state.version, split_policy: state.splitPolicy, assignments: state.splits },
    kg_claims: { manifest_version: state.version, claims: state.kgClaims },
    generation_manifest: { manifest_version: state.version, settings: state.generation.settings, runs: state.generation.runs },
    evidence_manifest: { manifest_version: state.version, evidence_files: state.evidenceFiles },
    sample_manifest: { manifest_version: state.version, sample_policy: state.samplePolicy, samples: state.samples },
    checksum_manifest: { manifest_version: state.version, files: state.checksumFiles },
    board: state.board,
    selected_id: state.selectedId,
    audit_log: state.auditLog,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jx-ich-generation-research-package-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  render();
}

function importResearchPackage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const importCheck = validateImportedPackage(payload);
      if (!importCheck.pass) throw new Error(importCheck.failures.join("; "));
      if (payload.dataset_manifest?.datasets) state.datasets = payload.dataset_manifest.datasets.map((item) => ({ ...item, id: item.id || item.dataset_id }));
      else if (payload.datasets) state.datasets = payload.datasets.map((item) => ({ ...item, id: item.id || item.dataset_id }));
      if (payload.rights_manifest?.rights) state.rights = payload.rights_manifest.rights;
      if (payload.split_manifest?.assignments) { state.splits = payload.split_manifest.assignments; state.splitPolicy = payload.split_manifest.split_policy || state.splitPolicy; }
      if (payload.kg_claims?.claims) state.kgClaims = payload.kg_claims.claims;
      if (payload.evidence_manifest?.evidence_files) state.evidenceFiles = payload.evidence_manifest.evidence_files;
      if (payload.sample_manifest?.samples) { state.samples = payload.sample_manifest.samples; state.samplePolicy = payload.sample_manifest.sample_policy || state.samplePolicy; }
      if (payload.checksum_manifest?.files) state.checksumFiles = payload.checksum_manifest.files;
      if (payload.generation_manifest) state.generation = { settings: payload.generation_manifest.settings || generationDefaultSettings, runs: payload.generation_manifest.runs || [] };
      if (payload.board) state.board = payload.board;
      state.selectedId = payload.selected_id || state.board[0] || state.datasets[0]?.id || null;
      ensureGenerationState();
      audit("import_research_package", file.name, "Imported schema-validated generation research package JSON.");
      render();
    } catch (error) {
      window.alert(t("alert.importFailed", { message: error.message }));
      console.error(error);
    }
  };
  reader.readAsText(file, "utf-8");
}

function renderOverview() {
  if (!els.kpiGrid) return;
  const report = validatedPlatformReport();
  const active = state.datasets.filter((item) => !item.archived).length;
  const archived = state.datasets.filter((item) => item.archived).length;
  const blocked = state.datasets.filter((item) => rightsGate(rightsFor(item.id)).gate === "blocked").length;
  const evalLocked = state.splits.filter((item) => item.split === "eval" && item.locked).length;
  const holdoutCount = state.splits.filter((item) => item.split === "holdout").length;
  const pendingEvidence = (state.evidenceFiles || []).filter((file) => file.verification_status !== "verified").length;
  const runsCount = ensureGenerationState().runs.length;

  if (els.overviewPlatformState) {
    els.overviewPlatformState.textContent = report.pass ? "validated platform" : "conditional review";
    els.overviewPlatformState.className = `status-chip ${report.pass ? "good" : "warn"}`;
  }

  const cards = [
    { label: t("kpi.datasets"), value: active, sub: t("kpi.datasetsSub", { total: state.datasets.length, archived }), view: "dataset", alert: false },
    { label: t("kpi.blocked"), value: blocked, sub: t("kpi.blockedSub"), view: "governance", alert: blocked > 0, select: "blocked" },
    { label: t("kpi.board"), value: state.board.length, sub: t("kpi.boardSub"), view: "board", alert: false },
    { label: t("kpi.evalLocked"), value: evalLocked, sub: t("kpi.evalLockedSub"), view: "board", alert: false },
    { label: t("kpi.runs"), value: runsCount, sub: t("kpi.runsSub"), view: "generation", alert: false },
    { label: "Audit Chain", value: report.auditCheck.pass ? "OK" : "!", sub: report.auditCheck.reason, view: "governance", alert: !report.auditCheck.pass },
  ];
  els.kpiGrid.innerHTML = cards
    .map(
      (c) =>
        `<button type="button" class="kpi-card ${c.alert ? "alert" : ""}" data-jump="${c.view}" data-select="${c.select || ""}"><span class="kpi-label">${escapeHtml(c.label)}</span><span class="kpi-value">${escapeHtml(String(c.value))}</span><span class="kpi-sub">${escapeHtml(c.sub)}</span></button>`,
    )
    .join("");

  if (els.governanceSummary) {
    const items = [
      [t("summary.blocked"), t("summary.blockedValue", { n: blocked })],
      [t("summary.pendingEvidence"), t("summary.count", { n: pendingEvidence })],
      [t("summary.holdout"), t("summary.count", { n: holdoutCount })],
      ["Audit hash-chain", verifyAuditChain().pass ? "verified" : "broken"],
    ];
    els.governanceSummary.innerHTML = items
      .map(([label, value]) => `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`)
      .join("");
  }

  if (els.overviewAuditPreview) {
    els.overviewAuditPreview.innerHTML = state.auditLog.length
      ? state.auditLog
          .slice(0, 5)
          .map(
            (row) =>
              `<div class="audit-row"><strong>${escapeHtml(row.action)} · ${escapeHtml(row.target)}</strong><span>${escapeHtml(row.at)}</span></div>`,
          )
          .join("")
      : `<div class="empty-state">${t("empty.audit")}</div>`;
  }
}

function render() {
  ensureGenerationState();
  if (!state.selectedId && state.datasets[0]) state.selectedId = state.datasets[0].id;
  renderOverview();
  renderStats();
  renderDatasetList();
  renderBoard();
  renderSplitLanes();
  renderSelectedSummary();
  renderEvidenceGallery();
  renderReuseActions();
  renderRights();
  renderGraphAndOntology();
  renderGenerationLab();
  renderValidationEvidence();
  renderAuditLog();
  renderViewerMode();
}

function cacheElements() {
  Object.assign(els, {
    overviewPlatformState: $("#overviewPlatformState"), kpiGrid: $("#kpiGrid"), governanceSummary: $("#governanceSummary"), overviewAuditPreview: $("#overviewAuditPreview"),
    libraryCount: $("#libraryCount"), libraryStats: $("#libraryStats"), addDatasetForm: $("#addDatasetForm"), datasetList: $("#datasetList"), showArchived: $("#showArchived"),
    boardDrop: $("#boardDrop"), boardItems: $("#boardItems"), splitLanes: $("#splitLanes"), lockEvalBtn: $("#lockEvalBtn"), artifactViewer: $("#artifactViewer"), selectedSummary: $("#selectedSummary"), evidenceGallery: $("#evidenceGallery"), evidenceGalleryNote: $("#evidenceGalleryNote"), reuseActions: $("#reuseActions"), reuseMap: $("#reuseMap"),
    kgTitle: $("#kgTitle"), kgReadiness: $("#kgReadiness"), rightsGateStatus: $("#rightsGateStatus"), rightsFields: $("#rightsFields"), rightsToggles: $("#rightsToggles"), graphLines: $("#graphLines"), graphNodes: $("#graphNodes"), ontologyFields: $("#ontologyFields"), kgTable: $("#kgTable"), auditLog: $("#auditLog"), auditSealStatus: $("#auditSealStatus"),
    validationStatus: $("#validationStatus"), validationGrid: $("#validationGrid"), validationList: $("#validationList"), importBtn: $("#importBtn"), langBtn: $("#langBtn"), importFile: $("#importFile"), resetBtn: $("#resetBtn"), exportBtn: $("#exportBtn"),
    generationStatus: $("#generationStatus"), generationRights: $("#generationRights"), generationContext: $("#generationContext"), generationForm: $("#generationForm"), generationMode: $("#generationMode"), imageBackend: $("#imageBackend"), imageEndpoint: $("#imageEndpoint"), llmEndpoint: $("#llmEndpoint"), generationModel: $("#generationModel"), generationSeed: $("#generationSeed"), inputImageHash: $("#inputImageHash"), generationPrompt: $("#generationPrompt"), negativePrompt: $("#negativePrompt"), buildPromptBtn: $("#buildPromptBtn"), runGenerationBtn: $("#runGenerationBtn"), generationPreview: $("#generationPreview"), generationPromptPreview: $("#generationPromptPreview"), generationRuns: $("#generationRuns"), generationRunCount: $("#generationRunCount"),
  });
}

function initEvents() {
  if (els.langBtn) {
    els.langBtn.addEventListener("click", () => {
      i18n.setLang(i18n.getLang() === "en" ? "zh" : "en");
      i18n.applyStatic(document);
      render();
    });
  }
  if (els.kpiGrid) {
    els.kpiGrid.addEventListener("click", (event) => {
      const btn = event.target.closest(".kpi-card");
      if (!btn) return;
      if (btn.dataset.select === "blocked") {
        const blockedDataset = state.datasets.find((item) => !item.archived && rightsGate(rightsFor(item.id)).gate === "blocked");
        if (blockedDataset) { state.selectedId = blockedDataset.id; saveState(); render(); }
      }
      setWorkspaceView(btn.dataset.jump, true);
    });
  }
  els.addDatasetForm.addEventListener("submit", (event) => { event.preventDefault(); createDataset(new FormData(els.addDatasetForm)); els.addDatasetForm.reset(); saveState(); render(); });
  els.datasetList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (actionButton) {
      const id = actionButton.dataset.id;
      if (actionButton.dataset.action === "add") addToBoard(id);
      if (actionButton.dataset.action === "archive") archiveDataset(id);
      if (actionButton.dataset.action === "restore") restoreDataset(id);
      return;
    }
    const card = event.target.closest(".dataset-card");
    if (!card) return;
    state.selectedId = card.dataset.id;
    saveState();
    render();
  });
  els.boardItems.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("button[data-action='remove']");
    if (removeBtn) { removeFromBoard(removeBtn.dataset.id); return; }
    const item = event.target.closest(".board-item");
    if (!item) return;
    state.selectedId = item.dataset.id;
    saveState();
    render();
  });
  els.boardItems.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const item = event.target.closest(".board-item");
    if (!item) return;
    event.preventDefault();
    state.selectedId = item.dataset.id;
    saveState();
    render();
  });
  els.splitLanes.addEventListener("click", (event) => { const btn = event.target.closest("button[data-split]"); if (!btn) return; setSplit(btn.dataset.id, btn.dataset.split); });
  els.rightsToggles.addEventListener("change", (event) => { const input = event.target.closest("input[data-permission]"); const dataset = findDataset(); if (!input || !dataset) return; togglePermission(dataset.id, input.dataset.permission, input.checked); });
  els.reuseActions.addEventListener("click", (event) => { const btn = event.target.closest(".reuse-btn"); if (!btn) return; toggleReuse(btn.dataset.reuse); });
  els.kgTable.addEventListener("change", (event) => { const select = event.target.closest(".claim-status"); if (!select) return; updateClaimStatus(select.dataset.claim, select.value); });
  document.querySelectorAll(".view-btn").forEach((btn) => btn.addEventListener("click", () => { state.viewMode = btn.dataset.mode; audit("set_view_mode", state.selectedId || "system", state.viewMode); render(); }));
  els.showArchived.addEventListener("change", renderDatasetList);
  els.lockEvalBtn.addEventListener("click", lockEval);
  els.exportBtn.addEventListener("click", exportResearchPackage);
  els.importBtn.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", () => { const file = els.importFile.files?.[0]; if (file) importResearchPackage(file); els.importFile.value = ""; });
  els.resetBtn.addEventListener("click", () => {
    if (!window.confirm(t("confirm.reset"))) return;
    Storage.remove(STORAGE_KEY); state = createInitialState(); ensureGenerationState(); audit("reset_to_validated_manifests", "system", "State reset to bundled validated manifests and Generation Lab defaults."); render();
  });
  [els.generationMode, els.imageBackend, els.imageEndpoint, els.llmEndpoint, els.generationModel, els.generationSeed, els.inputImageHash, els.generationPrompt, els.negativePrompt].filter(Boolean).forEach((control) => {
    const type = control.tagName === "SELECT" ? "change" : "input";
    control.addEventListener(type, () => { syncGenerationSettings({ save: true }); renderGenerationPromptPreview(); });
  });
  if (els.buildPromptBtn) {
    els.buildPromptBtn.addEventListener("click", () => {
      const generation = ensureGenerationState();
      generation.settings.prompt = generationPromptTemplate();
      generation.settings.promptDatasetId = state.selectedId || "";
      setControlValue(els.generationPrompt, generation.settings.prompt);
      audit("build_generation_prompt", state.selectedId || "system", "Prompt generated from selected KG, ontology and reuse layers.");
      render();
    });
  }
  if (els.generationForm) {
    els.generationForm.addEventListener("submit", (event) => { event.preventDefault(); runGeneration(); });
  }
}

function viewFromHash() {
  const hash = window.location.hash.replace("#", "");
  if (hash === "datasetWindow") return "dataset";
  if (hash === "boardWindow") return "board";
  if (hash === "generationWindow") return "generation";
  if (hash === "governanceWindow") return "governance";
  return "overview";
}
function setWorkspaceView(view, updateHash = true) {
  const workspace = document.querySelector("#workspaceGrid");
  if (!workspace) return;
  const viewHash = {
    overview: "#overviewWindow",
    dataset: "#datasetWindow",
    board: "#boardWindow",
    generation: "#generationWindow",
    governance: "#governanceWindow",
  };
  const normalized = Object.prototype.hasOwnProperty.call(viewHash, view) ? view : "overview";
  workspace.dataset.activeView = normalized;
  document.querySelectorAll(".top-tab[data-view]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === normalized);
  });
  if (updateHash && window.location.hash !== viewHash[normalized]) history.replaceState(null, "", viewHash[normalized]);
}
function initSplitViewNavigation() {
  setWorkspaceView(viewFromHash(), false);
  document.querySelectorAll(".top-tab[data-view]").forEach((tab) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      setWorkspaceView(tab.dataset.view, true);
    });
  });
  window.addEventListener("hashchange", () => setWorkspaceView(viewFromHash(), false));
}

// Test-only export surface: no-op in the browser (no `module` global there), lets Node's
// built-in test runner exercise the real validation/audit logic instead of a re-implementation.
function replaceState(nextState) { state = nextState; return state; }
function getState() { return state; }
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    chainHash, stableStringify, sha256Hex, createAuditEntry, verifyAuditChain,
    validateSchema, validateChecksumRegistry, validateSampleLeakage, validateEvidence,
    validatedPlatformReport, validateGenerationTrace, rightsGate, rightsFor, splitFor, applyPermissionToggle, isExpired,
    findDataset, createRightsRecord, createInitialState, replaceState, getState,
    evidenceFor, verifiedEvidenceFor, authenticEvidenceFor, imageEvidenceFor,
    normalizeStoredState, mergeById, Storage, loadState, loadInitialState,
  };
}
