<?php
// Ensure a file parameter is provided
if (!isset($_GET['file'])) {
    die("No file specified.");
}

$filename = basename($_GET['file']); // Prevent directory traversal attacks
$file_path = __DIR__ . '/../uploads/' . $filename;

if (!file_exists($file_path)) {
    die("File not found.");
}

// Get the MIME type dynamically
$mime_type = mime_content_type($file_path);

// Serve the image securely
header("Content-Type: $mime_type");
readfile($file_path);
?>
