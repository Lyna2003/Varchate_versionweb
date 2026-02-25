// Configuración
const API_URL = 'http://127.0.0.1:8001/api';

// Función para crear y mostrar un modal
function showModal(message, type = 'info', redirectUrl = null) {
    // Eliminar modal existente si hay
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Crear el modal
    const modal = document.createElement('div');
    modal.className = `custom-modal modal-${type}`;

    // Icono según el tipo
    let icon = '';
    if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '❌';
    else if (type === 'warning') icon = '⚠️';
    else icon = 'ℹ️';

    // Contenido del modal
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon">${icon}</div>
            <div class="modal-message">${message}</div>
            <button class="modal-button">Aceptar</button>
        </div>
    `;

    // Agregar al body
    document.body.appendChild(modal);

    // Mostrar con animación
    setTimeout(() => modal.classList.add('show'), 10);

    // Cerrar al hacer clic en el botón
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

    // Auto-cerrar después de 3 segundos solo para éxito
    if (type === 'success' && !redirectUrl) {
        setTimeout(() => {
            if (modal.parentNode) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        }, 3000);
    }
}

document.getElementById('recoveryForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();

    if (!email) {
        showModal('Por favor, ingresa tu correo electrónico', 'warning');
        return;
    }

    const submitButton = document.querySelector('.button');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

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
        console.log('Respuesta:', data);

        if (response.ok) {
            sessionStorage.setItem('recoveryEmail', email);
            showModal('✅ ¡Correo enviado con éxito! Revisa tu bandeja de entrada.', 'success', '/enlace');
        } else {
            showModal('❌ Error: ' + (data.message || 'No se pudo enviar el correo'), 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showModal('❌ Error de conexión. Verifica que el backend esté corriendo en http://127.0.0.1:8001', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
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
        border: none;
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