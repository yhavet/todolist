<?php
include 'db_connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); 
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// CAMBIO AQUÍ: Ordenar primero por fecha de vencimiento, luego por ID
$sql = "SELECT * FROM tasks 
        WHERE user_id = $user_id 
        AND is_archived = false 
        ORDER BY due_date ASC, id ASC";

$result = $conn->query($sql);
$tasks = array();

if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $tasks[] = $row;
  }
}

echo json_encode($tasks);
$conn->close();
?>
