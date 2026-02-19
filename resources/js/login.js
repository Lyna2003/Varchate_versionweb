document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Toggle mostrar contraseña
  // =========================
  document.querySelectorAll(".toggle-pass").forEach(icon => {
    icon.addEventListener("click", () => {
      const inputId = icon.getAttribute("data-target");
      const input = document.getElementById(inputId);
      if (!input) return;
      
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });

  // =========================
  // Login
  // =========================
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  // Limpiar errores al escribir
  loginForm.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      removeFieldError(input);
      removeFormError();
    });
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Limpiar errores anteriores
    clearAllErrors();
    
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();
    
    // =========================
    // Validaciones del lado del cliente
    // =========================
    let hasClientErrors = false;
    
    // Validar email
    if (!email) {
      showFieldError(loginForm.email, "El correo electrónico es obligatorio");
      hasClientErrors = true;
    } else if (!isValidEmail(email)) {
      showFieldError(loginForm.email, "Ingresa un correo electrónico válido");
      hasClientErrors = true;
    }
    
    // Validar password
    if (!password) {
      showFieldError(loginForm.password, "La contraseña es obligatoria");
      hasClientErrors = true;
    } else if (password.length < 8) {
      showFieldError(loginForm.password, "La contraseña debe tener al menos 8 caracteres");
      hasClientErrors = true;
    }
    
    if (hasClientErrors) return;
    
    // Mostrar estado de carga
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Iniciando sesión...";
    
    // =========================
    // Petición al servidor
    // =========================
    try {
      const apiBase = loginForm.dataset.apiUrl; 
      
      const response = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ 
          email, 
          password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Error 422 - Validación
        if (response.status === 422 && data.errors) {
          Object.keys(data.errors).forEach(field => {
            const input = loginForm.querySelector(`[name="${field}"]`);
            if (input) {
              showFieldError(input, data.errors[field][0]);
            }
          });
          showFormError("Por favor, corrige los errores en el formulario");
        }
        // Error 401 - Credenciales incorrectas
        else if (response.status === 401) {
          showFormError("Credenciales incorrectas. Verifica tu correo y contraseña");
        }
        // Error 403 - Usuario inactivo o no verificado
        else if (response.status === 403) {
          if (data.message && data.message.includes("verificar")) {
            showVerificationModal(data.message, email);
          } else {
            showFormError(data.message || "Acceso denegado");
          }
        }
        // Error 429 - Muchos intentos
        else if (response.status === 429) {
          showFormError("Demasiados intentos. Espera unos minutos e inténtalo de nuevo");
        }
        // Otros errores
        else {
          showFormError(data.message || "Error al iniciar sesión. Inténtalo de nuevo");
        }
        return;
      }

      // =========================
      // LOGIN EXITOSO - VERSIÓN CORREGIDA
      // =========================
      // Guardar token (verificar si viene como 'token' o 'access_token')
      const token = data.access_token || data.token;
      
      if (token) {
          // Guardar token en localStorage
          localStorage.setItem('auth_token', token);
          
          // Guardar datos del usuario
          if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
              
              // También guardar datos individuales para acceso rápido
              const nombreCompleto = data.user.nombre || data.user.name || '';
              const partes = nombreCompleto.split(' ');
              localStorage.setItem('user_nombre', partes[0] || 'Usuario');
              localStorage.setItem('user_apellido', partes.slice(1).join(' ') || '');
              localStorage.setItem('user_email', data.user.email || '');
              if (data.user.avatar) {
                  localStorage.setItem('user_avatar', data.user.avatar);
              }
          }
          
          // Mostrar mensaje de éxito
          showSuccessMessage("¡Inicio de sesión exitoso! Redirigiendo...");
          
          // Redirigir a la vista de módulo principal
          setTimeout(() => {
              window.location.href = "/modulo";
          }, 1500);
      } else {
          showFormError("Error: No se recibió el token de autenticación");
      }

    } catch (error) {
      // Error de red
      if (!navigator.onLine) {
        showFormError("No hay conexión a internet. Verifica tu red");
      } else {
        showFormError("Error de conexión con el servidor. Inténtalo más tarde");
      }
    } finally {
      // Restaurar botón
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

// =========================
// Utilidades de validación
// =========================
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// =========================
// Mostrar error en campo específico
// =========================
function showFieldError(input, message) {
  removeFieldError(input);
  input.classList.add('input-error');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.color = '#d93025';
  errorDiv.style.fontSize = '12px';
  errorDiv.style.marginTop = '4px';
  errorDiv.style.marginBottom = '4px';
  errorDiv.style.textAlign = 'left';
  
  if (input.parentElement.classList.contains('input-pass')) {
    input.parentElement.parentElement.insertBefore(errorDiv, input.parentElement.nextSibling);
  } else {
    input.parentElement.insertBefore(errorDiv, input.nextSibling);
  }
}

// =========================
// Remover error de campo
// =========================
function removeFieldError(input) {
  input.classList.remove('input-error');
  
  if (input.parentElement.classList.contains('input-pass')) {
    const nextElement = input.parentElement.parentElement.nextElementSibling;
    if (nextElement && nextElement.classList.contains('field-error')) {
      nextElement.remove();
    }
  } else {
    const nextElement = input.nextElementSibling;
    if (nextElement && nextElement.classList.contains('field-error')) {
      nextElement.remove();
    }
  }
}

// =========================
// Mostrar error general del formulario
// =========================
function showFormError(message) {
  removeFormError();
  
  const loginForm = document.getElementById("loginForm");
  const errorBox = document.createElement("div");
  errorBox.classList.add("login-error", "form-error");
  errorBox.textContent = message;
  
  loginForm.prepend(errorBox);
  
  setTimeout(() => {
    const error = document.querySelector('.form-error');
    if (error) error.remove();
  }, 3000);
}

// =========================
// Remover error general
// =========================
function removeFormError() {
  const errorBox = document.querySelector(".login-error.form-error");
  if (errorBox) errorBox.remove();
}

// =========================
// Mostrar mensaje de éxito
// =========================
function showSuccessMessage(message) {
  const loginForm = document.getElementById("loginForm");
  const successBox = document.createElement("div");
  successBox.classList.add("login-success");
  successBox.textContent = message;
  successBox.style.backgroundColor = '#e6f4ea';
  successBox.style.color = '#1e7e34';
  successBox.style.border = '1px solid #1e7e34';
  successBox.style.padding = '10px';
  successBox.style.marginBottom = '15px';
  successBox.style.borderRadius = '6px';
  successBox.style.fontSize = '0.9rem';
  
  loginForm.prepend(successBox);
}

// =========================
// Mostrar opción para reenviar email
// =========================
function showResendEmailOption(form, email) {
  const resendDiv = document.createElement('div');
  resendDiv.className = 'resend-email';
  resendDiv.style.marginTop = '10px';
  resendDiv.style.fontSize = '13px';
  resendDiv.innerHTML = `
    ¿No recibiste el correo? 
    <button type="button" id="resendEmailBtn" style="background: none; border: none; color: #276CDC; text-decoration: underline; cursor: pointer; padding: 0; font-size: 13px;">
      Reenviar correo
    </button>
  `;
  
  form.appendChild(resendDiv);
  
  document.getElementById('resendEmailBtn')?.addEventListener('click', async () => {
    try {
      const apiBase = form.dataset.apiUrl;
      const response = await fetch(`${apiBase}/email/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        showSuccessMessage('Correo reenviado. Revisa tu bandeja de entrada');
        resendDiv.remove();
      }
    } catch (error) {
      // Silencioso
    }
  });
}

// =========================
// Limpiar todos los errores
// =========================
function clearAllErrors() {
  document.querySelectorAll('.input-error').forEach(input => {
    input.classList.remove('input-error');
  });
  
  document.querySelectorAll('.field-error').forEach(error => {
    error.remove();
  });
  
  removeFormError();
  
  document.querySelectorAll('.login-success').forEach(success => {
    success.remove();
  });
}

// =========================
// MODAL PARA CORREO NO VERIFICADO
// =========================
function showVerificationModal(message, email) {
  // Crear modal si no existe
  let modal = document.getElementById('emailVerificationModal');
  
  if (!modal) {
    // Crear modal dinámicamente
    modal = document.createElement('div');
    modal.id = 'emailVerificationModal';
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Correo no verificado</h3>
          <span class="modal-close">&times;</span>
        </div>
        <div class="modal-body">
          <p id="modalMessage"></p>
          <p>¿No recibiste el correo?</p>
        </div>
        <div class="modal-footer">
          <button id="resendEmailBtn" class="btn-primary">Reenviar correo</button>
          <button id="closeModalBtn" class="btn-secondary">Cerrar</button>
        </div>
        <div id="resendStatus" style="margin-top: 10px; font-size: 13px;"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // Actualizar mensaje
  const modalMessage = document.getElementById('modalMessage');
  if (modalMessage) modalMessage.textContent = message;
  
  // Mostrar modal
  modal.style.display = 'flex';
  
  // Guardar email para reenvío
  modal.dataset.email = email;
  
  // Configurar botones
  const closeBtn = modal.querySelector('.modal-close');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const resendBtn = document.getElementById('resendEmailBtn');
  const statusDiv = document.getElementById('resendStatus');
  
  // Función para cerrar
  const closeModal = () => {
    modal.style.display = 'none';
    if (statusDiv) statusDiv.innerHTML = '';
  };
  
  // Event listeners
  closeBtn?.addEventListener('click', closeModal);
  closeModalBtn?.addEventListener('click', closeModal);
  
  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Reenviar email
  resendBtn?.addEventListener('click', async () => {
    const email = modal.dataset.email;
    const apiBase = document.getElementById('loginForm')?.dataset.apiUrl;
    
    if (!email || !apiBase) return;
    
    // Deshabilitar botón
    resendBtn.disabled = true;
    resendBtn.textContent = 'Enviando...';
    statusDiv.innerHTML = '';
    
    try {
      const response = await fetch(`${apiBase}/email/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        statusDiv.innerHTML = `<span class="status-success">✅ ${data.message || 'Correo reenviado'}</span>`;
      } else {
        statusDiv.innerHTML = `<span class="status-error">❌ ${data.message || 'Error al reenviar'}</span>`;
      }
    } catch (error) {
      statusDiv.innerHTML = `<span class="status-error">❌ Error de conexión</span>`;
    } finally {
      resendBtn.disabled = false;
      resendBtn.textContent = 'Reenviar correo';
    }
  });
}