"""Exercise real PHP handling with a mail stub; no email or live data involved."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
PHP = os.environ.get("PHP_BINARY", "php")

class ContactPrivacy(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.home = Path(self.temp.name)
        self.public = self.home / "public_html"
        self.public.mkdir()
        shutil.copy(ROOT / "contact-submit.php", self.public)
        self.private = self.home / ".luxcraft-private"
        self.data = dict(name="PRIVATE_NAME_MARKER", email="private@example.test",
                         phone="81234567", message="PRIVATE_MESSAGE_MARKER", privacy="on")

    def submit(self, data=None, mail_ok=True):
        data = self.data if data is None else data
        runner = self.home / "runner.php"
        runner.write_text("<?php\n"
            "function mail($to, $subject, $body, $headers, $params = '') {\n"
            " file_put_contents(__DIR__ . '/mail.json', json_encode([$to, $body]));\n"
            + (" return true;\n" if mail_ok else " return false;\n") + "}\n"
            "$_SERVER['REQUEST_METHOD'] = 'POST';\n"
            "$_SERVER['DOCUMENT_ROOT'] = __DIR__ . '/public_html';\n"
            "$_SERVER['REMOTE_ADDR'] = '192.0.2.1';\n"
            "$_SERVER['HTTP_USER_AGENT'] = 'PRIVATE_USER_AGENT_MARKER';\n"
            "$_POST = json_decode(file_get_contents(__DIR__ . '/input.json'), true);\n"
            "include __DIR__ . '/public_html/contact-submit.php';\n")
        (self.home / "input.json").write_text(json.dumps(data))
        run = subprocess.run([PHP, "-n", "-d", "disable_functions=mail", str(runner)],
                             capture_output=True, text=True, check=True)
        self.assertNotIn("Fatal error", run.stdout)
        return run

    def event(self):
        files = list(self.private.glob("*.log"))
        self.assertEqual(len(files), 1)
        self.assertEqual(files[0].stat().st_mode & 0o777, 0o600)
        self.assertEqual(self.private.stat().st_mode & 0o777, 0o700)
        event = json.loads(files[0].read_text())
        self.assertEqual(set(event), {"reference", "timestamp", "status"})
        self.assertRegex(event["reference"], r"^[0-9a-f]{16}$")
        self.assertFalse((self.public / "logs").exists())
        return event

    def test_success_delivers_enquiry_but_logs_only_metadata(self):
        self.assertIn("Thank You", self.submit().stdout)
        self.assertEqual(self.event()["status"], "success")
        self.assertIn(self.data["message"], (self.home / "mail.json").read_text())

    def test_validation_does_not_send_mail(self):
        self.assertIn("Submission Error", self.submit({}).stdout)
        self.assertEqual(self.event()["status"], "validation_failed")
        self.assertFalse((self.home / "mail.json").exists())

    def test_honeypot_does_not_send_mail_or_log_inputs(self):
        self.submit(dict(self.data, company_website="PRIVATE_BOT_MARKER"))
        self.assertEqual(self.event()["status"], "honeypot_triggered_silent_rejection")
        self.assertFalse((self.home / "mail.json").exists())

    def test_mail_failure_logs_only_status(self):
        self.assertIn("Submission Error", self.submit(mail_ok=False).stdout)
        self.assertEqual(self.event()["status"], "mail_failure")

    def test_logging_failure_does_not_break_submission_or_leak_inputs(self):
        self.private.write_text("blocked directory")
        result = self.submit()
        self.assertIn("Thank You", result.stdout)
        self.assertIn('"status":"success"', result.stderr)
        for value in self.data.values():
            if len(value) > 4:
                self.assertNotIn(value, result.stderr)

    def test_metadata_retention_preserves_recent_and_legacy_files(self):
        self.private.mkdir(mode=0o700)
        old = self.private / "contact-events-2000-01-01.log"
        old.write_text("old metadata")
        legacy = self.private / "contact-form.log"
        legacy.write_text("preserve historic records")
        self.submit()
        self.assertFalse(old.exists())
        self.assertTrue(legacy.exists())

    def test_directory_inside_document_root_is_rejected(self):
        destination = self.public / "misconfigured-logs"
        destination.mkdir()
        self.private.symlink_to(destination, target_is_directory=True)
        result = self.submit()
        self.assertEqual(list(destination.iterdir()), [])
        self.assertIn('"status":"success"', result.stderr)

if __name__ == "__main__":
    unittest.main()
