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
        'message' => 'Failed to fetch blog posts',
        'posts' => []
    ]);
    $conn->close();
    exit;
}

$posts = [];

while ($row = $result->fetch_assoc()) {
    $title = trim((string)($row['title'] ?? ''));
    $content = trim((string)($row['content'] ?? ''));
    $publishedAt = (string)($row['published_at'] ?? '');
    $usersId = (string)($row['users_id'] ?? '0');
    $imageUrl = trim((string)($row['image_url'] ?? ''));
    $decodedImages = json_decode($imageUrl, true);
    $images = [];

    if (is_array($decodedImages)) {
        foreach ($decodedImages as $imageItem) {
            $safeImage = trim((string)$imageItem);
            if ($safeImage !== '') {
                $images[] = $safeImage;
            }
        }
    } elseif ($imageUrl !== '') {
        $images[] = $imageUrl;
    }

    $primaryImage = !empty($images) ? $images[0] : '';
    $categoryId = (int)($row['category_id'] ?? 0);
    $plainContent = strip_tags($content);

    if (function_exists('mb_substr') && function_exists('mb_strlen')) {
        $excerpt = mb_substr($plainContent, 0, 180) . (mb_strlen($plainContent) > 180 ? '...' : '');
    } else {
        $excerpt = substr($plainContent, 0, 180) . (strlen($plainContent) > 180 ? '...' : '');
    }

    $ref = sha1($title . '|' . $publishedAt . '|' . $usersId);

    $posts[] = [
        'ref' => $ref,
        'title' => $title,
        'content' => $content,
        'excerpt' => $excerpt,
        'users_id' => (int)$usersId,
        'category_id' => $categoryId,
        'published_at' => $publishedAt,
        'image_url' => $primaryImage,
        'images' => $images
    ];
}

echo json_encode([
    'success' => true,
    'posts' => $posts
]);

$conn->close();
?>