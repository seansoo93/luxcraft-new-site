<?php
declare(strict_types=1);

// Keep operational events outside the document root. Never log enquiry contents.
$logEvent = static function (array $payload): void {
    $event = [
        'reference' => bin2hex(random_bytes(8)),
        'timestamp' => gmdate('c'),
        'status' => $payload['status'],
    ];
    $line = json_encode($event, JSON_THROW_ON_ERROR) . PHP_EOL;
    $directory = dirname(__DIR__) . '/.luxcraft-private';
    $oldUmask = umask(0077);
    try {
        if (!is_dir($directory) && !@mkdir($directory, 0700, true)) {
            throw new RuntimeException('Private directory unavailable');
        }
        $resolved = realpath($directory);
        $publicRoots = [realpath(__DIR__), realpath($_SERVER['DOCUMENT_ROOT'] ?? __DIR__)];
        foreach ($publicRoots as $root) {
            if ($root !== false && ($resolved === $root || strpos($resolved . '/', rtrim($root, '/') . '/') === 0)) {
                throw new RuntimeException('Log directory must be outside document root');
            }
        }
        $path = $directory . '/contact-events-' . gmdate('Y-m-d') . '.log';
        if (@file_put_contents($path, $line, FILE_APPEND | LOCK_EX) === false) {
            throw new RuntimeException('Private log unavailable');
        }
        // Retain operational metadata for 30 days; never touch legacy enquiry logs.
        foreach (glob($directory . '/contact-events-????-??-??.log') ?: [] as $oldPath) {
            if (basename($oldPath) < 'contact-events-' . gmdate('Y-m-d', time() - 30 * 86400) . '.log') {
                @unlink($oldPath);
            }
        }
    } catch (Throwable $e) {
        // Metadata only: do not forward mail errors, request data or exception text.
        error_log('LuxCraft contact event: ' . trim($line));
    } finally {
        umask($oldUmask);
    }
};

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.html');
    exit;
}

$sanitize = static function (?string $value): string {
    return trim(filter_var($value ?? '', FILTER_SANITIZE_FULL_SPECIAL_CHARS));
};

$name = $sanitize($_POST['name'] ?? '');
$email = $sanitize($_POST['email'] ?? '');
$phone = $sanitize($_POST['phone'] ?? '');
$project = $sanitize($_POST['project'] ?? '');
$source = $sanitize($_POST['source'] ?? '');
$message = $sanitize($_POST['message'] ?? '');
$privacyAccepted = isset($_POST['privacy']);

// Anti-spam checks
$honeypot = $_POST['company_website'] ?? '';

$errors = [];
$mailSent = false;
$errorDetails = null;

if ($honeypot !== '') {
    // Silent Rejection: Honeypot field was filled (likely a bot).
    // Log the spam attempt for auditing, bypass sending mail, and display
    // a standard success response so the bot assumes its submission succeeded.
    $logEvent(['status' => 'honeypot_triggered_silent_rejection']);

    $mailSent = true;
} else {
    if ($name === '') {
        $errors[] = 'Please provide your full name.';
    }

    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email address or leave the field blank.';
    }

    $cleanPhone = preg_replace('/[\s\-\(\)\.]/', '', $phone);
    $nationalPhone = preg_replace('/^(?:\+65|0065|65)/', '', $cleanPhone);

    if ($phone === '') {
        $errors[] = 'Please provide your contact number.';
    } elseif (!preg_match('/^[689]\d{7}$/', $nationalPhone)) {
        $errors[] = 'Please provide a valid Singapore contact number (8 digits starting with 6, 8, or 9, e.g. +65 8XXX XXXX).';
    }

    if (!$privacyAccepted) {
        $errors[] = 'You must accept the privacy policy before submitting.';
    }

    if (!$errors) {
        $recipient = 'contact@luxcraft.sg, sean.soo@luxcraft.sg';
        $subject = 'LuxCraft Consultation Request';

        $lines = [
            "Full Name: {$name}",
            "Contact Number: {$phone}",
        ];

        if ($email !== '') {
            $lines[] = "Email: {$email}";
        }
        else {
            $lines[] = 'Email: (not provided)';
        }

        if ($project !== '') {
            $lines[] = "Project Type: {$project}";
        }

        if ($source !== '') {
            $lines[] = "Where did you hear about us: {$source}";
        }

        if ($message !== '') {
            $lines[] = "Project Details:\n{$message}";
        }

        $lines[] = 'Privacy Policy Accepted: Yes';

        $body = implode("\n\n", $lines);

        $headers = [
            'From: LuxCraft Website <no-reply@luxcraft.sg>',
            'Content-Type: text/plain; charset=utf-8',
            'Return-Path: no-reply@luxcraft.sg',
            'X-Mailer: PHP/' . PHP_VERSION,
        ];

        if ($email !== '') {
            $headers[] = "Reply-To: {$email}";
        }
        else {
            $headers[] = 'Reply-To: no-reply@luxcraft.sg';
        }

        error_clear_last();
        $compiledHeaders = implode("\r\n", $headers);
        $envelopeSender = '-fno-reply@luxcraft.sg';

        if (!ini_get('safe_mode')) {
            $mailSent = @mail($recipient, $subject, $body, $compiledHeaders, $envelopeSender);
        }
        else {
            $mailSent = @mail($recipient, $subject, $body, $compiledHeaders);
        }
        $mailError = error_get_last();

        if (!$mailSent) {
            $errors[] = 'We were unable to send your message. Please try again later or contact us directly at contact@luxcraft.sg.';
            $errorDetails = $mailError['message'] ?? 'mail() returned false without additional error information.';
        }
    }

    $status = 'success';
    if (!$mailSent) {
        $status = $errorDetails !== null ? 'mail_failure' : 'validation_failed';
    }

    $logEvent(['status' => $status]);
}

$pageTitle = $errors ? 'Submission Error' : 'Thank You';
$statusClass = $errors ? 'error' : 'success';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        <?= $pageTitle?> – LuxCraft
    </title>
    <link rel="stylesheet" href="/assets/styles.css">
    <script src="/assets/js/analytics.js?v=1.0.1" defer></script>
    <?php if (empty($errors)): ?>
    <script>
        window.fbq = window.fbq || function() {
            window.fbq.queue = window.fbq.queue || [];
            window.fbq.queue.push(arguments);
        };
        fbq('track', 'Lead');
    </script>
    <?php endif; ?>
    <style>
        .contact-response {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f6f4;
            padding: 3rem 1.5rem;
        }

        .contact-response__card {
            max-width: 640px;
            width: 100%;
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 24px 60px rgb(12 11 10 / 8%);
            padding: 3rem;
            text-align: center;
        }

        .contact-response__card h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #1e1b18;
        }

        .contact-response__card p {
            color: #4b463f;
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .contact-response__card ul {
            text-align: left;
            margin: 1.5rem 0;
            padding-left: 1.25rem;
            color: #b42318;
        }

        .contact-response__actions {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }

        .contact-response__actions a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.9rem 1.6rem;
            border-radius: 999px;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .contact-response__actions a.primary {
            background: #9e7b4f;
            color: #fff;
            box-shadow: 0 14px 30px rgb(158 123 79 / 25%);
        }

        .contact-response__actions a.secondary {
            background: #ebe4dc;
            color: #1e1b18;
        }

        .contact-response__actions a:hover {
            transform: translateY(-2px);
        }

        .contact-response__status-icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            display: grid;
            place-items: center;
            font-size: 2rem;
            color: #fff;
        }

        .contact-response__status-icon.success {
            background: #1c7c54;
        }

        .contact-response__status-icon.error {
            background: #b42318;
        }
    </style>
</head>

<body>
    <main class="contact-response">
        <div class="contact-response__card">
            <div class="contact-response__status-icon <?= $statusClass?>">
                <?= $errors ? '!' : '&#10003;'?>
            </div>
            <h1>
                <?= $errors ? 'We hit a snag' : 'Thank you for reaching out'?>
            </h1>

            <?php if ($errors): ?>
            <p>We couldn't process your submission because of the following:</p>
            <ul>
                <?php foreach ($errors as $error): ?>
                <li>
                    <?= $error?>
                </li>
                <?php
    endforeach; ?>
            </ul>
            <?php if ($errorDetails): ?>
            <p style="font-size:0.875rem;color:#85796b;">
                Diagnostic hint:
                <?= htmlspecialchars($errorDetails, ENT_QUOTES, 'UTF-8'); ?>
            </p>
            <?php
    endif; ?>
            <p>Please go back and correct the highlighted items, then try submitting the form again.</p>
            <?php
else: ?>
            <p>Your consultation request has been sent successfully. A member of the LuxCraft team will get back to you
                within one business day.</p>
            <?php if ($mailSent): ?>
            <p>We've emailed the details to our team at <strong>contact@luxcraft.sg</strong>.</p>
            <?php
    endif; ?>
            <?php
endif; ?>

            <div class="contact-response__actions">
                <a class="primary" href="/contact.html">Back to Contact Page</a>
                <a class="secondary" href="/index.html">Return Home</a>
            </div>
        </div>
    </main>
</body>

</html>