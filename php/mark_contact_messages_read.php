<?php
include 'connection.php';
header('Content-Type: application/json');

function ensureContactTable(mysqli $conn): bool
{
    $sql = "CREATE TABLE IF NOT EXISTS contact (
        uuid CHAR(36) NOT NULL,
        fullname VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (uuid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    if ($conn->query($sql) !== true) {
        return false;
    }

    $columnChecks = [
        'email' => "ALTER TABLE contact ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '' AFTER fullname",
        'is_read' => "ALTER TABLE contact ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0",
        'created_at' => "ALTER TABLE contact ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
    ];

    foreach ($columnChecks as $column => $alterSql) {
        $escapedColumn = $conn->real_escape_string($column);
        $result = $conn->query("SHOW COLUMNS FROM contact LIKE '{$escapedColumn}'");

        if (!$result) {
            return false;
        }

        $exists = $result->num_rows > 0;
        $result->free();

        if (!$exists && $conn->query($alterSql) !== true) {
            return false;
        }
    }

    return true;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    $conn->close();
    exit;
}

if (!ensureContactTable($conn)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not prepare contact table'
    ]);
    $conn->close();
    exit;
}

$uuids = $_POST['uuids'] ?? [];
if (!is_array($uuids)) {
    $uuids = [$uuids];
}

$cleanUuids = [];
foreach ($uuids as $uuid) {
    $value = trim((string)$uuid);

    if ($value === '') {
        continue;
    }

    if (!preg_match('/^[a-f0-9-]{36}$/i', $value)) {
        continue;
    }

    $cleanUuids[] = $value;
}

$cleanUuids = array_values(array_unique($cleanUuids));

if (count($cleanUuids) === 0) {
    echo json_encode([
        'success' => true,
        'message' => 'No messages to update',
        'updated_count' => 0
    ]);
    $conn->close();
    exit;
}

$placeholders = implode(',', array_fill(0, count($cleanUuids), '?'));
$types = str_repeat('s', count($cleanUuids));
$sql = "UPDATE contact SET is_read = 1 WHERE is_read = 0 AND uuid IN ({$placeholders})";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not prepare update statement'
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param($types, ...$cleanUuids);
$success = $stmt->execute();
$updatedCount = $stmt->affected_rows;
$stmt->close();

if (!$success) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not mark selected messages as read'
    ]);
    $conn->close();
    exit;
}

echo json_encode([
    'success' => true,
    'updated_count' => $updatedCount
]);

$conn->close();
?>
