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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function safi_uuid()
{
    $data    = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function safi_order_number()
{
    return 'SAFI-' . strtoupper(substr(uniqid(), -6)) . '-' . date('Ymd');
}

function safi_ensure_tables($conn)
{
    $tables = array();

    $tables[] = "CREATE TABLE IF NOT EXISTS coffeeorder (
        uuid CHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        type ENUM('hot_drink','pack') NOT NULL,
        quntity INT NOT NULL DEFAULT 1,
        ordernumber VARCHAR(60) NOT NULL,
        ordername VARCHAR(255) NOT NULL,
        PRIMARY KEY (uuid),
        UNIQUE KEY uk_ordernumber (ordernumber)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $tables[] = "CREATE TABLE IF NOT EXISTS order_item (
        uuid CHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        coffeeorder_uuid CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        PRIMARY KEY (uuid),
        KEY fk_order_item_coffeeorder (coffeeorder_uuid),
        CONSTRAINT fk_order_item_coffeeorder FOREIGN KEY (coffeeorder_uuid)
            REFERENCES coffeeorder(uuid) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $tables[] = "CREATE TABLE IF NOT EXISTS export (
        uuid CHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        exponumber VARCHAR(60) NOT NULL,
        country VARCHAR(150) NOT NULL,
        orderitem_uuid CHAR(36) NOT NULL,
        -- shipping_method VARCHAR(100) NOT NULL DEFAULT 'standard',
        tracking_number VARCHAR(100),
        status ENUM('pending','processing','shipped','delivered') NOT NULL DEFAULT 'pending',
        PRIMARY KEY (uuid),
        UNIQUE KEY uk_exponumber (exponumber),
        KEY fk_export_orderitem (orderitem_uuid),
        CONSTRAINT fk_export_orderitem FOREIGN KEY (orderitem_uuid)
            REFERENCES order_item(uuid) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    foreach ($tables as $sql) {
        if ($conn->query($sql) !== true) {
            error_log('Table creation error: ' . $conn->error);
            return false;
        }
    }
    return true;
}

// ── Method check ─────────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'message' => 'Method not allowed'));
    exit;
}

// ── Parse input ──────────────────────────────────────────────────────────────

$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

// ── Required field validation ─────────────────────────────────────────────────

$required = array('name', 'phone', 'address', 'type', 'items');
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(array('success' => false, 'message' => "Field '$field' is required"));
        exit;
    }
}

// ── Sanitise inputs ───────────────────────────────────────────────────────────

$name    = trim(strip_tags($input['name']));
$phone   = trim(strip_tags($input['phone']));
$address = trim(strip_tags($input['address']));
$notes   = trim(strip_tags(isset($input['notes'])   ? $input['notes']   : ''));
$country = trim(strip_tags(isset($input['country']) ? $input['country'] : 'RDC'));
$type    = ($input['type'] === 'pack') ? 'pack' : 'hot_drink';
$items   = $input['items'];

// ── Delivery zone ─────────────────────────────────────────────────────────────

if ($type === 'hot_drink') {
    $delivery_zone = 'kinshasa_gombe';
} else {
    $raw_zone      = strtolower(isset($input['delivery_zone']) ? $input['delivery_zone'] : 'rdc');
    $delivery_zone = ($raw_zone === 'international') ? 'international' : 'rdc';
}

if ($type === 'hot_drink' && $delivery_zone !== 'kinshasa_gombe') {
    http_response_code(400);
    echo json_encode(array('success' => false, 'message' => 'Hot drinks are only delivered in Kinshasa Gombe'));
    exit;
}

// ── Items validation ──────────────────────────────────────────────────────────

if (!is_array($items) || count($items) === 0) {
    http_response_code(400);
    echo json_encode(array('success' => false, 'message' => 'Order must contain at least one item'));
    exit;
}

$allowedHotDrinks = array(
    'Chocolate Chaud', 'Americano', 'Cafe au Lait', 'Cafe glace', 'Mocha',
    'The au lait', 'Capuccino', 'Espresso', 'The au citron',
    'Cafe au gingembre', 'The au gingembre +miel'
);
$allowedPacks = array('Pack 250g', 'Pack 500g', 'Pack 1kg', 'Pack 5kg', 'Pack 10kg', 'Pack 25kg');
$allowedItems = ($type === 'hot_drink') ? $allowedHotDrinks : $allowedPacks;

foreach ($items as $item) {
    if (empty($item['name']) || !isset($item['quantity']) || (int)$item['quantity'] < 1) {
        http_response_code(400);
        echo json_encode(array('success' => false, 'message' => 'Each item needs a name and quantity >= 1'));
        exit;
    }
    if (!in_array($item['name'], $allowedItems, true)) {
        http_response_code(400);
        echo json_encode(array(
            'success' => false,
            'message' => 'Item "' . htmlspecialchars($item['name']) . '" is not a valid product'
        ));
        exit;
    }
}

// ── Prepare tables ────────────────────────────────────────────────────────────

if (!safi_ensure_tables($conn)) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Could not prepare database tables'));
    exit;
}

// ── Insert ────────────────────────────────────────────────────────────────────

$conn->begin_transaction();

try {
    $orderUuid   = safi_uuid();
    $orderNumber = safi_order_number();

    $totalQty   = 0;
    foreach ($items as $it) {
        $totalQty += (int)$it['quantity'];
    }
    $now       = date('Y-m-d H:i:s');
    $itemCount = count($items); // ordername column is int(11)

    $stmt = $conn->prepare(
        "INSERT INTO coffeeorder
            (uuid, created_at, updated_at, name, phone, address, type, quntity, ordernumber, ordername)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    if (!$stmt) {
        throw new Exception('Prepare coffeeorder: ' . $conn->error);
    }
    $quntityStr = (string)$totalQty; // column is varchar(50)
    $stmt->bind_param(
        'sssssssssi',
        $orderUuid, $now, $now, $name, $phone, $address,
        $type, $quntityStr, $orderNumber, $itemCount
    );
    if (!$stmt->execute()) {
        throw new Exception('Execute coffeeorder: ' . $stmt->error);
    }
    $stmt->close();

    $exportEntries = array();

    foreach ($items as $item) {
        $itemUuid  = safi_uuid();
        $itemName  = trim($item['name']);
        $itemQty   = (int)$item['quantity'];

        $itemQtyStr = (string)$itemQty; // column is varchar(50)
        $stmtItem = $conn->prepare(
            "INSERT INTO order_item (uuid, created_at, updated_at, coffeeorder_uuid, name, type, quantity)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        if (!$stmtItem) {
            throw new Exception('Prepare order_item: ' . $conn->error);
        }
        $stmtItem->bind_param('sssssss', $itemUuid, $now, $now, $orderUuid, $itemName, $type, $itemQtyStr);
        if (!$stmtItem->execute()) {
            throw new Exception('Execute order_item: ' . $stmtItem->error);
        }
        $stmtItem->close();

        if ($type === 'pack') {
            $exportUuid   = safi_uuid();
            $exportNumber = 'EXP-' . strtoupper(substr(uniqid(), -6)) . '-' . date('Ymd');
            $shipping     = ($delivery_zone === 'international') ? 'international' : 'local';

            $stmtExp = $conn->prepare(
                "INSERT INTO export (uuid, exponumber, country, orderitem_uuid)
                 VALUES (?, ?, ?, ?)"
            );
            if (!$stmtExp) {
                throw new Exception('Prepare export: ' . $conn->error);
            }
            $stmtExp->bind_param('ssss', $exportUuid, $exportNumber, $country, $itemUuid);
            if (!$stmtExp->execute()) {
                throw new Exception('Execute export: ' . $stmtExp->error);
            }
            $stmtExp->close();

            $exportEntries[] = array(
                'uuid'       => $exportUuid,
                'exponumber' => $exportNumber,
                'orderitem'  => $itemUuid,
            );
        }
    }

    $conn->commit();

    $response = array(
        'success'       => true,
        'message'       => 'Order placed successfully!',
        'ordernumber'   => $orderNumber,
        'order_uuid'    => $orderUuid,
        'type'          => $type,
        'delivery_zone' => $delivery_zone,
    );
    if (!empty($exportEntries)) {
        $response['exports'] = $exportEntries;
    }
    echo json_encode($response);

} catch (Exception $e) {
    $conn->rollback();
    error_log('Order error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'Order failed: ' . $e->getMessage()));
}

$conn->close();
