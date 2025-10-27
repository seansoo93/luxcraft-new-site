<?php
declare(strict_types=1);

$iniValues = [
    'sendmail_path' => ini_get('sendmail_path'),
    'SMTP' => ini_get('SMTP'),
    'smtp_port' => ini_get('smtp_port'),
    'mail.log' => ini_get('mail.log'),
    'mail.add_x_header' => ini_get('mail.add_x_header'),
    'mail.force_extra_parameters' => ini_get('mail.force_extra_parameters'),
];

$logPath = __DIR__ . '/logs/contact-form.log';
$logEntries = [];
if (is_readable($logPath)) {
    $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    $logEntries = array_slice($lines, -10);
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mail Diagnostics – LuxCraft</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f4f2;
            margin: 0;
            padding: 2.5rem 1.5rem;
        }
        .wrap {
            max-width: 880px;
            margin: 0 auto;
            background: #fff;
            border-radius: 18px;
            box-shadow: 0 20px 50px rgb(15 11 8 / 10%);
            padding: 2.5rem;
        }
        h1 {
            margin-top: 0;
            font-size: 2rem;
            color: #1e1b18;
        }
        section + section {
            margin-top: 2.5rem;
        }
        pre {
            background: #1e1b18;
            color: #f5f4f2;
            padding: 1rem;
            border-radius: 12px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        th, td {
            text-align: left;
            padding: 0.75rem 0.5rem;
            border-bottom: 1px solid #ece7e1;
        }
        code {
            font-family: 'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
            font-size: 0.95rem;
        }
        .note {
            background: #fdf4e6;
            border: 1px solid #f1d4a5;
            border-radius: 12px;
            padding: 1rem 1.25rem;
            color: #7c5a23;
        }
    </style>
</head>
<body>
<div class="wrap">
    <h1>Mail Diagnostics</h1>
    <div class="note">
        This page surfaces PHP mail transport settings and the last few contact form attempts to help diagnose delivery issues.
        Remove this file when troubleshooting is complete.
    </div>

    <section>
        <h2>Mail Function Availability</h2>
        <p><strong>mail()</strong> <?= function_exists('mail') ? 'is available' : 'is <span style="color:#b42318;">disabled</span>'; ?> on this server.</p>
        <p><strong>Current PHP user:</strong> <?= htmlspecialchars(get_current_user(), ENT_QUOTES, 'UTF-8'); ?></p>
        <p><strong>PHP version:</strong> <?= PHP_VERSION; ?></p>
        <p><strong>System:</strong> <?= htmlspecialchars(php_uname('a'), ENT_QUOTES, 'UTF-8'); ?></p>
    </section>

    <section>
        <h2>Key php.ini Settings</h2>
        <table>
            <thead>
            <tr>
                <th>Directive</th>
                <th>Value</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($iniValues as $key => $value): ?>
                <tr>
                    <td><code><?= htmlspecialchars($key, ENT_QUOTES, 'UTF-8'); ?></code></td>
                    <td><?= $value !== false && $value !== '' ? htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8') : '<em>not set</em>'; ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </section>

    <section>
        <h2>Recent Contact Form Attempts</h2>
        <?php if ($logEntries): ?>
            <pre><?php foreach ($logEntries as $entry) { echo htmlspecialchars($entry, ENT_QUOTES, 'UTF-8') . "\n"; } ?></pre>
        <?php else: ?>
            <p>No log entries found at <code><?= htmlspecialchars($logPath, ENT_QUOTES, 'UTF-8'); ?></code>.</p>
        <?php endif; ?>
    </section>
</div>
</body>
</html>
