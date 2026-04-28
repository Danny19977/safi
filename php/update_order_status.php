<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

include 'connection.php';
ob_clean();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'message' => 'Method not allowed'));
    exit;
}

$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) { $input = $_POST; }

$uuid   = trim(strip_tags(isset($input['uuid'])   ? $input['uuid']   : ''));
$status = trim(strip_tags(isset($input['status']) ? $input['status'] : ''));

if ($uuid === '' || $status === '') {
    http_response_code(400);
    echo json_encode(array('success' => false, 'message' => 'uuid and status are required'));
    exit;
}

$allowed_statuses = array('pending', 'delivered', 'not_delivered', 'archived');
if (!in_array($status, $allowed_statuses, true)) {
    http_response_code(400);
    echo json_encode(array('success' => false, 'message' => 'Invalid status value'));
    exit;
}

// Add status column if it doesn't exist yet
$check = $conn->query("SHOW COLUMNS FROM coffeeorder LIKE 'status'");
if ($check && $check->num_rows === 0) {
    $conn->query("ALTER TABLE coffeeorder ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'");
}

$now  = date('Y-m-d H:i:s');
$stmt = $conn->prepare("UPDATE coffeeorder SET status = ?, updated_at = ? WHERE uuid = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Prepare failed: ' . $conn->error));
    exit;
}
$stmt->bind_param('sss', $status, $now, $uuid);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Execute failed: ' . $stmt->error));
    exit;
}
$affected = $stmt->affected_rows;
$stmt->close();
$conn->close();

echo json_encode(array('success' => true, 'updated' => $affected, 'status' => $status));
