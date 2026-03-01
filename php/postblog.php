<?php
include 'connection.php';
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['users_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$title = $_POST['title'] ?? '';
$content = $_POST['content'] ?? '';
$category_id = $_POST['category_id'] ?? '';
$status = isset($_POST['publishNow']) && $_POST['publishNow'] === 'true' ? 1 : 0;
$users_id = (int)$_SESSION['users_id'];
$image_url = '';

$title = trim($title);
$content = trim($content);

if ($title === '' || $content === '') {
    echo json_encode(['success' => false, 'message' => 'Title and content are required']);
    exit;
}

if (!is_numeric($category_id)) {
    $categoryMap = [
        'coffee' => 1,
        'recipes' => 2,
        'news' => 3,
        'events' => 4
    ];
    $normalizedCategory = strtolower(trim((string)$category_id));
    $category_id = $categoryMap[$normalizedCategory] ?? 0;
}

$category_id = (int)$category_id;

// Handle multiple image uploads (max 10)
$uploadedImages = [];
$targetDir = "../uploads/";

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (isset($_FILES['images']) && isset($_FILES['images']['name']) && is_array($_FILES['images']['name'])) {
    $totalImages = count($_FILES['images']['name']);

    if ($totalImages > 10) {
        echo json_encode(['success' => false, 'message' => 'You can upload a maximum of 10 images']);
        exit;
    }

    for ($index = 0; $index < $totalImages; $index++) {
        $errorCode = $_FILES['images']['error'][$index] ?? UPLOAD_ERR_NO_FILE;

        if ($errorCode !== UPLOAD_ERR_OK) {
            continue;
        }

        $tmpName = $_FILES['images']['tmp_name'][$index] ?? '';
        $originalName = $_FILES['images']['name'][$index] ?? '';

        if ($tmpName === '' || $originalName === '') {
            continue;
        }

        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        if (!in_array($extension, $allowedExtensions, true)) {
            continue;
        }

        $filename = uniqid('blog_', true) . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', basename($originalName));
        $targetFile = $targetDir . $filename;

        if (move_uploaded_file($tmpName, $targetFile)) {
            $uploadedImages[] = "uploads/" . $filename;
        }
    }
} elseif (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    // Backward compatibility with old single-image field
    $originalName = $_FILES['image']['name'] ?? '';
    $tmpName = $_FILES['image']['tmp_name'] ?? '';
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if ($originalName !== '' && $tmpName !== '' && in_array($extension, $allowedExtensions, true)) {
        $filename = uniqid('blog_', true) . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', basename($originalName));
        $targetFile = $targetDir . $filename;
        if (move_uploaded_file($tmpName, $targetFile)) {
            $uploadedImages[] = "uploads/" . $filename;
        }
    }
}

if (!empty($uploadedImages)) {
    $image_url = json_encode($uploadedImages, JSON_UNESCAPED_SLASHES);
}

$stmt = $conn->prepare("INSERT INTO blogposts (title, content, users_id, category_id, published_at, image_url, status) VALUES (?, ?, ?, ?, NOW(), ?, ?)");
$stmt->bind_param("ssiisi", $title, $content, $users_id, $category_id, $image_url, $status);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
$stmt->close();
$conn->close();
?>
