<?php
session_start();

$upload_dir = __DIR__ . '/../uploads/';

// Check if user is authenticated
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    die("Access denied.");
}

// Validate file
$file = basename($_GET['file']);
$filepath = realpath($upload_dir . $file);

// Prevent directory traversal attack
if (!$filepath || strpos($filepath, realpath($upload_dir)) !== 0 || !file_exists($filepath)) {
    die("Invalid file.");
}

// Get the MIME type and display the image
$mime = mime_content_type($filepath);
header("Content-Type: $mime");
readfile($filepath);
?>
