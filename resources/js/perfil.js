
const modal = document.getElementById("modalAvatar");
const abrirModalBtn = document.querySelector(".editar-foto");
const cancelarBtn = modal.querySelector(".btn-cancel");
const guardarBtn = modal.querySelector(".btn-save");

abrirModalBtn.addEventListener("click", () => {
  modal.classList.add("show");
  modal.classList.remove("hide");
  const modalBox = modal.querySelector(".modal-box");
  modalBox.focus();
  trapFocus(modalBox);
});

function cerrarModal() {
  modal.classList.add("hide");
  setTimeout(() => modal.classList.remove("show", "hide"), 400);
}

cancelarBtn.addEventListener("click", cerrarModal);
guardarBtn.addEventListener("click", () => {
  const seleccionado = modal.querySelector(".avatar-option.selected img");
  if (seleccionado) document.querySelector(".perfil-imagen img").src = seleccionado.src;
  cerrarModal();
});


const opciones = modal.querySelectorAll(".avatar-option");
opciones.forEach(op => {
  op.addEventListener("click", () => {
    opciones.forEach(o => o.classList.remove("selected"));
    op.classList.add("selected");
  });
  op.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); op.click(); }
  });
});


const eliminarBtn = document.querySelector(".eliminar-foto");
const modalEliminar = document.getElementById("modalEliminar");
const confirmarEliminarBtn = document.getElementById("confirmarEliminar");
const cancelarEliminarBtn = document.getElementById("cancelarEliminar");
const perfilImg = document.querySelector(".perfil-imagen img");

eliminarBtn.addEventListener("click", () => {
  modalEliminar.classList.add("show");
  modalEliminar.classList.remove("hide");
  modalEliminar.style.display = "flex";
  const focusables = modalEliminar.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (focusables.length) focusables[0].focus();
  trapFocus(modalEliminar);
});

function cerrarModalEliminar() {
  modalEliminar.classList.add("hide");
  setTimeout(() => { modalEliminar.classList.remove("show", "hide"); modalEliminar.style.display = "none"; }, 400);
}
cancelarEliminarBtn.addEventListener("click", cerrarModalEliminar);
confirmarEliminarBtn.addEventListener("click", () => {
  // Obtener el valor por defecto desde el atributo data-default si existe
  const perfilImgEl = document.getElementById('perfil-imagen');
  const defaultSrc = (perfilImgEl && perfilImgEl.dataset && perfilImgEl.dataset.default) ? perfilImgEl.dataset.default : '/avatars/default.png';
  perfilImg.src = defaultSrc;
  // Actualizar localStorage para que otras vistas usen el avatar por defecto
  try { localStorage.setItem('user_avatar', defaultSrc); } catch (e) { /* noop */ }
  // Limpiar selección en el modal de avatares si está abierto
  opciones.forEach(o => o.classList.remove('selected'));
  cerrarModalEliminar();
});
window.addEventListener("click", (e) => { if (e.target === modalEliminar) cerrarModalEliminar(); });

function trapFocus(element) {
  const focusableEls = element.querySelectorAll(`
    a[href], area[href], input:not([disabled]),
    select:not([disabled]), textarea:not([disabled]),
    button:not([disabled]), [tabindex]:not([tabindex="-1"])
  `);
  const firstFocusable = focusableEls[0];
  const lastFocusable = focusableEls[focusableEls.length - 1];

  element.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) { e.preventDefault(); lastFocusable.focus(); }
      } else {
        if (document.activeElement === lastFocusable) { e.preventDefault(); firstFocusable.focus(); }
      }
    }
  });
}


const modulos = [
  { nombre: "INTRODUCCIÓN A LA PROGRAMACIÓN", progreso: 50 },
  { nombre: "HTML", progreso: 30 },
  { nombre: "CSS", progreso: 20 },
  { nombre: "JS", progreso: 10 }
];

window.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, index) => {
    const barra = card.querySelector(".barra div");
    const span = card.querySelector("span");
    if (modulos[index]) {
      span.textContent = modulos[index].progreso + "%";
      setTimeout(() => { barra.style.width = modulos[index].progreso + "%"; }, 300);
    }
  });


  cargarDatosUsuario();
  initPasswordToggles();
  initDarkMode();
});

// Dark mode: toggle class on <html> and persist preference
function initDarkMode() {
  const btn = document.getElementById('btn-darkmode');
  if (!btn) return;
  const img = btn.querySelector('img');

  const apply = (enabled) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark-mode');
      if (img) img.classList.add('dark-icon');
    } else {
      root.classList.remove('dark-mode');
      if (img) img.classList.remove('dark-icon');
    }
  };

  // Initialize from localStorage or system preference
  let stored = null;
  try { stored = localStorage.getItem('dark_mode'); } catch (e) { stored = null; }
  if (stored === null) {
    const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(prefers);
  } else {
    apply(stored === '1');
  }

  btn.addEventListener('click', () => {
    const enabled = document.documentElement.classList.toggle('dark-mode');
    if (img) img.classList.toggle('dark-icon');
    try { localStorage.setItem('dark_mode', enabled ? '1' : '0'); } catch (e) { }
  });
}


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
let _perfilGuardado = false;

function showSuccessToast(message = 'Perfil actualizado correctamente', timeout = 1200) {
  // Evitar crear múltiples
  if (document.getElementById('vc-success-toast')) return;
  const toast = document.createElement('div');
  toast.id = 'vc-success-toast';
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.left = '50%';
  toast.style.top = '20px';
  toast.style.transform = 'translateX(-50%) translateY(-10px)';
  toast.style.background = 'linear-gradient(90deg,#198754,#2ecc71)';
  toast.style.color = 'white';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '10px';
  toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)';
  toast.style.fontWeight = '600';
  toast.style.zIndex = 99999;
  toast.style.opacity = '0';
  toast.style.transition = 'transform .28s ease, opacity .28s ease';
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, timeout);
}

function showErrorToast(message = 'Ocurrió un error', timeout = 2200) {
  // Evitar crear múltiples
  if (document.getElementById('vc-error-toast')) return;
  const toast = document.createElement('div');
  toast.id = 'vc-error-toast';
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.left = '50%';
  toast.style.top = '20px';
  toast.style.transform = 'translateX(-50%) translateY(-10px)';
  toast.style.background = 'linear-gradient(90deg,#f43f5e,#ef4444)';
  toast.style.color = '#fff';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '10px';
  toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)';
  toast.style.fontWeight = '600';
  toast.style.zIndex = 99999;
  toast.style.opacity = '0';
  toast.style.transition = 'transform .28s ease, opacity .28s ease';
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, timeout);
}

/**
 * Devuelve el token de autenticación (compatibilidad con claves antiguas)
 */
function getAuthToken() {
  return localStorage.getItem("auth_token") || localStorage.getItem("token");
}

/**
 * Intenta parsear JSON sólo si el Content-Type lo indica.
 * Devuelve null si la respuesta no es JSON o el parse falla.
 */
async function parseJsonSafe(response) {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (err) {
    console.warn('parseJsonSafe: fallo al parsear JSON', err);
    return null;
  }
}

async function cargarDatosUsuario() {
  // Obtener token usando helper (soporta claves antiguas)
  const token = getAuthToken();
  if (!token) return;

  const url = `${API_BASE}/me`;
  try {
    const res = await fetch(url, {
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      }
    });

    if (res.ok) {
      const user = await parseJsonSafe(res) || {};
      // Recuperar datos guardados en localStorage como fallback (login guarda 'user')
      let storedUser = null;
      try { storedUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { storedUser = null; }

      // Preferir campos explícitos de 'username' o 'usuario', si existen; si no, usar 'name'
      const usuarioEl = document.getElementById('usuario');
      if (usuarioEl) {
        usuarioEl.value = (
          user.username || user.usuario || user.user_name || user.name ||
          (storedUser && (storedUser.username || storedUser.usuario || storedUser.name)) ||
          usuarioEl.value || ''
        );
      }

      if (user.avatar_id) {
        const avatarOption = modal.querySelector(`.avatar-option[data-id="${user.avatar_id}"]`);
        if (avatarOption) {
          avatarOption.classList.add("selected");
          perfilImg.src = avatarOption.querySelector("img").src;
        }
      }
      // Asegurar que el nombre completo y el correo se muestren con los datos de registro
      const nombreEl = document.getElementById('nombre');
      const correoEl = document.getElementById('correo');
      if (nombreEl) {
        // Mostrar nombre registrado si existe (campo 'nombre' o 'name'); si no, usar lo renderizado por Blade
        nombreEl.value = (
          user.nombre || user.full_name || user.name ||
          (storedUser && (storedUser.nombre || storedUser.name || storedUser.full_name)) ||
          nombreEl.value || ''
        );
      }
      if (correoEl) {
        correoEl.value = user.email || (storedUser && storedUser.email) || correoEl.value || '';
      }
    } else {
      // Intentar parsear JSON de error, si no, leer texto
      const errObj = await parseJsonSafe(res);
      const text = errObj && errObj.message ? errObj.message : (await res.text().catch(() => null));
      console.warn(`Respuesta no OK al cargar usuario (${res.status})`, text || errObj);
      if (res.status === 401) {
        // Token inválido: limpiar y notificar
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        // Limpiar datos de usuario (no eliminar user_avatar to persist avatar across sessions)
        localStorage.removeItem('user');
        showErrorToast('Sesión inválida o expirada. Por favor, inicia sesión de nuevo.');
        // Opcional: redirigir a login
        // window.location.href = '/login';
      }
    }
  } catch (error) {
    console.error("Error cargando datos del usuario:", error);
    // Proveer mensaje específico cuando es un error de red
    const msg = `No se pudo conectar al servidor de API en ${url}. Verifica que el backend esté ejecutándose y que la URL sea correcta.`;
    showErrorToast(msg);
  }
}

// Inicializa los botones que muestran/ocultan contraseñas
function initPasswordToggles() {
  // SVGs para los estados (open = visible, closed = hidden/slash)
  const eyeOpen = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#374151" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="#374151" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const eyeSlash = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.16 20.16 0 0 1 5.06-6.06" stroke="#374151" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1 1l22 22" stroke="#374151" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" stroke="#374151" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  document.querySelectorAll('.toggle-pass').forEach(btn => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;

    // Inicializar icono según tipo actual
    const setIcon = () => {
      if (input.type === 'password') btn.innerHTML = eyeSlash; else btn.innerHTML = eyeOpen;
    };
    setIcon();

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      setIcon();
      // accesibilidad
      btn.setAttribute('aria-pressed', String(isPassword));
    });
  });
}



const perfilForm = document.getElementById("perfilForm");
const API_UPDATE_PROFILE = `${API_BASE}/me`;
const API_UPDATE_PASSWORD = `${API_BASE}/me/password`;

perfilForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener token usando helper (soporta claves antiguas)
  const token = getAuthToken();
  if (!token) {
    showErrorToast("No hay sesión activa. Por favor inicia sesión.");
    // Redirigir al login puede ser útil
    // window.location.href = '/login';
    return;
  }


  const guardarBtn = document.querySelector(".guardar");
  const originalText = guardarBtn.textContent;
  guardarBtn.textContent = "Guardando...";
  guardarBtn.disabled = true;

  try {

    const usuario = document.getElementById("usuario").value;
    const avatarSeleccionado = modal.querySelector(".avatar-option.selected");
    const avatar_id = avatarSeleccionado ? avatarSeleccionado.dataset.id : null;


    if (usuario || avatar_id) {
      const profileData = {};
      if (usuario) {
        // Enviar ambos por compatibilidad: 'nombre' (esperado por validación) y 'name'
        profileData.nombre = usuario;
        profileData.name = usuario;
      }
      if (avatar_id) profileData.avatar_id = parseInt(avatar_id);

      const res = await fetch(API_UPDATE_PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "Accept": "application/json"
        },
        body: JSON.stringify(profileData)
      });

      if (!res.ok) {
        const errObj = await parseJsonSafe(res);
        let serverError = errObj && errObj.message ? errObj.message : (await res.text().catch(() => null)) || `HTTP ${res.status}`;
        // Si Laravel devuelve errores de validación, convertirlos a texto legible
        if (errObj && errObj.errors) {
          const messages = [];
          Object.values(errObj.errors).forEach(arr => { if (Array.isArray(arr)) messages.push(...arr); });
          if (messages.length) serverError = messages.join('\n');
        }
        if (res.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          // El mensaje se mostrará en el catch global para evitar duplicados
          // window.location.href = '/login';
        }
        throw new Error(serverError || `Error al actualizar perfil (status ${res.status})`);
      }

      if (avatarSeleccionado) {
        const selectedSrc = avatarSeleccionado.querySelector("img").src;
        perfilImg.src = selectedSrc;
        // Guardar en localStorage para que modulo.js lo muestre de inmediato
        try {
          localStorage.setItem('user_avatar', selectedSrc);
          // También actualizar la clave por-usuario que modulo.js prioriza
          const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
          const uid = storedUser && (storedUser.id || storedUser.user_id);
          if (uid) localStorage.setItem(`user_avatar_for_${uid}`, selectedSrc);
        } catch (e) { /* noop */ }
      }
      // Intentar parsear respuesta con usuario actualizado y guardar datos en localStorage
      const updatedUser = await parseJsonSafe(res);
      try {
        if (updatedUser && typeof updatedUser === 'object') {
          // Guardar el objeto de usuario actualizado
          localStorage.setItem('user', JSON.stringify(updatedUser));

          // Guardar nombre(s) para mostrar en el módulo
          const nombreCompleto = updatedUser.nombre || updatedUser.name || '';
          const partes = nombreCompleto.split(' ');
          localStorage.setItem('user_nombre', partes[0] || 'Usuario');
          localStorage.setItem('user_apellido', partes.slice(1).join(' ') || '');

          // Preferir la ruta de avatar que venga del servidor, si no, usar la seleccionada en UI
          const avatarFromServer = updatedUser.avatar;
          if (avatarFromServer && avatarFromServer !== '') {
            localStorage.setItem('user_avatar', avatarFromServer);
          } else if (avatarSeleccionado) {
            // Normalizar a ruta relativa si es necesario
            try { localStorage.setItem('user_avatar', avatarSeleccionado.querySelector('img').src); } catch (e) { /* noop */ }
          }
        }
      } catch (e) { /* noop: no bloquear flujo por errores de localStorage */ }
      // Marcar que al menos hubo una actualización del perfil (para redirigir más tarde)
      _perfilGuardado = true;
    }


    const passwordField = document.getElementById("password");
    const new_password = passwordField.value;
    const current_password = document.getElementById("current_password").value;


    if (new_password && new_password !== "********" && new_password.trim() !== "") {

      if (!current_password || current_password.trim() === "") {
        showErrorToast("Debes ingresar tu contraseña actual en el campo de contraseña");
        return;
      }

      // Confirmación de contraseña (input añadido en la vista)
      const confirm_password = (document.getElementById("password_confirmation") || { value: '' }).value;
      if (confirm_password.trim() === "") {
        showErrorToast("Debes confirmar la nueva contraseña");
        return;
      }

      if (confirm_password !== new_password) {
        showErrorToast("Las contraseñas no coinciden");
        return;
      }

      const passwordData = {
        current_password: current_password,
        password: new_password,
        password_confirmation: confirm_password
      };

      const resPass = await fetch(API_UPDATE_PASSWORD, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "Accept": "application/json"
        },
        body: JSON.stringify(passwordData)
      });

      if (!resPass.ok) {
        const errObj = await parseJsonSafe(resPass);
        let serverError = errObj && errObj.message ? errObj.message : (await resPass.text().catch(() => null)) || `HTTP ${resPass.status}`;
        if (errObj && errObj.errors) {
          const messages = [];
          Object.values(errObj.errors).forEach(arr => { if (Array.isArray(arr)) messages.push(...arr); });
          if (messages.length) serverError = messages.join('\n');
        }
        if (resPass.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          // El mensaje se mostrará en el catch global para evitar duplicados
          // window.location.href = '/login';
        }
        throw new Error(serverError || `Error al cambiar contraseña (status ${resPass.status})`);
      }


      passwordField.value = "********";
      document.getElementById("current_password").value = "";
      const confirmField = document.getElementById("password_confirmation");
      if (confirmField) confirmField.value = "";
      // Indicar que hubo cambios para redirigir
      _perfilGuardado = true;
    }

    // Mostrar toast de éxito y luego redirigir a módulo
    // Intentar obtener el estado actualizado desde el servidor y persistirlo
    if (_perfilGuardado) {
      try {
        const meRes = await fetch(`${API_BASE}/me`, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });
        if (meRes.ok) {
          const meData = await parseJsonSafe(meRes) || {};
          try {
            localStorage.setItem('user', JSON.stringify(meData));
            const nombreCompleto = meData.nombre || meData.name || '';
            const partes = nombreCompleto.split(' ');
            localStorage.setItem('user_nombre', partes[0] || 'Usuario');
            localStorage.setItem('user_apellido', partes.slice(1).join(' ') || '');
            // Persistir avatar por usuario para soportar múltiples cuentas en el mismo navegador
            const userId = meData.id || (meData.user && meData.user.id) || null;
            const avatarVal = meData.avatar || (avatarSeleccionado ? avatarSeleccionado.querySelector('img').src : null);
            if (userId && avatarVal) {
              try { localStorage.setItem(`user_avatar_for_${userId}`, avatarVal); } catch (e) { /* noop */ }
              try { localStorage.setItem('user_avatar', avatarVal); } catch (e) { /* noop */ }
              try { localStorage.setItem('user_id', String(userId)); } catch (e) { /* noop */ }
            } else if (avatarVal) {
              try { localStorage.setItem('user_avatar', avatarVal); } catch (e) { /* noop */ }
            }
          } catch (e) { /* noop */ }
        }
      } catch (e) {
        // No bloquear el flujo si falla el GET /me, pero se intentó persistir
        console.warn('No se pudo obtener /me tras actualizar perfil', e);
      }
    }

    showSuccessToast('Perfil actualizado correctamente', 1500);
    if (modal.classList.contains("show")) {
      cerrarModal();
    }
    // Redirigir tras breve espera para que el usuario vea el toast
    setTimeout(() => {
      // Si el perfil o la contraseña se actualizaron, redirigir a módulos
      if (_perfilGuardado) {
        const modulosUrl = document.getElementById('perfilForm')?.dataset.modulosUrl || '/modulos';
        window.location.href = modulosUrl;
      }
    }, 1500);

  } catch (err) {
    console.error("Error:", err);
    if (err instanceof TypeError) {
      showErrorToast(`Error de red al conectar con ${API_BASE}. Verifica que el servidor API esté corriendo y que no haya problemas de CORS.`);
    } else {
      showErrorToast(err.message || "Error al conectar con el servidor");
    }
  } finally {

    guardarBtn.textContent = originalText;
    guardarBtn.disabled = false;
  }
});

// ==========================
// BOTÓN CANCELAR
// ==========================
const cancelarBtn2 = document.querySelector(".cancelar");
cancelarBtn2.addEventListener("click", () => {

  cargarDatosUsuario();

  document.getElementById("password").value = "********";
  document.getElementById("current_password").value = "";
  const confirmField = document.getElementById("password_confirmation");
  if (confirmField) confirmField.value = "";

  opciones.forEach(o => o.classList.remove("selected"));
});