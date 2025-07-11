<?php
session_start();
require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if ($email && $password) {
        // Prepare statement to prevent SQL injection
        $stmt = $conn->prepare("SELECT password FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows === 1) {
            $stmt->bind_result($hashed_password);
            $stmt->fetch();

            if (password_verify($password, $hashed_password)) {
                $_SESSION['user_email'] = $email;
                header("Location: ../dashboard.html");
                exit;
            } else {
                echo "Invalid password";
            }
        } else {
            echo "User not found";
        }
        $stmt->close();
    } else {
        echo "Email and password required";
    }
    $conn->close();
    exit;
}
?>
