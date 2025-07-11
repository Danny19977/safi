<?php
header('Content-Type: application/json');
require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['fullname']) ? trim($_POST['fullname']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if ($name === '' || $email === '' || $password === '') {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT users_id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered.']);
        $stmt->close();
        exit;
    }
    $stmt->close();

    $password = password($password, PASSWORD_DEFAULT);
    $profile_picture = ''; // Default empty, can be updated later
    $created_at = date('Y-m-d H:i:s');

    $stmt = $conn->prepare("INSERT INTO users (name, email, password, profile_picture, created_at) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $name, $email, $password, $profile_picture, $created_at);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    }
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?>
