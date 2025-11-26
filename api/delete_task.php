<?php

include 'db_connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$id = $conn->real_escape_string($_GET['id']);

if (!empty($id)) {
  
 
  $sql = "UPDATE tasks 
          SET is_archived = true 
          WHERE id = $id AND user_id = $user_id";

  if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Tarea archivada"]);
  } else {
    echo json_encode(["error" => "Error al archivar la tarea: " . $conn->error]);
  }
}

$conn->close();
?>