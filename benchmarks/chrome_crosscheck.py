"""Cross-checks the Node timings of scalability.bench.js inside a real Chromium page.

Loads src/index.html, builds synthetic sample rows and audit entries in the page and times the page's own
sampleLeakage() and verifyAuditChain(). Optional research script: requires Python 3 and Playwright with a
Chromium build (set CHROME=/path/to/chrome to use an installed browser).
Run: python benchmarks/chrome_crosscheck.py
"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

INDEX = (Path(__file__).resolve().parent.parent / "src" / "index.html").as_uri()
JS = """(n) => {
  const samples=[]; for (let o=0;o<n/10;o++) for (let k=0;k<10;k++) samples.push({sample_id:`S${o}-${k}`,dataset_id:`D${Math.floor(o/10)}`,object_id:`O${o}`,event_id:`E${Math.floor(o/5)}`,capture_session_id:`C${o}`,duplicate_group_id:`d${o}-${k>>1}`,split:['train','train','eval','holdout'][Math.floor(o/10)%4]});
  const med=(f)=>{const r=[];for(let i=0;i<7;i++){const t=performance.now();f();r.push(performance.now()-t);}r.sort((a,b)=>a-b);return +r[3].toFixed(2);};
  const leak=med(()=>sampleLeakage(samples));
  const log=[]; let prev='GENESIS'; for(let i=1;i<=n;i++){const e=createAuditEntry('assign_split','x',`a ${i}`,prev,i); log.unshift(e); prev=e.entry_hash;}
  const saved=state.auditLog; state.auditLog=log; const chain=med(()=>verifyAuditChain()); state.auditLog=saved;
  return {n, leakage_ms:leak, chain_ms:chain};
}"""
with sync_playwright() as p:
    kwargs = {"executable_path": os.environ["CHROME"]} if "CHROME" in os.environ else {}
    b = p.chromium.launch(**kwargs); pg = b.new_page()
    pg.goto(INDEX); pg.wait_for_timeout(1000)
    out = [pg.evaluate(JS, n) for n in (1000, 10000, 100000)]
    print(json.dumps({"browser": b.version, "rows": out})); b.close()
