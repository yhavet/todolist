<?php
include 'db_connect.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

$data = json_decode(file_get_contents("php://input"));
$email = $conn->real_escape_string($data->email);


$sql = "SELECT * FROM users WHERE email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows == 0) {

    echo json_encode(["message" => "Si este email existe, le enviaremos un enlace."]); 
    exit;
}

$token = bin2hex(random_bytes(50));
$expires = time() + 3600;

$sql = "INSERT INTO password_resets (email, token, expires) VALUES ('$email', '$token', $expires)";
if (!$conn->query($sql)) {
    echo json_encode(["error" => "Error al generar el token."]);
    exit;
}

$reset_link = "http://localhost/lista/reset-password.html?token=" . $token;

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp-relay.brevo.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = '9aff0a001@smtp-brevo.com';  
    $mail->Password   = 'KzJVdPYbnQNB2wHg';         
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;                   
    $mail->setFrom('9aff0a001@smtp-brevo.com', 'TaskMaster');
    $mail->addAddress($email); 

    $mail->isHTML(true);
    $mail->Subject = 'Restablece tu contraseña de TaskMaster';
    $mail->Body    = "Hola,<br><br>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:<br><br>
                      <a href='$reset_link'>$reset_link</a><br><br>
                      Si no solicitaste esto, puedes ignorar este correo.";
    $mail->AltBody = "Copia y pega este enlace en tu navegador: $reset_link";

    $mail->send();
    echo json_encode(["message" => "¡Correo enviado! Revisa tu bandeja de entrada."]);

} catch (Exception $e) {
    echo json_encode(["error" => "No se pudo enviar el correo. Error: {$mail->ErrorInfo}"]);
}

$conn->close();
?>