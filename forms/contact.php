<?php

declare(strict_types=1);

$contactPage = '../contact.html';

function redirect_with_status(string $page, string $status, string $message): never
{
    $query = http_build_query([
        'contact_status' => $status,
        'contact_message' => $message,
    ]);

    header('Location: ' . $page . '?' . $query);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $contactPage);
    exit;
}

$fullName = trim((string) ($_POST['full_name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$privacyAccepted = isset($_POST['privacy']);

if (
    $fullName === ''
    || $phone === ''
    || $email === ''
    || $subject === ''
    || $message === ''
    || !$privacyAccepted
) {
    redirect_with_status($contactPage, 'error', 'Please complete all required fields before submitting the form.');
}

if (mb_strlen($fullName) > 80 || mb_strlen($email) > 120 || mb_strlen($message) > 1200) {
    redirect_with_status($contactPage, 'error', 'Some fields are too long. Please shorten your message and try again.');
}

if (mb_strlen($message) < 20) {
    redirect_with_status($contactPage, 'error', 'Please write a little more detail in your message.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirect_with_status($contactPage, 'error', 'Please enter a valid email address.');
}

if (!preg_match('/^[0-9+\-\s()]{10,20}$/', $phone)) {
    redirect_with_status($contactPage, 'error', 'Please enter a valid phone number.');
}

$allowedSubjects = [
    'General Inquiry',
    'Appointment Support',
    'Emergency Assistance',
    'Feedback',
];

if (!in_array($subject, $allowedSubjects, true)) {
    redirect_with_status($contactPage, 'error', 'Please select a valid subject.');
}

$storageDirectory = __DIR__ . DIRECTORY_SEPARATOR . 'submissions';
$storageFile = $storageDirectory . DIRECTORY_SEPARATOR . 'contact-messages.csv';

if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0775, true) && !is_dir($storageDirectory)) {
    redirect_with_status($contactPage, 'error', 'We could not save your request right now. Please try again shortly.');
}

$handle = fopen($storageFile, 'ab');

if ($handle === false) {
    redirect_with_status($contactPage, 'error', 'We could not save your request right now. Please try again shortly.');
}

$row = [
    date('c'),
    preg_replace('/\s+/', ' ', $fullName),
    preg_replace('/\s+/', ' ', $phone),
    strtolower($email),
    $subject,
    preg_replace('/\s+/', ' ', $message),
    $_SERVER['REMOTE_ADDR'] ?? '',
];

$writeSucceeded = false;

if (flock($handle, LOCK_EX)) {
    if (ftell($handle) === 0) {
        fputcsv($handle, ['submitted_at', 'full_name', 'phone', 'email', 'subject', 'message', 'ip_address']);
    }

    $writeSucceeded = fputcsv($handle, $row) !== false;
    fflush($handle);
    flock($handle, LOCK_UN);
}

fclose($handle);

if (!$writeSucceeded) {
    redirect_with_status($contactPage, 'error', 'We could not save your request right now. Please try again shortly.');
}

redirect_with_status($contactPage, 'success', 'Your message has been sent successfully. Our team will contact you soon.');
