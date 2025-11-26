<?php
// Cabeceras CORS para permitir peticiones desde el frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Manejar peticiones preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '/api/db_connect.php';

$data = json_decode(file_get_contents("php://input"));

$username = $conn->real_escape_string($data->username);
$email = $conn->real_escape_string($data->email);
$password = $conn->real_escape_string($data->password);
$password_hash = password_hash($password, PASSWORD_BCRYPT);

$check = $conn->query("SELECT * FROM users WHERE email='$email' OR username='$username'");
if ($check->num_rows > 0) {
    echo json_encode(["error" => "El email o nombre de usuario ya existe."]);
    exit;
}

// Insertar nuevo usuario
$sql = "INSERT INTO users (username, email, password_hash) VALUES ('$username', '$email', '$password_hash')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Registro exitoso."]);
} else {
    echo json_encode(["error" => "Error en el registro: " . $conn->error]);
}

$conn->close();
?>