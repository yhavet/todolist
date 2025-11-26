<?php

include 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

$token = $conn->real_escape_string($data->token);
$new_password = $conn->real_escape_string($data->password);

if (empty($token) || empty($new_password)) {
    echo json_encode(["error" => "Datos incompletos."]);
    exit;
}

$current_time = time();
$sql = "SELECT * FROM password_resets WHERE token = '$token' AND expires > $current_time";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    echo json_encode(["error" => "El enlace es inválido o ha expirado."]);
    exit;
}


$row = $result->fetch_assoc();
$email = $row['email'];

$new_password_hash = password_hash($new_password, PASSWORD_BCRYPT);


$sql_update = "UPDATE users SET password_hash = '$new_password_hash' WHERE email = '$email'";
if ($conn->query($sql_update) === TRUE) {
    
    $conn->query("DELETE FROM password_resets WHERE email = '$email'");
    
    echo json_encode(["message" => "¡Contraseña actualizada con éxito!"]);
} else {
    echo json_encode(["error" => "Error al actualizar la contraseña."]);
}

$conn->close();
?>