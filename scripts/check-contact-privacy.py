"""Check access controls without downloading enquiry records."""
import time
import subprocess

BASE = "https://www.luxcraft.sg"
PROTECTED = ["/logs/", "/logs/contact-form.log", "/mail-diagnostics.php",
             "/mail-diagnostics", "/mail-diagnostics.php/extra", "/.luxcraft-private/"]

def status(path):
    result = subprocess.run(["curl", "--silent", "--show-error", "--head", "--location",
                             "--max-time", "20", "--output", "/dev/null",
                             "--write-out", "%{http_code}", BASE + path],
                            capture_output=True, text=True, check=True)
    return int(result.stdout)

for attempt in range(3):
    try:
        results = {path: status(path) for path in PROTECTED + ["/", "/contact"]}
        for path, code in results.items():
            print(f"HEAD {path}: {code}", flush=True)
        assert all(results[p] in (403, 404) for p in PROTECTED), "Private route is accessible"
        assert all(results[p] == 200 for p in ("/", "/contact")), "Public page unavailable"
        break
    except Exception:
        if attempt == 2:
            raise
        time.sleep(5)
