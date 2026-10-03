#!/usr/bin/env node
// Optional local persistence server for the browser-only MVP. Serves the static app
// (index.html/app.js/styles.css/data/*) AND a minimal REST-ish JSON API on the SAME
// origin/port, so app.js's Storage adapter can call relative paths like `/api/health`
// with no CORS setup at all. Nothing about the existing file://-openable workflow
// changes: this server is entirely opt-in. If you don't run it, app.js's Storage
// adapter fails its health probe fast and falls back to localStorage exactly as before.
//
// State is persisted as one JSON file per key under state/ (gitignored — runtime data,
// not source). There is no framework dependency, only Node's built-in http/fs/path, to
// stay consistent with this project's zero-external-dependency philosophy (see
// scripts/*.mjs).
//
// Usage:
//   node server.mjs               # listens on http://127.0.0.1:8787
//   PORT=4000 node server.mjs     # or: node server.mjs 4000
//
// See docs/persistence-design.md for the full design and known limitations (no auth,
// no multi-writer conflict resolution — this is a single-user local dev convenience,
// not a production data store, and it binds to 127.0.0.1 only for that reason).

import { createServer } from "node:http";
import {
  existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, readdirSync, statSync,
} from "node:fs";
import { join, dirname, extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const stateDir = join(root, "state");
if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });

const PORT = Number(process.argv[2] || process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1"; // localhost-only by default: this server has no auth.
const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10MB — generous for this app's state blob, bounded against abuse.
const KEY_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(payload) });
  res.end(payload);
}

function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) { reject(Object.assign(new Error("payload_too_large"), { code: "PAYLOAD_TOO_LARGE" })); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function statePathFor(key) {
  const filePath = join(stateDir, `${key}.json`);
  // Defense in depth beyond the KEY_PATTERN check: the resolved path must stay inside state/.
  if (!normalize(filePath).startsWith(normalize(stateDir) + sep)) return null;
  return filePath;
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/health") {
    if (req.method !== "GET") return sendJson(res, 405, { error: "method_not_allowed" });
    return sendJson(res, 200, { ok: true, time: new Date().toISOString() });
  }

  if (url.pathname === "/api/keys") {
    if (req.method !== "GET") return sendJson(res, 405, { error: "method_not_allowed" });
    const keys = readdirSync(stateDir).filter((name) => name.endsWith(".json")).map((name) => name.slice(0, -".json".length));
    return sendJson(res, 200, keys);
  }

  const stateMatch = url.pathname.match(/^\/api\/state\/([^/]+)$/);
  if (stateMatch) {
    const key = decodeURIComponent(stateMatch[1]);
    if (!KEY_PATTERN.test(key)) return sendJson(res, 400, { error: "invalid_key" });
    const filePath = statePathFor(key);
    if (!filePath) return sendJson(res, 400, { error: "invalid_key" });

    if (req.method === "GET") {
      if (!existsSync(filePath)) return sendJson(res, 404, { error: "not_found" });
      try {
        const raw = readFileSync(filePath, "utf8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(raw) });
        res.end(raw);
      } catch (error) {
        console.error(`[server] failed to read ${filePath}:`, error);
        sendJson(res, 500, { error: "read_failed" });
      }
      return;
    }

    if (req.method === "PUT") {
      let body;
      try {
        body = await readBody(req, MAX_BODY_BYTES);
      } catch (error) {
        if (error.code === "PAYLOAD_TOO_LARGE") return sendJson(res, 413, { error: "payload_too_large" });
        console.error(`[server] failed to read request body for ${key}:`, error);
        return sendJson(res, 400, { error: "read_failed" });
      }
      let parsed;
      try {
        parsed = JSON.parse(body.toString("utf8"));
      } catch (error) {
        return sendJson(res, 400, { error: "invalid_json" });
      }
      try {
        // Write-then-rename keeps a concurrent GET from ever observing a half-written file.
        const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
        writeFileSync(tmpPath, JSON.stringify(parsed));
        renameSync(tmpPath, filePath);
      } catch (error) {
        console.error(`[server] failed to write ${filePath}:`, error);
        return sendJson(res, 500, { error: "write_failed" });
      }
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "DELETE") {
      try { if (existsSync(filePath)) unlinkSync(filePath); } catch (error) { console.error(`[server] failed to delete ${filePath}:`, error); return sendJson(res, 500, { error: "delete_failed" }); }
      return sendJson(res, 200, { ok: true }); // idempotent: deleting a nonexistent key is not an error
    }

    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  return sendJson(res, 404, { error: "not_found" });
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const segments = decoded.split("/").filter(Boolean);
  // Reject dotfiles/dot-directories (.git, .env, ...) and the state/ directory, which must
  // only be reachable through the validated /api/state/:key handlers above, never raw.
  if (segments.some((segment) => segment.startsWith("."))) return null;
  if (segments[0] === "state") return null;
  const relative = segments.length ? join(...segments) : "index.html";
  const resolved = normalize(join(root, relative));
  if (!(resolved === normalize(root) || resolved.startsWith(normalize(root) + sep))) return null; // path traversal guard
  return resolved;
}

function serveStatic(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "method_not_allowed" });
  let resolved = safeStaticPath(url.pathname);
  if (!resolved) return sendJson(res, 403, { error: "forbidden" });
  try {
    if (existsSync(resolved) && statSync(resolved).isDirectory()) resolved = join(resolved, "index.html");
    if (!existsSync(resolved) || !statSync(resolved).isFile()) return sendJson(res, 404, { error: "not_found" });
    const body = readFileSync(resolved);
    const type = MIME[extname(resolved).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Content-Length": body.length });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (error) {
    console.error(`[server] failed to serve ${resolved}:`, error);
    sendJson(res, 500, { error: "read_failed" });
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch((error) => {
      console.error("[server] unhandled API error:", error);
      if (!res.headersSent) sendJson(res, 500, { error: "internal_error" });
    });
    return;
  }
  serveStatic(req, res, url);
});

server.listen(PORT, HOST, () => {
  console.log(`[server] persistence + static server listening on http://${HOST}:${PORT}`);
  console.log(`[server] state stored under ${stateDir}`);
  console.log(`[server] open http://${HOST}:${PORT}/ in a browser to use server-backed persistence`);
});
