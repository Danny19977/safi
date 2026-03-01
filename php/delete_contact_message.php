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

$uuid = trim($_POST['uuid'] ?? '');

if ($uuid === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Message identifier is required'
    ]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare('DELETE FROM contact WHERE uuid = ?');
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not prepare delete statement'
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param('s', $uuid);
$success = $stmt->execute();
$affectedRows = $stmt->affected_rows;
$stmt->close();

if (!$success) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not delete message'
    ]);
    $conn->close();
    exit;
}

if ($affectedRows === 0) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Message not found'
    ]);
    $conn->close();
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Message deleted successfully'
]);

$conn->close();
?>
