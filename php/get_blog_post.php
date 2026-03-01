<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'connection.php';

$ref = isset($_GET['ref']) ? trim($_GET['ref']) : '';

$sql = "
    SELECT
        title,
        content,
        users_id,
        category_id,
        published_at,
        image_url,
        status
    FROM blogposts
    WHERE status = 1
    ORDER BY published_at DESC
";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch blog post'
    ]);
    $conn->close();
    exit;
}

$foundPost = null;

while ($row = $result->fetch_assoc()) {
    $title = trim((string)($row['title'] ?? ''));
    $publishedAt = (string)($row['published_at'] ?? '');
    $usersId = (string)($row['users_id'] ?? '0');
    $computedRef = sha1($title . '|' . $publishedAt . '|' . $usersId);

    if ($ref === '' || hash_equals($computedRef, $ref)) {
        $storedImageValue = trim((string)($row['image_url'] ?? ''));
        $decodedImages = json_decode($storedImageValue, true);
        $images = [];

        if (is_array($decodedImages)) {
            foreach ($decodedImages as $imageItem) {
                $safeImage = trim((string)$imageItem);
                if ($safeImage !== '') {
                    $images[] = $safeImage;
                }
            }
        } elseif ($storedImageValue !== '') {
            $images[] = $storedImageValue;
        }

        $primaryImage = !empty($images) ? $images[0] : '';

        $foundPost = [
            'ref' => $computedRef,
            'title' => $title,
            'content' => trim((string)($row['content'] ?? '')),
            'users_id' => (int)$usersId,
            'category_id' => (int)($row['category_id'] ?? 0),
            'published_at' => $publishedAt,
            'image_url' => $primaryImage,
            'images' => $images
        ];
        break;
    }
}

if ($foundPost === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Blog post not found'
    ]);
    $conn->close();
    exit;
}

echo json_encode([
    'success' => true,
    'post' => $foundPost
]);

$conn->close();
?>