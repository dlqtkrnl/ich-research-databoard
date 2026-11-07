// The optional server answers only requests whose Host header names the local machine, for the API and for static
// files alike (evidence files are served from src/data), which blocks DNS-rebinding reads from other web pages.
const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const { spawn } = require("node:child_process");

function get(port, host, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, path: urlPath, headers: { Host: host } }, (res) => { res.resume(); res.on("end", () => resolve(res.statusCode)); });
    req.on("error", reject); req.end();
  });
}

test("server.mjs refuses API and static requests addressed to another host name", async () => {
  const port = 18000 + Math.floor(Math.random() * 2000);
  const child = spawn(process.execPath, [path.join(__dirname, "..", "src", "server.mjs"), String(port)], { stdio: ["ignore", "pipe", "pipe"] });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("server did not start")), 5000);
      child.stdout.on("data", (chunk) => { if (String(chunk).includes("listening")) { clearTimeout(timer); resolve(); } });
      child.on("exit", (code) => reject(new Error(`server exited with ${code}`)));
    });
    assert.equal(await get(port, `127.0.0.1:${port}`, "/api/health"), 200);
    assert.equal(await get(port, `localhost:${port}`, "/"), 200);
    assert.equal(await get(port, `evil.example:${port}`, "/api/health"), 403);
    assert.equal(await get(port, `evil.example:${port}`, "/data/rights_manifest.json"), 403);
  } finally {
    child.kill();
  }
});
