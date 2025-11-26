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
 
  $sql = "UPDATE tasks SET completed = true WHERE id = $id AND user_id = $user_id";
  
  if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Tarea completada"]);
  } else {
    echo json_encode(["error" => "Error al actualizar la tarea: " . $conn->error]);
  }
}

$conn->close();
?>