const API_BASE_URL = 'http://127.0.0.1:8001';

// Función para obtener parámetros de la URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        token: params.get('token'),
        email: params.get('email')
    };
}

// Función para mostrar modal (REUTILIZABLE)
function showModal(message, type = 'info', redirectUrl = null) {
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = `custom-modal modal-${type}`;

    let icon = '';
    if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '❌';
    else if (type === 'warning') icon = '⚠️';
    else icon = 'ℹ️';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">${icon}</div>
            <div class="modal-message">${message}</div>
            <button class="modal-button">Aceptar</button>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    const closeButton = modal.querySelector('.modal-button');
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        }, 300);
    });
}

// Función para validar la contraseña
function validatePassword(password) {
    if (password.length < 10) {
        return 'La contraseña debe tener al menos 10 caracteres';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);

    if (!hasUpperCase) {
        return 'La contraseña debe contener al menos una letra MAYÚSCULA';
    }

    if (!hasNumber) {
        return 'La contraseña debe contener al menos un número';
    }

    if (!hasLowerCase) {
        return 'La contraseña debe contener al menos una letra minúscula';
    }

    return null;
}

// Obtener parámetros de la URL
const { token, email } = getUrlParams();
console.log('Token:', token);
console.log('Email:', email);

// Validar token y email
document.addEventListener('DOMContentLoaded', () => {
    const emailDisplay = document.getElementById('emailDisplay');
    if (emailDisplay && email) {
        emailDisplay.textContent = `Restableciendo contraseña para: ${email}`;
        emailDisplay.style.display = 'block';
    }

    if (!token || !email) {
        showModal('🔗 Enlace inválido o expirado. Serás redirigido.', 'error', '/recuperar');
    }
});

// Manejar el envío del formulario
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password_confirmation').value;

    if (!password || !confirmPassword) {
        showModal('Por favor, completa todos los campos', 'warning');
        return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        showModal(passwordError, 'warning');
        return;
    }

    if (password !== confirmPassword) {
        showModal('Las contraseñas no coinciden', 'warning');
        return;
    }

    const submitButton = document.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Guardando...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/password/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                token: token,
                password: password,
                password_confirmation: confirmPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.removeItem('recoveryEmail');
            sessionStorage.removeItem('lastResendTime');
            showModal('✅ ¡Contraseña actualizada con éxito!', 'success', '/login');
        } else {
            const errorMessage = data.message || data.error || 'Error al restablecer la contraseña';
            showModal('❌ ' + errorMessage, 'error');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    } catch (error) {
        console.error('Error:', error);
        showModal('❌ Error de conexión. Verifica que el backend esté en http://127.0.0.1:8001', 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Estilos del modal (los mismos que en recuperar.js)
const style = document.createElement('style');
style.textContent = `
    .custom-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .custom-modal.show {
        opacity: 1;
    }
    
    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
        transform: scale(0.7);
        transition: transform 0.3s ease;
    }
    
    .custom-modal.show .modal-content {
        transform: scale(1);
    }
    
    .modal-icon {
        font-size: 48px;
        margin-bottom: 20px;
    }
    
    .modal-message {
        font-size: 18px;
        margin-bottom: 25px;
        color: #333;
        line-height: 1.5;
    }
    
    .modal-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s;
    }
    
    .modal-button:hover {
        background: #0056b3;
    }
    
    .modal-success .modal-button {
        background: #28a745;
    }
    
    .modal-success .modal-button:hover {
        background: #218838;
    }
    
    .modal-error .modal-button {
        background: #dc3545;
    }
    
    .modal-error .modal-button:hover {
        background: #c82333;
    }
    
    .modal-warning .modal-button {
        background: #ffc107;
        color: #333;
    }
    
    .modal-warning .modal-button:hover {
        background: #e0a800;
    }
`;

document.head.appendChild(style);