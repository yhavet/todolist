<?php

include 'db_connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"));

$title = $conn->real_escape_string($data->title);
$notes = $conn->real_escape_string($data->notes);
$date = $conn->real_escape_string($data->date);

$duration = !empty($data->duration) ? (int)$data->duration : "NULL";

$sql = "INSERT INTO meetings (user_id, title, notes, meeting_date, duration_minutes)
        VALUES ($user_id, '$title', '$notes', '$date', $duration)";

if ($conn->query($sql) === TRUE) {
  $last_id = $conn->insert_id;
  $result = $conn->query("SELECT * FROM meetings WHERE id = $last_id");
  echo json_encode($result->fetch_assoc());
} else {
  echo json_encode(["error" => "Error al crear la reunión: " . $conn->error]);
}

$conn->close();
?>