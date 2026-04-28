<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "cafeblog";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}


// $servername = "localhost";
// $username = "n6i9y4c6sgdq";
// $password = "SS#Sfd%#5tAh";
// $dbname = "cafeblog";
 // Replace with your actual database name

// Create connection
// $conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }

// Connection successful
