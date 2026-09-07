<?php

declare(strict_types=1);

$careerPage = '../career.html';

function career_redirect(string $status, string $message): never
{
    global $careerPage;
    header('Location: ' . $careerPage . '?' . http_build_query([
        'career_status' => $status,
        'career_message' => $message,
    ]));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $careerPage);
    exit;
}

$fullName = trim((string) ($_POST['full_name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$careerArea = trim((string) ($_POST['career_area'] ?? ''));
$qualification = trim((string) ($_POST['qualification'] ?? ''));
$experience = trim((string) ($_POST['experience'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

$allowedAreas = [
    'Doctors & Clinical Care', 'Nursing', 'Diagnostics & Technical Support',
    'Pharmacy', 'Administration & Front Office', 'Hospital Operations & Support', 'Other',
];
$allowedExperience = ['Fresher', 'Less than 1 year', '1-3 years', '3-5 years', '5+ years'];

if ($fullName === '' || $phone === '' || $email === '' || $careerArea === '' || $qualification === '' || $experience === '') {
    career_redirect('error', 'Please complete all required fields.');
}
if (mb_strlen($fullName) > 80 || mb_strlen($email) > 120 || mb_strlen($qualification) > 120 || mb_strlen($message) > 600) {
    career_redirect('error', 'Some fields are too long. Please shorten them and try again.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[0-9+\-\s()]{10,20}$/', $phone)) {
    career_redirect('error', 'Please enter a valid email address and phone number.');
}
if (!in_array($careerArea, $allowedAreas, true) || !in_array($experience, $allowedExperience, true)) {
    career_redirect('error', 'Please select valid career details.');
}

$resume = $_FILES['resume'] ?? null;
if (!is_array($resume) || ($resume['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    career_redirect('error', 'Please upload your CV or resume.');
}
if (($resume['size'] ?? 0) < 1 || $resume['size'] > 5 * 1024 * 1024) {
    career_redirect('error', 'Your CV must be smaller than 5 MB.');
}

$extension = strtolower(pathinfo((string) $resume['name'], PATHINFO_EXTENSION));
if (!in_array($extension, ['pdf', 'doc', 'docx'], true)) {
    career_redirect('error', 'Please upload a PDF, DOC or DOCX file.');
}

$storageDirectory = __DIR__ . DIRECTORY_SEPARATOR . 'submissions';
$uploadDirectory = $storageDirectory . DIRECTORY_SEPARATOR . 'career-resumes';
if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0775, true) && !is_dir($uploadDirectory)) {
    career_redirect('error', 'We could not save your application right now. Please try again shortly.');
}

$storedResume = bin2hex(random_bytes(16)) . '.' . $extension;
if (!move_uploaded_file((string) $resume['tmp_name'], $uploadDirectory . DIRECTORY_SEPARATOR . $storedResume)) {
    career_redirect('error', 'We could not save your CV right now. Please try again shortly.');
}

$storageFile = $storageDirectory . DIRECTORY_SEPARATOR . 'career-applications.csv';
$handle = fopen($storageFile, 'ab');
if ($handle === false) {
    @unlink($uploadDirectory . DIRECTORY_SEPARATOR . $storedResume);
    career_redirect('error', 'We could not save your application right now. Please try again shortly.');
}

$row = [
    date('c'), preg_replace('/\s+/', ' ', $fullName), preg_replace('/\s+/', ' ', $phone), strtolower($email),
    $careerArea, preg_replace('/\s+/', ' ', $qualification), $experience, preg_replace('/\s+/', ' ', $message),
    $storedResume, basename((string) $resume['name']), $_SERVER['REMOTE_ADDR'] ?? '',
];
$written = false;
if (flock($handle, LOCK_EX)) {
    if (ftell($handle) === 0) {
        fputcsv($handle, ['submitted_at', 'full_name', 'phone', 'email', 'career_area', 'qualification', 'experience', 'message', 'resume_file', 'resume_original_name', 'ip_address']);
    }
    $written = fputcsv($handle, $row) !== false;
    fflush($handle);
    flock($handle, LOCK_UN);
}
fclose($handle);

if (!$written) {
    @unlink($uploadDirectory . DIRECTORY_SEPARATOR . $storedResume);
    career_redirect('error', 'We could not save your application right now. Please try again shortly.');
}

career_redirect('success', 'Your application has been submitted successfully. Our team will review it and contact you if there is a suitable opportunity.');
