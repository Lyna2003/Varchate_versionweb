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
  // Registro
  // =========================
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  // Limpiar errores al escribir
  registerForm.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      removeFieldError(input);
      removeFormError();
    });
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Limpiar errores anteriores
    clearAllErrors();
    
    // Obtener valores
    const nombre = registerForm.nombre.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value.trim();
    const passwordConfirmation = registerForm.password_confirmation.value.trim();
    const termsAccepted = registerForm.terms_accepted.checked;
    
    // =========================
    // Validaciones del lado del cliente
    // =========================
    let hasClientErrors = false;
    
    // Validar nombre
    if (!nombre) {
      showFieldError(registerForm.nombre, "El nombre es obligatorio");
      hasClientErrors = true;
    } else if (nombre.length < 3) {
      showFieldError(registerForm.nombre, "El nombre debe tener al menos 3 caracteres");
      hasClientErrors = true;
    }else if (/[0-9]/.test(nombre)) {  
      showFieldError(registerForm.nombre, "El nombre no puede contener números");
      hasClientErrors = true;
    }
    
    // Validar email
    if (!email) {
      showFieldError(registerForm.email, "El correo electrónico es obligatorio");
      hasClientErrors = true;
    } else if (!isValidEmail(email)) {
      showFieldError(registerForm.email, "Ingresa un correo electrónico válido");
      hasClientErrors = true;
    }
    
    // Validar password
    if (!password) {
      showFieldError(registerForm.password, "La contraseña es obligatoria");
      hasClientErrors = true;
    } else if (password.length < 8) {
      showFieldError(registerForm.password, "La contraseña debe tener al menos 8 caracteres");
      hasClientErrors = true;
    } else if (!/[A-Z]/.test(password)) {
      showFieldError(registerForm.password, "La contraseña debe tener al menos una mayúscula");
      hasClientErrors = true;
    } else if (!/[a-z]/.test(password)) {
      showFieldError(registerForm.password, "La contraseña debe tener al menos una minúscula");
      hasClientErrors = true;
    } else if (!/[0-9]/.test(password)) {
      showFieldError(registerForm.password, "La contraseña debe tener al menos un número");
      hasClientErrors = true;
    }
    
    // Validar confirmación de contraseña
    if (password !== passwordConfirmation) {
      showFieldError(registerForm.password_confirmation, "Las contraseñas no coinciden");
      hasClientErrors = true;
    }
    
    // Validar términos
    if (!termsAccepted) {
      showFieldError(registerForm.terms_accepted, "Debes aceptar los términos y condiciones");
      hasClientErrors = true;
    }
    
    if (hasClientErrors) return;
    
    // Mostrar estado de carga
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando...";
    
    // =========================
    // Petición al servidor
    // =========================
    try {
      const apiBase = registerForm.dataset.apiUrl; 
      
      const response = await fetch(`${apiBase}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ 
          nombre,  
          email, 
          password,
          password_confirmation: passwordConfirmation,
          terms_accepted: termsAccepted
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          Object.keys(data.errors).forEach(field => {
            const input = registerForm.querySelector(`[name="${field}"]`);
            if (input) {
              showFieldError(input, data.errors[field][0]);
            }
          });
          showFormError("Por favor, corrige los errores en el formulario");
        } else if (response.status === 429) {
          showFormError("Demasiados intentos. Espera unos minutos e inténtalo de nuevo");
        } else {
          showFormError(data.message || "Error al registrarse. Inténtalo de nuevo");
        }
        return;
      }

      // Registro exitoso
     
      let segundos = 8;
      const mensajeOriginal = "¡Registro exitoso! Revisa tu correo para verificar tu cuenta antes de iniciar sesión. ";

      showSuccessMessage(`${mensajeOriginal} Redirigiendo en ${segundos} segundos...`);

      const intervalo = setInterval(() => {
        segundos--;
        if (segundos > 0) {
          // Actualizar el mensaje
          const successBox = document.querySelector('.register-success');
          if (successBox) {
            successBox.textContent = `${mensajeOriginal} Redirigiendo en ${segundos} segundos...`;
          }
        } else {
          clearInterval(intervalo);
          window.location.href = "/login";
        }
      }, 1000);

    } catch (error) {
      if (!navigator.onLine) {
        showFormError("No hay conexión a internet. Verifica tu red");
      } else {
        showFormError("Error de conexión con el servidor. Inténtalo más tarde");
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // =========================
  // VALIDACIÓN EN TIEMPO REAL PARA TOOLTIP
  // =========================
  const passwordInput = document.getElementById('regPass1');
  const reqLength = document.querySelector('.req-length');
  const reqUppercase = document.querySelector('.req-uppercase');
  const reqLowercase = document.querySelector('.req-lowercase');
  const reqNumber = document.querySelector('.req-number');

  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      const value = this.value;
      
      // Validar longitud
      if (value.length >= 8) {
        reqLength?.classList.add('valid');
      } else {
        reqLength?.classList.remove('valid');
      }
      
      // Validar mayúscula
      if (/[A-Z]/.test(value)) {
        reqUppercase?.classList.add('valid');
      } else {
        reqUppercase?.classList.remove('valid');
      }
      
      // Validar minúscula
      if (/[a-z]/.test(value)) {
        reqLowercase?.classList.add('valid');
      } else {
        reqLowercase?.classList.remove('valid');
      }
      
      // Validar número
      if (/[0-9]/.test(value)) {
        reqNumber?.classList.add('valid');
      } else {
        reqNumber?.classList.remove('valid');
      }
    });
  }
});

// =========================
// Utilidades (sin cambios)
// =========================
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showFieldError(input, message) {
  if (!input) return;
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
  
  if (input.type === 'checkbox') {
    input.closest('.terms')?.appendChild(errorDiv);
  } else if (input.parentElement?.classList.contains('input-pass')) {
    input.parentElement.parentElement?.insertBefore(errorDiv, input.parentElement.nextSibling);
  } else {
    input.parentElement?.insertBefore(errorDiv, input.nextSibling);
  }
}

function removeFieldError(input) {
  if (!input) return;
  input.classList.remove('input-error');
  
  if (input.type === 'checkbox') {
    const errorDiv = input.closest('.terms')?.querySelector('.field-error');
    if (errorDiv) errorDiv.remove();
  } else if (input.parentElement?.classList.contains('input-pass')) {
    const nextElement = input.parentElement.parentElement?.nextElementSibling;
    if (nextElement?.classList.contains('field-error')) {
      nextElement.remove();
    }
  } else {
    const nextElement = input.nextElementSibling;
    if (nextElement?.classList.contains('field-error')) {
      nextElement.remove();
    }
  }
}

function showFormError(message) {
  removeFormError();
  const registerForm = document.getElementById("registerForm");
  const errorBox = document.createElement("div");
  errorBox.classList.add("register-error", "form-error");
  errorBox.textContent = message;
  registerForm.prepend(errorBox);
  
  setTimeout(() => {
    const error = document.querySelector('.form-error');
    if (error) error.remove();
  }, 5000);
}

function removeFormError() {
  const errorBox = document.querySelector(".register-error.form-error");
  if (errorBox) errorBox.remove();
}

function showSuccessMessage(message) {
  const registerForm = document.getElementById("registerForm");
  const successBox = document.createElement("div");
  successBox.classList.add("register-success");
  successBox.textContent = message;
  registerForm.prepend(successBox);
}

function clearAllErrors() {
  document.querySelectorAll('.input-error').forEach(input => {
    input.classList.remove('input-error');
  });
  document.querySelectorAll('.field-error').forEach(error => {
    error.remove();
  });
  removeFormError();
  document.querySelectorAll('.register-success').forEach(success => {
    success.remove();
  });
}