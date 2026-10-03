// Checks for the English / Chinese UI dictionary in i18n.js: every key used by app.js or
// index.html must exist, and every entry must carry both languages.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = require("./env-shim");
const i18n = require("../i18n.js");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

function usedKeys() {
  const keys = new Set();
  for (const match of appSource.matchAll(/\bt\("([\w.]+)"/g)) keys.add(match[1]);
  for (const match of html.matchAll(/data-i18n(?:-placeholder|-aria)?="([\w.]+)"/g)) keys.add(match[1]);
  return keys;
}

test("every i18n key used in app.js and index.html is defined", () => {
  const missing = [...usedKeys()].filter((key) => !(key in i18n.STRINGS));
  assert.deepEqual(missing, []);
});

test("every i18n entry has non-empty English and Chinese text", () => {
  const incomplete = Object.entries(i18n.STRINGS)
    .filter(([, entry]) => i18n.SUPPORTED.some((lang) => typeof entry[lang] !== "string" || !entry[lang].trim()))
    .map(([key]) => key);
  assert.deepEqual(incomplete, []);
});

test("t() fills named parameters and switches language", () => {
  i18n.setLang("en");
  assert.equal(i18n.t("summary.blockedValue", { n: 3 }), "3 datasets");
  i18n.setLang("zh");
  assert.equal(i18n.t("summary.blockedValue", { n: 3 }), "3 个数据集");
  i18n.setLang("en");
});

test("rights gate messages follow the active language", () => {
  i18n.setLang("en");
  assert.equal(app.rightsGate(null).label, "Blocked");
  i18n.setLang("zh");
  assert.equal(app.rightsGate(null).label, "阻止");
  i18n.setLang("en");
});
