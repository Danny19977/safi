<?php
include 'connection.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['users_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$title = $_POST['title'] ?? '';
$content = $_POST['content'] ?? '';
$category_id = $_POST['category_id'] ?? '';
$status = isset($_POST['publishNow']) && $_POST['publishNow'] === 'true' ? 1 : 0;
$users_id = $_SESSION['users_id'];
$image_url = '';

// Handle image upload
if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
    $targetDir = "../uploads/";
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    $filename = uniqid() . "_" . basename($_FILES["image"]["name"]);
    $targetFile = $targetDir . $filename;
    if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFile)) {
        $image_url = "uploads/" . $filename;
    }
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
