<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

include 'connection.php';
ob_clean();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'message' => 'Method not allowed'));
    exit;
}

$allowed_types = array('hot_drink', 'pack');
$type_filter   = isset($_GET['type']) && in_array($_GET['type'], $allowed_types, true)
    ? $_GET['type'] : null;

$where_clause = $type_filter ? "WHERE o.type = '" . $conn->real_escape_string($type_filter) . "'" : '';

// Add status column if it doesn't exist yet
$chk = $conn->query("SHOW COLUMNS FROM coffeeorder LIKE 'status'");
$status_col = ($chk && $chk->num_rows > 0) ? "o.status," : "'pending' AS status,";

$result = $conn->query(
    "SELECT o.uuid, o.created_at, o.name, o.phone, o.address, o.type,
            " . $status_col . "
            o.quntity, o.ordernumber,
            GROUP_CONCAT(i.name ORDER BY i.name SEPARATOR ', ') AS items_list,
            COUNT(i.uuid) AS item_count
     FROM coffeeorder o
     LEFT JOIN order_item i ON i.coffeeorder_uuid = o.uuid
     " . $where_clause . "
     GROUP BY o.uuid, o.created_at, o.name, o.phone, o.address, o.type,
              o.quntity, o.ordernumber
     ORDER BY o.created_at DESC"
);

if (!$result) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Query failed: ' . $conn->error));
    $conn->close();
    exit;
}

$orders = array();
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

echo json_encode(array('success' => true, 'orders' => $orders, 'total' => count($orders)));
$conn->close();
