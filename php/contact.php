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

function generateUuidV4(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
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

$fullname = trim($_POST['fullname'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($fullname === '' || $email === '' || $subject === '' || $message === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Full name, email, subject and message are required'
    ]);
    $conn->close();
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a valid email address'
    ]);
    $conn->close();
    exit;
}

if (mb_strlen($fullname) > 150 || mb_strlen($email) > 255 || mb_strlen($subject) > 255) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Input is too long'
    ]);
    $conn->close();
    exit;
}

$uuid = generateUuidV4();
$stmt = $conn->prepare('INSERT INTO contact (uuid, fullname, email, subject, message) VALUES (?, ?, ?, ?, ?)');

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not prepare insert statement'
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param('sssss', $uuid, $fullname, $email, $subject, $message);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Message submitted successfully',
        'uuid' => $uuid
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not save your message. Please try again.'
    ]);
}

$stmt->close();
$conn->close();
?>
