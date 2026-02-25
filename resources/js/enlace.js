const API_URL = 'http://127.0.0.1:8001/api';

// Función para mostrar modal
function showModal(message, type = 'info', redirectUrl = null) {
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) existingModal.remove();

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

// ✅ Función para reenviar el enlace (AHORA SE LLAMA "handleResend")
async function handleResend() {
    const email = sessionStorage.getItem('recoveryEmail');

    if (!email) {
        showModal('No hay información de recuperación. Serás redirigido.', 'warning', '/recuperar');
        return;
    }

    const resendLinkElement = document.getElementById('resend-link');
    const originalText = resendLinkElement.textContent;
    resendLinkElement.style.pointerEvents = 'none';
    resendLinkElement.textContent = 'Enviando...';
    resendLinkElement.style.opacity = '0.7';

    try {
        const response = await fetch(`${API_URL}/password/forgot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (response.ok) {
            showModal('✅ ¡Enlace reenviado con éxito! Revisa tu correo.', 'success');

            // Bloquear el enlace por 60 segundos
            let secondsLeft = 60;
            resendLinkElement.textContent = `Reenviar enlace (${secondsLeft}s)`;

            const interval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    resendLinkElement.textContent = `Reenviar enlace (${secondsLeft}s)`;
                } else {
                    clearInterval(interval);
                    resendLinkElement.style.pointerEvents = 'auto';
                    resendLinkElement.textContent = 'Reenviar enlace';
                    resendLinkElement.style.opacity = '1';
                }
            }, 1000);
        } else {
            showModal('❌ ' + (data.message || 'Error al reenviar'), 'error');
            resendLinkElement.style.pointerEvents = 'auto';
            resendLinkElement.textContent = originalText;
            resendLinkElement.style.opacity = '1';
        }
    } catch (error) {
        console.error('Error:', error);
        showModal('❌ Error de conexión', 'error');
        resendLinkElement.style.pointerEvents = 'auto';
        resendLinkElement.textContent = originalText;
        resendLinkElement.style.opacity = '1';
    }
}

// Inicializar eventos
document.addEventListener('DOMContentLoaded', () => {
    const email = sessionStorage.getItem('recoveryEmail');

    if (!email) {
        showModal('No hay sesión de recuperación activa. Serás redirigido.', 'warning', '/recuperar');
        return;
    }

    const resendLinkElement = document.getElementById('resend-link');
    if (resendLinkElement) {
        resendLinkElement.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que el enlace navegue
            handleResend(); // ✅ AHORA LLAMA A LA FUNCIÓN CON OTRO NOMBRE
        });
    }
});

// Estilos del modal
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