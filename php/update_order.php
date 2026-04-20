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

$uuid    = trim(strip_tags(isset($input['uuid'])    ? $input['uuid']    : ''));
$name    = trim(strip_tags(isset($input['name'])    ? $input['name']    : ''));
$phone   = trim(strip_tags(isset($input['phone'])   ? $input['phone']   : ''));
$address = trim(strip_tags(isset($input['address']) ? $input['address'] : ''));

if ($uuid === '') {
    http_response_code(400);
    echo json_encode(array('success' => false, 'message' => 'uuid is required'));
    exit;
}
if ($name === '' || $phone === '' || $address === '') {
    http_response_code(400);
    echo json_encode(array('success' => false, 'message' => 'name, phone and address are required'));
    exit;
}

$now  = date('Y-m-d H:i:s');
$stmt = $conn->prepare(
    "UPDATE coffeeorder SET name = ?, phone = ?, address = ?, updated_at = ? WHERE uuid = ?"
);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Prepare failed: ' . $conn->error));
    exit;
}
$stmt->bind_param('sssss', $name, $phone, $address, $now, $uuid);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Execute failed: ' . $stmt->error));
    exit;
}
$affected = $stmt->affected_rows;
$stmt->close();
$conn->close();

echo json_encode(array('success' => true, 'updated' => $affected));
