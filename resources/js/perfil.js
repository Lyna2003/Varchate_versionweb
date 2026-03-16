
// Helper: asigna src y revela la imagen de perfil con fade-in
function showProfilePic(el, src) {
  if (!el || !src) return;
  el.onload = () => { el.style.opacity = '1'; };
  el.onerror = () => { el.style.opacity = '1'; };
  el.src = src;
}

const modal = document.getElementById("modalAvatar");
const abrirModalBtn = document.querySelector(".editar-foto");
const cancelarBtn = modal.querySelector(".btn-cancel");
const guardarBtn = modal.querySelector(".btn-save");
let _avatarPendiente = null; // null = sin cambios, 'default' = eliminar, string numérico = nuevo avatar

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
  if (seleccionado) {
    showProfilePic(document.querySelector(".perfil-imagen img"), seleccionado.src);
    _avatarPendiente = seleccionado.closest('.avatar-option').dataset.id;
  }
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
  const perfilImgEl = document.getElementById('perfil-imagen');
  const defaultSrc = (perfilImgEl?.dataset?.default) || '/avatars/avatar_01.png';
  showProfilePic(perfilImg, defaultSrc);
  _avatarPendiente = '1';
  opciones.forEach(o => o.classList.remove('selected'));

  // Also select the avatar_01 option in the modal
  const defaultOption = document.querySelector(`.avatar-option[data-id="1"]`);
  if (defaultOption) {
    defaultOption.classList.add('selected');
  }

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


window.addEventListener("DOMContentLoaded", () => {
  cargarDatosUsuario();
  initPasswordToggles();
  // Dark mode: gestionado globalmente por theme.js
  cargarProgresoModulos();
});

/**
 * Obtiene los módulos disponibles y el progreso del usuario desde la API
 * y renderiza dinámicamente las cards en #grid-progreso.
 */
async function cargarProgresoModulos() {
  const grid = document.getElementById('grid-progreso');
  if (!grid) return;

  const token = getAuthToken();
  if (!token) {
    grid.innerHTML = '<p class="progreso-cargando">Inicia sesión para ver tu progreso.</p>';
    return;
  }

  try {
    // Llamadas en paralelo: módulos disponibles + progreso del usuario
    const [modulosRes, progresoRes] = await Promise.all([
      fetch(`${API_BASE}/modulos`, {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
      }),
      fetch(`${API_BASE}/modulos-con-progreso`, {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
      })
    ]);

    // Parsear módulos
    let modulos = [];
    if (modulosRes.ok) {
      const data = await modulosRes.json();
      modulos = Array.isArray(data) ? data
        : (data.data && Array.isArray(data.data) ? data.data : []);
      // Ordenar por orden_global si existe
      modulos.sort((a, b) => (a.orden_global || 0) - (b.orden_global || 0));
    }

    // Parsear progreso del usuario (mapa id → porcentaje)
    const progresoMap = {};
    if (progresoRes.ok) {
      const pData = await progresoRes.json();
      const lista = pData.success && Array.isArray(pData.data) ? pData.data
        : Array.isArray(pData) ? pData
          : (pData.data && Array.isArray(pData.data) ? pData.data : []);
      lista.forEach(m => {
        progresoMap[m.id] = Math.round(m.progreso || 0);
      });
    }

    if (modulos.length === 0) {
      grid.innerHTML = '<p class="progreso-cargando">No hay módulos disponibles.</p>';
      return;
    }

    // Renderizar cards
    grid.innerHTML = modulos.map(m => {
      const porcentaje = progresoMap[m.id] ?? 0;
      const nombre = (m.modulo || m.titulo || m.nombre || 'Módulo').toUpperCase();
      return `
        <div class="card">
          <h3>${nombre}</h3>
          <div class="barra"><div class="barra-fill" style="width:0%" data-target="${porcentaje}"></div></div>
          <span>${porcentaje}%</span>
        </div>`;
    }).join('');

    // Animar barras con un pequeño delay
    setTimeout(() => {
      grid.querySelectorAll('.barra-fill').forEach(fill => {
        fill.style.width = fill.dataset.target + '%';
      });
    }, 300);

  } catch (err) {
    console.error('Error cargando progreso de módulos:', err);
    grid.innerHTML = '<p class="progreso-cargando">No se pudo cargar el progreso.</p>';
  }
}


// Dark mode: gestionado globalmente por theme.js
// (Esta función fue eliminada — ya no se usa initDarkMode() aquí)


const perfilForm = document.getElementById('perfilForm');
const API_BASE = perfilForm?.dataset.apiUrl || 'http://localhost:8001/api';
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
          showProfilePic(perfilImg, avatarOption.querySelector("img").src);
        } else {
          // Si no hay avatarOption pero tenemos avatar_id, usar default revelado
          const defaultSrc = document.getElementById('perfil-imagen')?.dataset.default || '/avatars/avatar_01.png';
          showProfilePic(perfilImg, defaultSrc);
        }
      } else {
        // Sin avatar_id: mostrar default
        const defaultSrc = document.getElementById('perfil-imagen')?.dataset.default || '/avatars/avatar_01.png';
        showProfilePic(perfilImg, defaultSrc);
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

      // Deshabilitar campo de 'contraseña actual' si el usuario viene de Google y no tiene contraseña
      const pwContainer = document.getElementById('current_password_container');
      const currentPwInput = document.getElementById('current_password');
      if (pwContainer && currentPwInput) {
        // has_password nos llega del backend ahora
        const has_password = user.has_password !== undefined ? user.has_password : true;

        if (has_password === false) {
          // Mantener visible pero deshabilitarlo
          currentPwInput.disabled = true;
          pwContainer.style.opacity = '0.6';
          currentPwInput.dataset.required = 'false';
          currentPwInput.placeholder = "No requerida (Cuenta de Google)";

          // Ocultar el botón del ojito de forma segura
          const toggleBtn = pwContainer.querySelector('.toggle-pass');
          if (toggleBtn) toggleBtn.style.display = 'none';
        } else {
          // Habilitarlo para usuarios normales
          currentPwInput.disabled = false;
          pwContainer.style.opacity = '1';
          currentPwInput.dataset.required = 'true';
          currentPwInput.placeholder = "";

          const toggleBtn = pwContainer.querySelector('.toggle-pass');
          if (toggleBtn) toggleBtn.style.display = '';
        }
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

    const usuario = document.getElementById("usuario").value.trim();

    // =========================
    // Validaciones de Cliente
    // =========================

    // Validar Nombre (Usuario)
    if (!usuario) {
      showErrorToast("El nombre de usuario es obligatorio");
      return;
    }
    if (usuario.length < 3) {
      showErrorToast("El nombre debe tener al menos 3 caracteres");
      return;
    }
    if (/[0-9]/.test(usuario)) {
      showErrorToast("El nombre no puede contener números");
      return;
    }

    const passwordField = document.getElementById("password");
    const new_password = passwordField.value;

    // Validar Nueva Contraseña (solo si se intenta cambiar)
    if (new_password && new_password !== "********" && new_password.trim() !== "") {
      if (new_password.length < 8) {
        showErrorToast("La contraseña debe tener al menos 8 caracteres");
        return;
      }
      if (!/[A-Z]/.test(new_password)) {
        showErrorToast("La contraseña debe tener al menos una mayúscula");
        return;
      }
      if (!/[a-z]/.test(new_password)) {
        showErrorToast("La contraseña debe tener al menos una minúscula");
        return;
      }
      if (!/[0-9]/.test(new_password)) {
        showErrorToast("La contraseña debe tener al menos un número");
        return;
      }
    }

    const profileData = {};
    if (usuario) {
      profileData.nombre = usuario;
      profileData.name = usuario;
    }

    if (_avatarPendiente === 'default') {
      profileData.avatar_id = 1; // Always fallback to 1 explicitly
    } else if (_avatarPendiente !== null) {
      profileData.avatar_id = parseInt(_avatarPendiente);
    }

    if (Object.keys(profileData).length > 0) {
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
        let serverError = errObj?.message || `HTTP ${res.status}`;
        if (errObj?.errors) {
          const messages = [];
          Object.values(errObj.errors).forEach(arr => { if (Array.isArray(arr)) messages.push(...arr); });
          if (messages.length) serverError = messages.join('\n');
        }
        if (res.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
        }
        throw new Error(serverError);
      }

      const updatedUser = await parseJsonSafe(res);
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        const nombreCompleto = updatedUser.nombre || updatedUser.name || '';
        const partes = nombreCompleto.split(' ');
        localStorage.setItem('user_nombre', partes[0] || 'Usuario');
        localStorage.setItem('user_apellido', partes.slice(1).join(' ') || '');
        const avatarVal = updatedUser.avatar || null;
        if (avatarVal) {
          localStorage.setItem('user_avatar', avatarVal);
          if (updatedUser.id) localStorage.setItem(`user_avatar_for_${updatedUser.id}`, avatarVal);
        } else {
          // Avatar eliminado: limpiar localStorage
          localStorage.removeItem('user_avatar');
          if (updatedUser.id) localStorage.removeItem(`user_avatar_for_${updatedUser.id}`);
        }
      }
      _perfilGuardado = true;
      // Resetear estado de avatar pendiente tras guardar
      _avatarPendiente = null;
    }


    const current_password = document.getElementById("current_password").value;

    if (new_password && new_password !== "********" && new_password.trim() !== "") {

      const currentPwInput = document.getElementById("current_password");
      if (currentPwInput.dataset.required !== "false" && (!current_password || current_password.trim() === "")) {
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
      showErrorToast(`Error de red al conectar con ${API_BASE}.`);
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