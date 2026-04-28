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

$uuid = trim(strip_tags(isset($input['uuid']) ? $input['uuid'] : ''));
if ($uuid === '') {
    http_response_code(400);
    echo json_encode(array('success' => false, 'message' => 'uuid is required'));
    exit;
}

// Delete child order_item rows first (FK integrity)
$stmt1 = $conn->prepare("DELETE FROM order_item WHERE coffeeorder_uuid = ?");
if ($stmt1) {
    $stmt1->bind_param('s', $uuid);
    $stmt1->execute();
    $stmt1->close();
}

$stmt2 = $conn->prepare("DELETE FROM coffeeorder WHERE uuid = ?");
if (!$stmt2) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Prepare failed: ' . $conn->error));
    $conn->close();
    exit;
}
$stmt2->bind_param('s', $uuid);
if (!$stmt2->execute()) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Execute failed: ' . $stmt2->error));
    $stmt2->close();
    $conn->close();
    exit;
}
$affected = $stmt2->affected_rows;
$stmt2->close();
$conn->close();

echo json_encode(array('success' => true, 'deleted' => $affected));
