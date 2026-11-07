"""Measures the largest string a Chromium page can store in localStorage (one key), by bisection.

Serves an empty page on 127.0.0.1 (localStorage needs an http origin) and reports the maximum number of
characters accepted. Optional research script: Python 3 and Playwright with Chromium (set CHROME to use an
installed browser). Run: python benchmarks/quota_chromium.py
"""
import http.server, json, os, threading
from playwright.sync_api import sync_playwright

class Quiet(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.send_header("Content-Type", "text/html"); self.end_headers(); self.wfile.write(b"<p>q</p>")
    def log_message(self, *args): pass

srv = http.server.HTTPServer(("127.0.0.1", 0), Quiet)
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    kwargs = {"executable_path": os.environ["CHROME"]} if "CHROME" in os.environ else {}
    b = p.chromium.launch(**kwargs); pg = b.new_page(); pg.goto(f"http://127.0.0.1:{srv.server_port}/")
    r = pg.evaluate("""() => { let lo = 0, hi = 50 * 1024 * 1024;
      while (lo < hi) { const mid = Math.ceil((lo + hi) / 2);
        try { localStorage.clear(); localStorage.setItem('k', 'a'.repeat(mid)); lo = mid; } catch (e) { hi = mid - 1; } }
      localStorage.clear(); return lo; }""")
    print(json.dumps({"browser": b.version, "max_value_chars_with_1_char_key": r})); b.close()
srv.shutdown()
