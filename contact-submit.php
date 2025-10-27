<?php
declare(strict_types=1);

const CONTACT_LOG_PATH = __DIR__ . '/logs/contact-form.log';

$logEvent = static function (array $payload): void {
    $payload['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $payload['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $payload['timestamp'] = gmdate('c');
    $payload['sendmail_path'] = ini_get('sendmail_path') ?: null;
    $payload['smtp'] = ini_get('SMTP') ?: null;
    $payload['smtp_port'] = ini_get('smtp_port') ?: null;

    try {
        $logLine = json_encode($payload, JSON_THROW_ON_ERROR);
        file_put_contents(CONTACT_LOG_PATH, $logLine . PHP_EOL, FILE_APPEND | LOCK_EX);
    } catch (Throwable $e) {
        // If logging fails we silently ignore—form should still complete.
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
$message = $sanitize($_POST['message'] ?? '');
$privacyAccepted = isset($_POST['privacy']);

$errors = [];

if ($name === '') {
    $errors[] = 'Please provide your full name.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (!$privacyAccepted) {
    $errors[] = 'You must accept the privacy policy before submitting.';
}

$mailSent = false;
$errorDetails = null;
if (!$errors) {
    $recipient = 'sean.soo@luxcraft.sg';
    $subject = 'LuxCraft Consultation Request';

    $lines = [
        "Full Name: {$name}",
        "Email: {$email}",
    ];

    if ($phone !== '') {
        $lines[] = "Contact Number: {$phone}";
    }

    if ($project !== '') {
        $lines[] = "Project Type: {$project}";
    }

    if ($message !== '') {
        $lines[] = "Project Details:\n{$message}";
    }

    $lines[] = 'Privacy Policy Accepted: Yes';

    $body = implode("\n\n", $lines);

    $headers = [
        'From: LuxCraft Website <no-reply@luxcraft.sg>',
        "Reply-To: {$email}",
        'Content-Type: text/plain; charset=utf-8',
    ];

    error_clear_last();
    $mailSent = @mail($recipient, $subject, $body, implode("\r\n", $headers));
    $mailError = error_get_last();

    if (!$mailSent) {
        $errors[] = 'We were unable to send your message. Please try again later or contact us directly at contact@luxcraft.sg.';
        $errorDetails = $mailError['message'] ?? 'mail() returned false without additional error information.';
    }
}

$logEvent([
    'status' => $mailSent ? 'success' : 'failure',
    'inputs' => [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'project' => $project,
    ],
    'transport' => 'mail()',
    'error' => $errorDetails,
]);

$pageTitle = $errors ? 'Submission Error' : 'Thank You';
$statusClass = $errors ? 'error' : 'success';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?> – LuxCraft</title>
    <link rel="stylesheet" href="assets/styles.css">
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
        <div class="contact-response__status-icon <?= $statusClass ?>">
            <?= $errors ? '!' : '&#10003;' ?>
        </div>
        <h1><?= $errors ? 'We hit a snag' : 'Thank you for reaching out' ?></h1>

        <?php if ($errors): ?>
            <p>We couldn't process your submission because of the following:</p>
            <ul>
                <?php foreach ($errors as $error): ?>
                    <li><?= $error ?></li>
                <?php endforeach; ?>
            </ul>
            <?php if ($errorDetails): ?>
                <p style="font-size:0.875rem;color:#85796b;">
                    Diagnostic hint: <?= htmlspecialchars($errorDetails, ENT_QUOTES, 'UTF-8'); ?>
                </p>
            <?php endif; ?>
            <p>Please go back and correct the highlighted items, then try submitting the form again.</p>
        <?php else: ?>
            <p>Your consultation request has been sent successfully. A member of the LuxCraft team will get back to you within one business day.</p>
            <?php if ($mailSent): ?>
                <p>We've emailed the details to our team at <strong>sean.soo@luxcraft.sg</strong>.</p>
            <?php endif; ?>
        <?php endif; ?>

        <div class="contact-response__actions">
            <a class="primary" href="contact.html">Back to Contact Page</a>
            <a class="secondary" href="index.html">Return Home</a>
        </div>
    </div>
</main>
</body>
</html>
