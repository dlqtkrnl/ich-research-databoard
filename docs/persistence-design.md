# Persistence design: localStorage-only → opt-in file-based server

Status: prototype implemented (see "What was implemented" below). This addresses the
README item under "다음 단계로 고려할 것": *"localStorage 대신 파일 기반 또는 경량 서버
영속화 도입 검토"* (consider file-based or lightweight-server persistence instead of
localStorage).

## Current state, and why it's fragile

Every runtime state change made through the UI — dataset registration/edits, board/split
assignments, Rights Gate permission toggles, KG claim status updates, Generation Lab
experiment records, and the append-only audit hash-chain itself — lives in exactly one
place: a single JSON blob in the browser's `localStorage`, under the key
`jxich_research_databoard_state_v2` (see `saveState()` / `loadState()` in `app.js`).

This is why the README calls it out as a known limitation:

- **No cross-device/cross-browser sharing.** Two researchers, or the same researcher on
  a laptop and a lab workstation, see two independent, diverging audit chains.
- **Cache-clear = data loss.** Clearing site data, using a private window, or switching
  browsers loses every locally-registered dataset, rights decision, split assignment,
  and generation run — with no warning, since `loadState()` just returns `null` and the
  app silently re-seeds from the bundled manifest.
- **No durable backup.** The only mitigation today is the manual "내보내기(export)" JSON
  button (`exportResearchPackage()`), which the user has to remember to click.

The audit hash-chain makes this doubly relevant: an append-only, tamper-evident log that
can vanish the moment someone clears their cache is a weaker guarantee than the hash-chain
mechanism implies.

## Design goals / constraints

1. **The no-build-step, file://-openable MVP must keep working unchanged.** Opening
   `index.html` directly, or via `npx serve src`, with no server running, must behave
   exactly as it does today — same localStorage-only persistence, same latency, same UX.
2. **Opt-in, not required.** Nobody should have to install or run anything extra to use
   the app as before.
3. **No new dependencies.** The project has zero external dependencies today (`scripts/*.mjs`
   uses only Node's built-in `fs`/`crypto`/`path`); the persistence server follows the same
   rule and uses only Node's built-in `http`/`fs`/`path`.
4. **Isolated adapter, not scattered feature-detection.** Every localStorage call site in
   `app.js` was replaced with calls to one `Storage` object; nothing else in the ~50 call
   sites that mutate state needed to change.

## Chosen design

### Storage adapter (`app.js`)

A module-level `Storage` object (defined right after `STORAGE_KEY`) with `init()`,
`get(key)`, `set(key, value)`, `remove(key)`, and `list()`:

- **`Storage.init()`** — fires once at startup. Does a `fetch("/api/health")` bounded by a
  400ms timeout (`STORAGE_HEALTH_TIMEOUT_MS`, via `AbortController`). Any failure at all
  (no server, `file://` origin, timeout, non-OK response) leaves `Storage.serverAvailable
  = false` and is swallowed — `init()` never throws.
- **`Storage.get(key)`** — if the server is available, tries `GET /api/state/:key` first;
  on any failure (network error, non-2xx/404) it falls back to reading the same key out of
  `localStorage`. This is genuinely the same shape of data either way, since the server
  just stores whatever JSON blob the client sent.
- **`Storage.set(key, value)`** — **always** writes to `localStorage` synchronously first.
  This is the load-bearing guarantee: local durability never depends on the network. If
  the server is reachable, the same value is *additionally* mirrored there via
  `PUT /api/state/:key`, fired in the background and not awaited by callers — `saveState()`
  (now just `Storage.set(STORAGE_KEY, state)`) stays a synchronous call from the ~50
  existing call sites that invoke it after every mutation.
- **`Storage.remove(key)`** / **`Storage.list()`** — same pattern (local first / best-effort
  server mirror; local-only fallback for `list()`).

Startup sequencing (`loadInitialState()`, called from the `DOMContentLoaded` handler):
`cacheElements()` / `initEvents()` / `initDragAndDrop()` run immediately and unchanged
(they only wire up DOM refs and event listeners that read `state` lazily); then
`Storage.init()` is awaited (bounded, always resolves), then `Storage.get(STORAGE_KEY)` is
tried if the server answered, falling back to the original synchronous `loadState()` (still
reading `localStorage` directly, untouched) if the server isn't there or its response
doesn't look like valid app state. Only the very first `render()` call waits on this —
everything else about the render/event pipeline is unchanged.

### Server (`server.mjs`)

A single-file Node script using only `node:http`/`node:fs`/`node:path`, run with
`npm run serve` (`node src/server.mjs`) (optionally `PORT=4000 node src/server.mjs` or `node src/server.mjs 4000`;
defaults to `http://127.0.0.1:8787`). It does two things on one port, deliberately, so
the browser's requests to `/api/*` are same-origin and need **no CORS configuration**:

1. **Serves the static app** (`index.html`, `app.js`, `styles.css`, `data/*`, ...) for any
   `GET`/`HEAD` request that isn't under `/api/`. Path-traversal-guarded (resolved path
   must stay under the project root) and refuses dotfiles/dot-directories and the `state/`
   directory itself (that must only be reached through the validated API below).
2. **Exposes the REST-ish API**:
   - `GET /api/health` → `{ ok: true, time }`
   - `GET /api/keys` → `["jxich_research_databoard_state_v2", ...]` (filenames under
     `state/`, minus `.json`)
   - `GET /api/state/:key` → the stored JSON, or `404 { error: "not_found" }`
   - `PUT /api/state/:key` → body must be valid JSON (`400` otherwise, `413` over 10MB);
     written to `state/<key>.json.tmp-<pid>-<ts>` then `renameSync`'d into place, so a
     concurrent `GET` can never observe a half-written file
   - `DELETE /api/state/:key` → idempotent; `200` whether or not the key existed
   - `:key` is validated against `^[A-Za-z0-9_.-]{1,128}$` and the resolved path is checked
     to stay inside `state/` (defense in depth beyond the regex)

To use it: run `npm run serve` (`node src/server.mjs`), then open `http://127.0.0.1:8787/` instead of
`index.html` directly. Everyone who instead opens `index.html` via `file://` or
`npx serve src` (no API on that origin) gets a fast, harmless 404/network-error health check
and falls straight back to localStorage — nothing about their experience changes.

State is written to `state/<key>.json` (one file per storage key; today the app only ever
uses one key, `jxich_research_databoard_state_v2`, but the API is generic). `state/` is
new, created automatically on server startup, and is **gitignored** — it's runtime data,
not source, matching how `data/*.json` (checked in, hand-authored/generated by
`scripts/*.mjs`) is treated differently from anything users create through the UI.

## What was actually implemented vs. deferred

**Implemented in this pass:**
- The `Storage` adapter in `app.js` (feature-detect, get/set/remove/list, graceful
  fallback to localStorage in every failure mode).
- `server.mjs`: static file serving + the four API endpoints above, atomic writes,
  path-traversal guards, request-body size cap, localhost-only binding (`127.0.0.1` by
  default — see "known limitations").
- `.gitignore` for `/state/`.
- A small adapter test file, `test/storage-adapter.test.js`, covering the pieces that
  don't require a live network (localStorage fallback paths, `init()` failure handling
  with a mocked `fetch`). Run with `node --test test/`. The existing
  `test/validation.test.js` (12 tests) is untouched and still passes.

**Deliberately deferred / out of scope for this pass** (being explicit about scope cuts
rather than quietly under-building and calling it done):

- **Multi-writer conflict resolution.** `PUT /api/state/:key` is a plain last-write-wins
  overwrite. If two browser tabs (or two people pointed at the same server) both have the
  app open and both write, the second `PUT` silently clobbers the first — there is no
  version/ETag check, no merge, no conflict UI. For a single researcher's own multi-device
  use this is usually fine (open one tab at a time); for actual concurrent multi-user
  editing it is not safe. A real fix would need either optimistic concurrency (send back
  the version you read, `409` on mismatch) or per-field CRDT-style merging of the specific
  arrays in `state` (datasets/rights/splits/etc.) — meaningfully more work, intentionally
  not attempted here.
- **Auth / access control.** None. The server binds to `127.0.0.1` by default specifically
  *because* there is no auth — it must not be exposed on a shared network or the public
  internet as-is. Anyone who can reach the port can read and overwrite all stored state.
- **Multi-key granularity.** The app still persists one big JSON blob per save (same as
  today's localStorage behavior) rather than splitting datasets/rights/splits/audit log
  into separately-fetchable resources. The API supports multiple keys, but `app.js` only
  ever uses `jxich_research_databoard_state_v2`. Splitting further would reduce
  over-the-wire size for large audit logs but adds complexity (partial-update semantics,
  more endpoints) not justified yet.
- **HTTPS / remote deployment.** Local HTTP only. Not designed to be exposed beyond one
  machine.
- **Startup latency isn't cached across page loads.** Every page load pays up to
  `STORAGE_HEALTH_TIMEOUT_MS` (400ms) for the health probe, even when the server is
  reliably present or reliably absent for a given user. A cheap future improvement:
  remember the last probe result in `sessionStorage` and skip re-probing within the same
  tab session. Not implemented now to keep the fallback logic simple and easy to reason
  about (no stale-cache edge cases to get wrong).
- **Backing up `state/` itself.** The server doesn't rotate, back up, or version the JSON
  files it writes beyond the atomic write-then-rename. `내보내기(export)` remains the
  recommended path for anything that needs to survive `state/` being deleted.

## How to run it

```text
# Terminal — start the optional persistence server (from the repo root)
node src/server.mjs
# -> listens on http://127.0.0.1:8787, creates state/ if missing

# Then open http://127.0.0.1:8787/ in a browser (NOT index.html via file://) to get
# server-backed persistence. Everything else — index.html via file://, npx serve src — keeps
# working exactly as before, falling back to localStorage automatically.
```

Optional: `PORT=4000 node src/server.mjs` or `node src/server.mjs 4000` to use a different port.

No build step, no dependency install — `server.mjs` runs as-is with any reasonably
current Node (built and tested against Node 24).
