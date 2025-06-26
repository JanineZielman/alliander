<?php
session_start();

// Set your password
$correct_password = "af2025!";  // Change this!

// Define the upload directory
$upload_dir = __DIR__ . '/../uploads/';

// Ensure the upload directory exists
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Handle login
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['password'])) {
    if ($_POST['password'] === $correct_password) {
        $_SESSION['authenticated'] = true; // Store login state in session
    } else {
        die("Incorrect password.");
    }
}

// Check if the user is authenticated
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    echo "<h2>Login Required</h2>
    <form method='post'>
        Password: <input type='password' name='password' required>
        <input type='submit' value='Enter'>
    </form>";
    exit;
}

// Handle file upload
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES['image'])) {
    // Ensure an image is uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        die("Error uploading file.");
    }

    // Allowed file types
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($_FILES["image"]["type"], $allowed_types)) {
        die("Only JPG, PNG, and GIF files are allowed.");
    }

    // Generate a unique filename
    $filename = basename($_FILES["image"]["name"]);
    $target_file = $upload_dir . $filename;

    // Move the uploaded file
    if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
        echo "<p>File uploaded successfully: <a href='view_image2.php?file=$filename'>$filename</a></p>";
    } else {
        echo "<p>Failed to upload file.</p>";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Gallery</title>
    <link rel="stylesheet" href="style.css">
    <script>
        // Disable right-click to prevent easy downloads
        document.addEventListener("contextmenu", function(e) {
            e.preventDefault();
        });
    </script>
</head>
<body>

<h2>Upload an Image</h2>
<form action="" method="post" enctype="multipart/form-data">
    Select image: <input type="file" name="image" required>
    <input type="submit" value="Upload Image">
</form>

<hr>

<h2>Uploaded Images</h2>
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
<?php
// Get all image files in the directory
$files = array_diff(scandir($upload_dir), ['.', '..']);

// Allowed file extensions
$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];

foreach ($files as $file) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    if (in_array($ext, $allowed_extensions)) {
        echo "<div>
            <img src='view_image2.php?file=$file' style='max-width: 150px; height: auto; display: block; pointer-events: none;'/>
            <a href='view_image2.php?file=$file'>$file</a>
        </div>";
    }
}
?>
</div>

</body>
</html>
