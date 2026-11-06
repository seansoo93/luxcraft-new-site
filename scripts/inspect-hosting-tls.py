"""Inspect public FTPS certificates without authenticating or sending credentials."""
import os
import re
import subprocess

result = subprocess.run(["openssl", "s_client", "-starttls", "ftp", "-connect",
                         os.environ["FTP_SERVER"] + ":21", "-showcerts"],
                        input="", capture_output=True, text=True, timeout=30)
for certificate in re.findall(r"-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----",
                              result.stdout, re.S):
    details = subprocess.run(["openssl", "x509", "-noout", "-subject", "-issuer",
                              "-ext", "authorityInfoAccess"], input=certificate,
                             capture_output=True, text=True, check=True)
    print(details.stdout)
for line in result.stderr.splitlines():
    if "verify error" in line or "Verification" in line:
        print(line)
