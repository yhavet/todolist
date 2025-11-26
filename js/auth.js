// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    
    // Asegúrate de que la URL apunte a tu carpeta 'lista'
    const API_URL = 'http://localhost/lista/api/';

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-form'); // Nuevo
    const resetForm = document.getElementById('reset-form');   // Nuevo

    // --- Lógica de Registro ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch(API_URL + 'register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const result = await response.json();

            if (result.message) {
                alert(result.message);
                window.location.href = 'index.html'; 
            } else {
                alert('Error: ' + result.error);
            }
        });
    }

    // --- Lógica de Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch(API_URL + 'login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (result.message) {
                localStorage.setItem('taskMasterUser', result.username);
                window.location.href = 'app.html';
            } else {
                alert('Error: ' + result.error);
            }
        });
    }

    // --- (NUEVO) Lógica de "Olvidé Contraseña" ---
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const messageArea = document.getElementById('message-area');
            
            const response = await fetch(API_URL + 'request_reset.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const result = await response.json();

            if (result.message) {
                messageArea.textContent = result.message;
                messageArea.className = 'message-area success';
            } else {
                messageArea.textContent = 'Error: ' + result.error;
                messageArea.className = 'message-area error';
            }
        });
    }

    // --- (NUEVO) Lógica de "Restablecer Contraseña" ---
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const password_confirm = document.getElementById('password_confirm').value;
            const messageArea = document.getElementById('message-area');

            // Obtener el token de la URL (ej: reset-password.html?token=...)
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (password !== password_confirm) {
                messageArea.textContent = 'Las contraseñas no coinciden.';
                messageArea.className = 'message-area error';
                return;
            }
            if (!token) {
                messageArea.textContent = 'Token inválido o faltante.';
                messageArea.className = 'message-area error';
                return;
            }

            const response = await fetch(API_URL + 'perform_reset.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            
            const result = await response.json();

            if (result.message) {
                messageArea.textContent = result.message + ' Serás redirigido en 3 segundos.';
                messageArea.className = 'message-area success';
                setTimeout(() => { window.location.href = 'index.html'; }, 3000);
            } else {
                messageArea.textContent = 'Error: ' + result.error;
                messageArea.className = 'message-area error';
            }
        });
    }
});