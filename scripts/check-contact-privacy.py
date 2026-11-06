"""Check access controls without downloading enquiry records."""
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen

BASE = "https://www.luxcraft.sg"
PROTECTED = ["/logs/", "/logs/contact-form.log", "/mail-diagnostics.php",
             "/mail-diagnostics", "/mail-diagnostics.php/extra", "/.luxcraft-private/"]

def status(path):
    request = Request(BASE + path, method="HEAD", headers={"Cache-Control": "no-cache"})
    try:
        with urlopen(request, timeout=20) as response:
            return response.status
    except HTTPError as error:
        return error.code

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
