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
$description = $conn->real_escape_string($data->description);
$category = $conn->real_escape_string($data->category);
$date = $conn->real_escape_string($data->date);

$startTime = !empty($data->startTime) ? "'".$conn->real_escape_string($data->startTime)."'" : "NULL";
$endTime = !empty($data->endTime) ? "'".$conn->real_escape_string($data->endTime)."'" : "NULL";


$sql = "INSERT INTO tasks (title, description, category, due_date, start_time, end_time, user_id)
        VALUES ('$title', '$description', '$category', '$date', $startTime, $endTime, $user_id)";

if ($conn->query($sql) === TRUE) {
  $last_id = $conn->insert_id;
  $result = $conn->query("SELECT * FROM tasks WHERE id = $last_id");
  echo json_encode($result->fetch_assoc());
} else {
  echo json_encode(["error" => "Error al crear la tarea: " . $conn->error]);
}

$conn->close();
?>