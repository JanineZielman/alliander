<?php
// Set your password
$correct_password = "yourpassword";  // Change this!

// Check if the password is correct
if ($_POST['password'] !== $correct_password) {
    die("Incorrect password.");
}

// Ensure an image is uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    die("Error uploading file.");
}

// Define the secure upload directory (outside public_html)
$upload_dir = __DIR__ . '/../uploads/';

// Ensure the upload directory exists
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Generate a unique filename
$filename = basename($_FILES["image"]["name"]);
$target_file = $upload_dir . $filename;

// Allowed file types
$allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($_FILES["image"]["type"], $allowed_types)) {
    die("Only JPG, PNG, and GIF files are allowed.");
}

// Move the uploaded file
if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
    echo "File uploaded successfully: <a href='view_image.php?file=$filename'>$filename</a>";
} else {
    echo "Failed to upload file.";
}
?>
