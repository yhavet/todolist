<?php
include 'db_connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// CORRECCIÓN: Quitamos el filtro de fecha para traer TODO el historial ordenado
$sql = "SELECT * FROM meetings 
        WHERE user_id = $user_id 
        ORDER BY meeting_date ASC, id ASC";

$result = $conn->query($sql);
$meetings = array();

if ($result->num_rows > 0) {
  while($row = $result->fetch_assoc()) {
    $meetings[] = $row;
  }
}

echo json_encode($meetings);
$conn->close();
?>