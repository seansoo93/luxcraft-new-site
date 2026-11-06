"""Remove only the retired diagnostics endpoint; preserve legacy logs."""
import os
import ssl
from ftplib import FTP_TLS
from pathlib import PurePosixPath

with FTP_TLS(context=ssl.create_default_context(), timeout=30) as ftp:
    ftp.connect(os.environ["FTP_SERVER"])
    ftp.login(os.environ["FTP_USERNAME"], os.environ["FTP_PASSWORD"])
    ftp.prot_p()
    ftp.cwd("public_html")
    if any(PurePosixPath(name).name == "mail-diagnostics.php" for name in ftp.nlst()):
        ftp.delete("mail-diagnostics.php")
        print("Removed retired mail diagnostics endpoint.")
    else:
        print("Retired mail diagnostics endpoint is already absent.")
