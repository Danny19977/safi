<?php
include 'connection.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$ordernumber = trim($_GET['ordernumber'] ?? '');

if (empty($ordernumber)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Order number is required']);
    exit;
}

$ordernumber = $conn->real_escape_string($ordernumber);

$stmt = $conn->prepare(
    "SELECT o.uuid, o.ordernumber, o.ordername, o.name, o.phone,
            o.address, o.type, o.quantity, o.status,
            o.notes, o.created_at,
            oi.uuid as item_uuid, oi.name as item_name, oi.type as item_type,
            oi.quantity as item_qty,
            e.uuid as export_uuid, e.exponumber, e.country, e.tracking_number, e.status as export_status
     FROM coffeeorder o
     LEFT JOIN order_item oi ON oi.coffeeorder_uuid = o.uuid
     LEFT JOIN export e ON e.orderitem_uuid = oi.uuid
     WHERE o.ordernumber = ?"
);
$stmt->bind_param('s', $ordernumber);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Order not found']);
    $stmt->close();
    $conn->close();
    exit;
}

$order = null;
$items = [];

while ($row = $result->fetch_assoc()) {
    if (!$order) {
        $order = [
            'uuid'          => $row['uuid'],
            'ordernumber'   => $row['ordernumber'],
            'ordername'     => $row['ordername'],
            'name'          => $row['name'],
            'phone'         => $row['phone'],
            'email'         => $row['email'],
            'address'       => $row['address'],
            'delivery_zone' => $row['delivery_zone'],
            'type'          => $row['type'],
            'quantity'      => $row['quantity'],
            'status'        => $row['status'],
            'notes'         => $row['notes'],
            'created_at'    => $row['created_at'],
        ];
    }
    if ($row['item_uuid']) {
        $item = [
            'uuid'       => $row['item_uuid'],
            'name'       => $row['item_name'],
            'type'       => $row['item_type'],
            'quantity'   => $row['item_qty'],
        ];
        if ($row['export_uuid']) {
            $item['export'] = [
                'uuid'            => $row['export_uuid'],
                'exponumber'      => $row['exponumber'],
                'country'         => $row['country'],
                // 'shipping_method' => $row['shipping_method'],
                'tracking_number' => $row['tracking_number'],
                'status'          => $row['export_status'],
            ];
        }
        $items[] = $item;
    }
}

$stmt->close();
$conn->close();

$order['items'] = $items;
echo json_encode(['success' => true, 'order' => $order]);
