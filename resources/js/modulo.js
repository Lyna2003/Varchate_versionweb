// ===============================
// VERIFICACIÓN DE AUTENTICACIÓN
// ===============================

document.addEventListener('DOMContentLoaded', async function () {
    // Verificar token en localStorage
    const token = localStorage.getItem('auth_token');

    if (!token) {
        await redirigirALogin();
        return;
    }

    // Obtener el slug del módulo desde la URL
    const moduleSlug = obtenerSlugDeURL();
    console.log('Módulo actual:', moduleSlug);

    // Verificar que el token sea válido con la API
    await verificarTokenEnSegundoPlano(token);

    // Cargar datos del usuario desde localStorage primero
    cargarDatosUsuario();

    // Si no hay slug (ruta /modulos general), mostrar bienvenida
    if (!moduleSlug) {
        mostrarBienvenidaModulos();
        await cargarDatosModulo(null);
        return;
    }

    // Cargar datos del módulo desde la API
    await cargarDatosModulo(moduleSlug);
});

// Función auxiliar para redirigir a login de manera consistente
// Siempre limpia localStorage y la sesión Laravel antes de redirigir
async function redirigirALogin(params = '') {
    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_nombre');
    localStorage.removeItem('user_apellido');
    localStorage.removeItem('user_email');

    // Limpiar sesión de Laravel para evitar el loop de redirect
    try {
        const mainEl = document.querySelector('main[data-clear-session-url]');
        const clearSessionUrl = mainEl?.dataset.clearSessionUrl || '/api/clear-session-token';
        await fetch(clearSessionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (_) { /* ignorar errores de red */ }

    // Construir URL absoluta sin barras dobles
    const baseUrl = window.location.origin;
    const loginPath = params ? `/login${params}` : '/login';
    window.location.href = baseUrl + loginPath;
}

function obtenerSlugDeURL() {
    // Ejemplo: /modulo/introduccion-a-html → devuelve 'introduccion-a-html'
    // /modulos → devuelve null (vista general)
    const path = window.location.pathname;
    if (path === '/modulos' || path === '/modulos/') return null;
    const pathParts = path.split('/');
    const slugIndex = pathParts.indexOf('modulo') + 1;
    return slugIndex > 0 && slugIndex < pathParts.length ? pathParts[slugIndex] : null;
}

async function verificarTokenEnSegundoPlano(token) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

    try {
        const response = await fetch(`${apiUrl}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
                const nombreCompleto = userData.nombre || userData.name || '';
                const partes = nombreCompleto.split(' ');
                localStorage.setItem('user_nombre', partes[0] || 'Usuario');
                localStorage.setItem('user_apellido', partes.slice(1).join(' ') || '');
                localStorage.setItem('user_email', userData.email || '');

                // Sincronizar avatar desde avatar_id de la API (fuente de verdad: DB)
                const avatarId = userData.avatar_id;
                if (avatarId) {
                    const avatarsBase = document.querySelector('main.container')?.dataset.avatarsUrl || '/avatars';
                    const num = parseInt(avatarId);
                    const filename = isNaN(num)
                        ? 'default.png'
                        : `avatar_${String(num).padStart(2, '0')}.png`;
                    const avatarUrl = `${avatarsBase}/${filename}`;

                    // Actualizar ambas claves para que cargarDatosUsuario() siempre lea el valor correcto
                    localStorage.setItem('user_avatar', avatarUrl);
                    if (userData.id) localStorage.setItem(`user_avatar_for_${userData.id}`, avatarUrl);

                    // Actualizar el DOM directamente
                    showProfilePic(document.getElementById('profile-pic'), avatarUrl);
                    showProfilePic(document.getElementById('profile-pic-mobile'), avatarUrl);
                }

                cargarDatosUsuario();
            }
        } else {
            // Token inválido — redirigir a login (redirigirALogin limpia sesión automáticamente)
            await redirigirALogin('?expired=true');
        }
    } catch (error) {
        // Error de red: NO redirigir, solo loguear. La API puede estar temporalmente caída.
        console.warn('No se pudo verificar el token (posible error de red):', error);
    }
}

function mostrarMensajeSesionExpirada() {
    if (document.getElementById('session-expired-message')) return;

    const mensaje = document.createElement('div');
    mensaje.id = 'session-expired-message';
    mensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    mensaje.innerHTML = `
        <span>⚠️ Tu sesión ha expirado</span>
        <button onclick="redirigirALogin('?expired=true')" style="
            background: white;
            color: #f44336;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        ">Reconectar</button>
    `;
    document.body.appendChild(mensaje);

    setTimeout(() => {
        if (mensaje.parentNode) {
            mensaje.remove();
        }
    }, 10000);
}

// Hacer la función global para que pueda ser llamada desde el HTML
window.redirigirALogin = redirigirALogin;

function cargarDatosUsuario() {
    const nombre = localStorage.getItem('user_nombre') || 'Usuario';
    const apellido = localStorage.getItem('user_apellido') || '';

    const userNameDesktop = document.getElementById('userNameDesktop');
    if (userNameDesktop) {
        const firstNameSpan = userNameDesktop.querySelector('.first-name');
        const lastNameSpan = userNameDesktop.querySelector('.last-name');
        if (firstNameSpan) firstNameSpan.textContent = nombre;
        if (lastNameSpan) lastNameSpan.textContent = apellido;
    }

    const userNameMobile = document.getElementById('userNameMobile');
    if (userNameMobile) {
        const firstNameSpan = userNameMobile.querySelector('.first-name');
        const lastNameSpan = userNameMobile.querySelector('.last-name');
        if (firstNameSpan) firstNameSpan.textContent = nombre;
        if (lastNameSpan) lastNameSpan.textContent = apellido;
    }

    // Mostrar avatar: preferir avatar específico del usuario (user_avatar_for_{id}), si no, fallback a user_avatar
    let avatarToShow = null;
    try {
        const userObj = JSON.parse(localStorage.getItem('user') || 'null');
        const userId = userObj && (userObj.id || userObj.user_id) ? (userObj.id || userObj.user_id) : localStorage.getItem('user_id');
        if (userId) {
            const perUser = localStorage.getItem(`user_avatar_for_${userId}`);
            if (perUser) avatarToShow = perUser;
        }
    } catch (e) {
        // ignore
    }
    if (!avatarToShow) avatarToShow = localStorage.getItem('user_avatar');

    if (avatarToShow) {
        const buildUrl = (val) => {
            if (!val) return null;
            if (val.startsWith('http') || val.startsWith('/') || val.includes('avatars/')) return val;
            return `/avatars/${val}`;
        };
        const avatarUrl = buildUrl(avatarToShow);
        showProfilePic(document.getElementById('profile-pic'), avatarUrl);
        showProfilePic(document.getElementById('profile-pic-mobile'), avatarUrl);
    }
}

/**
 * Asigna src a una imagen de perfil y la revela con fade-in.
 * La imagen empieza oculta (opacity:0) en el HTML.
 */
function showProfilePic(el, src) {
    if (!el || !src) return;
    el.onload = () => { el.style.opacity = '1'; };
    el.onerror = () => { el.style.opacity = '1'; }; // mostrar aunque falle
    el.src = src;
}

// ===============================
// CARGA DE DATOS DESDE LA API
// ===============================

let modulosGlobal = [];
let moduloActual = null;
let leccionesModulo = [];
let progresoModulo = null;
let evaluacionData = null; // descripción y datos de la evaluación precargados
let leccionActualIndex = -1; // -1 = Introducción, 0+ = Lecciones

async function cargarDatosModulo(moduleSlug) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    mostrarSpinner(true);

    try {
        // 1. Cargar todos los módulos para los botones superiores
        const modulosResponse = await fetch(`${apiUrl}/modulos`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (modulosResponse.ok) {
            modulosGlobal = await modulosResponse.json();
            console.log('Módulos cargados:', modulosGlobal);
            renderizarBotonesModulos(modulosGlobal);
        }

        // 2. Cargar el módulo específico por slug (solo si hay slug)
        if (!moduleSlug) {
            // En /modulos sin slug, solo cargar los botones y mostrar bienvenida
            mostrarBienvenidaModulos();
            mostrarSpinner(false);
            inicializarFuncionalidades();
            return;
        }

        const moduloResponse = await fetch(`${apiUrl}/modulos/${moduleSlug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (moduloResponse.ok) {
            moduloActual = await moduloResponse.json();
            console.log('Módulo actual:', moduloActual);

            // Actualizar título del módulo en la barra de progreso con el nombre corto
            actualizarTituloModulo(moduloActual);

            // Actualizar la introducción con la descripción larga
            actualizarIntroduccionModulo();

            // 3. Cargar PRIMERO el progreso (para que las lecciones se rendericen con el estado correcto)
            await cargarProgresoModulo(moduloActual.id);

            // 4. Precargar descripción de la evaluación (en paralelo con lecciones)
            const [_, leccionesResult] = await Promise.all([
                precargarEvaluacion(moduloActual.id),
                cargarLeccionesModulo(moduloActual.id, moduleSlug)
            ]);
        } else {
            console.error('Error cargando módulo:', moduloResponse.status);
            mostrarBienvenidaModulos();
        }

    } catch (error) {
        console.error('Error cargando datos del módulo:', error);
        mostrarBienvenidaModulos();
    } finally {
        mostrarSpinner(false);
        inicializarFuncionalidades();
    }
}

function actualizarIntroduccionModulo() {
    const introduccionContent = document.getElementById('introduccionContent');
    if (!introduccionContent || !moduloActual) return;

    // Actualizar el título
    const introHeader = introduccionContent.querySelector('h2');
    if (introHeader) {
        introHeader.innerHTML = `${moduloActual.titulo}`;
    }

    // Eliminar párrafos existentes
    const parrafosExistentes = introduccionContent.querySelectorAll('p');
    parrafosExistentes.forEach(p => p.remove());

    if (moduloActual.descripcion_larga) {
        // Dividir por saltos de línea (\n)
        const parrafos = moduloActual.descripcion_larga.split('\n');

        // Variable para mantener referencia al último elemento insertado
        let ultimoElemento = introHeader;

        // Crear un párrafo por cada línea no vacía (en orden)
        parrafos.forEach(parrafo => {
            if (parrafo.trim().length > 0) {
                const p = document.createElement('p');
                p.textContent = parrafo.trim();
                p.style.marginBottom = '20px';
                p.style.lineHeight = '1.8';
                p.style.fontSize = '16px';
                p.style.textAlign = 'justify';

                // Insertar después del último elemento que insertamos
                ultimoElemento.insertAdjacentElement('afterend', p);
                ultimoElemento = p; // Actualizar la referencia
            }
        });
    }

    // Asegurar que el título "Contenido" y las lecciones estén después
    const contenidoTitulo = introduccionContent.querySelector('h3');
    const lessonsContainer = document.getElementById('lessonsContainer');

    if (contenidoTitulo) {
        introduccionContent.appendChild(contenidoTitulo);
    }
    if (lessonsContainer) {
        introduccionContent.appendChild(lessonsContainer);
    }
}

async function cargarLeccionesModulo(moduloId, moduleSlug) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    try {
        const response = await fetch(`${apiUrl}/modulos/${moduleSlug}/lecciones`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📚 Lecciones cargadas (raw):', data);

            let leccionesArray = [];

            // Verificar la estructura de la respuesta
            if (Array.isArray(data)) {
                leccionesArray = data;
            } else if (data.data && Array.isArray(data.data)) {
                leccionesArray = data.data;
            } else if (data.lecciones && Array.isArray(data.lecciones)) {
                leccionesArray = data.lecciones;
            } else if (data && typeof data === 'object') {
                // Podría ser que las lecciones estén en una propiedad
                for (let key in data) {
                    if (Array.isArray(data[key])) {
                        leccionesArray = data[key];
                        console.log(`📦 Lecciones encontradas en propiedad "${key}":`, leccionesArray);
                        break;
                    }
                }

                // Si no encontró array, intentar con Object.values
                if (leccionesArray.length === 0) {
                    leccionesArray = Object.values(data).filter(item => item && typeof item === 'object' && item.id);
                }
            }

            // Filtrar lecciones que no tengan ID
            leccionesArray = leccionesArray.filter(leccion => {
                if (!leccion || !leccion.id) {
                    console.warn('Lección sin ID ignorada:', leccion);
                    return false;
                }
                return true;
            });

            console.log('✅ Lecciones procesadas:', leccionesArray);
            leccionesModulo = leccionesArray;
            renderizarLecciones(leccionesArray);
        }
    } catch (error) {
        console.error('Error cargando lecciones:', error);
        leccionesModulo = [];
        renderizarLecciones([]);
    }
}

async function cargarProgresoModulo(moduloId) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    try {
        console.log('📥 Cargando progreso para módulo:', moduloId);

        // Intentar cargar progreso de módulos con progreso
        const response = await fetch(`${apiUrl}/modulos-con-progreso`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📊 Progreso cargado (raw):', data);

            // Verificar si la respuesta es un array o un objeto
            if (data.success && Array.isArray(data.data)) {
                progresoModulo = data.data.find(m => m.id === moduloId);
                console.log('🎯 Progreso del módulo actual:', progresoModulo);
            } else if (Array.isArray(data)) {
                progresoModulo = data.find(m => m.id === moduloId);
            } else if (data && typeof data === 'object') {
                // Si es un objeto, intentar extraer de alguna propiedad
                if (data.modulos && Array.isArray(data.modulos)) {
                    progresoModulo = data.modulos.find(m => m.id === moduloId);
                } else if (data.progreso && Array.isArray(data.progreso)) {
                    progresoModulo = data.progreso.find(m => m.id === moduloId);
                } else {
                    // Si es un objeto con el progreso del módulo actual
                    progresoModulo = data.id === moduloId ? data : null;
                }
            }

            console.log('✅ Progreso procesado:', progresoModulo);

            if (progresoModulo) {
                actualizarProgreso(progresoModulo.progreso || 0);

                // Si ya tenemos lecciones cargadas, volver a renderizarlas con el progreso actualizado
                if (window.leccionesOrdenadas && window.leccionesOrdenadas.length > 0) {
                    renderizarLecciones(window.leccionesOrdenadas);
                }
            }
        }
    } catch (error) {
        console.error('Error cargando progreso:', error);
    }
}

async function precargarEvaluacion(moduloId) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${apiUrl}/modulos/${moduloId}/evaluacion`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (response.ok) {
            const json = await response.json();
            evaluacionData = json?.data?.evaluacion || null;
            console.log('📋 Evaluación precargada:', evaluacionData);
        }
    } catch (error) {
        console.warn('No se pudo precargar la evaluación:', error);
    }
}

// ===============================
// RENDERIZADO DE COMPONENTES
// ===============================

function renderizarBotonesModulos(modulos) {
    const container = document.getElementById('topButtonsContainer');
    if (!container) return;

    // Limpiar contenedor
    container.innerHTML = '';

    // Ordenar módulos por orden_global
    const modulosOrdenados = [...modulos].sort((a, b) => (a.orden_global || 0) - (b.orden_global || 0));

    // Obtener el slug del módulo actual desde la URL como respaldo
    const currentSlug = obtenerSlugDeURL();

    modulosOrdenados.forEach(modulo => {
        const button = document.createElement('button');
        button.setAttribute('data-modulo-id', modulo.id);
        button.setAttribute('data-modulo-slug', modulo.slug);
        button.textContent = modulo.modulo.toUpperCase();

        // Verificar si es el módulo actual comparando por ID o slug
        const esModuloActual = (moduloActual && modulo.id === moduloActual.id) ||
            (!moduloActual && modulo.slug === currentSlug);

        if (esModuloActual) {
            button.classList.add('active');
            console.log('Botón activado:', modulo.modulo); // Para debugging
        }

        button.addEventListener('click', () => {
            const baseUrl = document.querySelector('main.container')?.dataset.moduloBaseUrl || '/modulo';
            window.location.href = `${baseUrl}/${modulo.slug}`;
        });

        container.appendChild(button);
    });
}

function renderizarLecciones(lecciones) {
    const sidebar = document.getElementById('sidebar');
    const lessonsContainer = document.getElementById('lessonsContainer');

    if (!sidebar || !lessonsContainer) return;

    // Verificar que lecciones sea un array
    if (!Array.isArray(lecciones) || lecciones.length === 0) {
        console.warn('No hay lecciones para mostrar');
        sidebar.innerHTML = '<button class="active" data-tipo="intro">INTRODUCCIÓN</button>';
        lessonsContainer.innerHTML = '<p class="no-lessons">No hay lecciones disponibles en este módulo</p>';
        return;
    }

    // Ordenar lecciones por orden
    const leccionesOrdenadas = [...lecciones].sort((a, b) => (a.orden || 0) - (b.orden || 0));

    // Guardar las lecciones ordenadas globalmente para usarlas después
    window.leccionesOrdenadas = leccionesOrdenadas;

    // ===== Obtener datos de progreso REALES =====
    const leccionesCompletadas = progresoModulo?.lecciones_vistas || 0;
    const totalLeccionesReales = leccionesOrdenadas.length; // Usar el length real, no el de BD

    console.log('📊 Renderizando lecciones:', {
        leccionesCompletadas: leccionesCompletadas,
        totalLecciones: totalLeccionesReales,
        evaluacionAprobada: progresoModulo?.evaluacion_aprobada,
        progresoModulo: progresoModulo
    });

    // 1. Renderizar sidebar (BOTONES FUNCIONALES)
    let sidebarHTML = '<button class="active" data-tipo="intro" data-leccion-id="intro">INTRODUCCIÓN</button>';

    leccionesOrdenadas.forEach((leccion, index) => {
        // ===== LÓGICA DE DESBLOQUEO =====
        // Solo la INTRODUCCIÓN está libre para usuarios nuevos.
        // Lección 1 se desbloquea cuando leccionesCompletadas >= 1
        // Lección N se desbloquea cuando se ha completado la anterior
        const estaDesbloqueada = index < leccionesCompletadas;

        // Si la evaluación ya está aprobada, TODAS las lecciones están desbloqueadas
        const todasDesbloqueadas = progresoModulo?.evaluacion_aprobada === true;
        const desbloqueadaFinal = todasDesbloqueadas ? true : estaDesbloqueada;

        const claseBloqueo = desbloqueadaFinal ? '' : 'locked';
        const lockUrl = document.querySelector('main.container')?.dataset.lockUrl || '/images/Lock.svg';
        const iconoLlave = desbloqueadaFinal ? '' : `<img src="${lockUrl}" alt="Bloqueado" class="icon-lock">`;

        // Marcar como vista si ya fue completada
        const claseVista = index < leccionesCompletadas ? 'vista' : '';

        sidebarHTML += `
            <button class="${claseBloqueo} ${claseVista}" data-leccion-id="${leccion.id}" data-leccion-slug="${leccion.slug}" data-leccion-index="${index}">
                LECCIÓN ${index + 1} ${iconoLlave}
            </button>
        `;

        console.log(`Lección ${index + 1}:`, {
            id: leccion.id,
            titulo: leccion.titulo,
            desbloqueada: desbloqueadaFinal,
            completada: index < leccionesCompletadas
        });
    });

    // Verificar si todas las lecciones están completadas para desbloquear evaluación
    const todasLeccionesCompletadas = leccionesCompletadas >= leccionesOrdenadas.length;
    const evaluacionDesbloqueada = todasLeccionesCompletadas || progresoModulo?.evaluacion_aprobada === true;
    const evaluacionAprobadaSidebar = progresoModulo?.evaluacion_aprobada === true;
    const claseEvaluacion = evaluacionDesbloqueada
        ? (evaluacionAprobadaSidebar ? 'vista' : '')
        : 'locked';

    sidebarHTML += `
        <button class="${claseEvaluacion}" data-tipo="evaluacion" data-evaluacion-id="${moduloActual?.id || 1}">
            EVALUACIÓN ${!evaluacionDesbloqueada ? `<img src="${document.querySelector('main.container')?.dataset.lockUrl || '/images/Lock.svg'}" alt="Bloqueado" class="icon-lock">` : ''}
        </button>
    `;

    sidebar.innerHTML = sidebarHTML;

    // 2. Renderizar lista de lecciones en contenido (SOLO VISUALES, SIN EVENTOS)
    let lessonsHTML = '';

    leccionesOrdenadas.forEach((leccion, index) => {
        // Extraer un párrafo corto del contenido para la descripción
        let descripcionCorta = '';
        if (leccion.contenido) {
            // Eliminar etiquetas HTML y tomar los primeros 100 caracteres
            const textoPlano = leccion.contenido.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            descripcionCorta = textoPlano.substring(0, 100) + (textoPlano.length > 100 ? '...' : '');
        } else {
            descripcionCorta = 'Contenido de la lección';
        }

        // Marcar visualmente las lecciones completadas
        const claseCompletada = index < leccionesCompletadas ? 'completed' : '';

        lessonsHTML += `
        <div class="lesson ${claseCompletada}" 
             data-leccion-id="${leccion.id}" 
             data-leccion-slug="${leccion.slug}" 
             data-leccion-index="${index}">
            <i class="fa-regular fa-file-lines"></i>
            <div>
                <strong>Lección ${index + 1} – ${leccion.titulo || 'Sin título'}</strong>
                <p>${descripcionCorta}</p>
                <!-- ELIMINADO: el span con el texto "Completada" -->
            </div>
        </div>
    `;
    });

    // Agregar evaluación (SOLO VISUAL)
    const evaluacionAprobada = progresoModulo?.evaluacion_aprobada || false;
    const descEvaluacion = evaluacionData?.descripcion
        ? evaluacionData.descripcion.substring(0, 120) + (evaluacionData.descripcion.length > 120 ? '...' : '')
        : 'Pon a prueba tus conocimientos del módulo';

    lessonsHTML += `
            <div class="lesson evaluation ${evaluacionAprobada ? 'completed' : ''}" 
                data-tipo="evaluacion" 
                data-evaluacion-id="${moduloActual?.id || 1}">
                <i class="fa-regular fa-file-lines"></i>
                <div>
                    <strong>${evaluacionData?.titulo || 'Evaluación del Módulo'}</strong>
                    <p>${descEvaluacion}</p>
                </div>
            </div>
        `;

    lessonsContainer.innerHTML = lessonsHTML;

    // Agregar event listeners SOLO a los botones del sidebar
    document.querySelectorAll('.sidebar button').forEach(btn => {
        // Remover listeners anteriores para evitar duplicados
        btn.replaceWith(btn.cloneNode(true));
    });

    // Volver a seleccionar los botones después de reemplazarlos
    document.querySelectorAll('.sidebar button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const leccionId = btn.dataset.leccionId;
            const leccionSlug = btn.dataset.leccionSlug;
            const leccionIndex = parseInt(btn.dataset.leccionIndex);
            const tipo = btn.dataset.tipo;

            console.log('Click en sidebar button:', { tipo, leccionId, leccionSlug, leccionIndex });

            // Verificar si el botón está bloqueado visualmente
            if (btn.classList.contains('locked')) {
                e.preventDefault();
                e.stopPropagation();

                if (tipo === 'evaluacion') {
                    mostrarMensajeBloqueado('Completa todas las lecciones para acceder a la evaluación');
                } else {
                    const leccionesCompletadas = progresoModulo?.lecciones_vistas || 0;
                    if (leccionesCompletadas === 0 && leccionIndex > 0) {
                        mostrarMensajeBloqueado('Completa la primera lección para continuar');
                    } else {
                        mostrarMensajeBloqueado('Completa la lección anterior para desbloquear esta');
                    }
                }
                return;
            }

            // Marcar como activo
            document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (tipo === 'intro') {
                console.log('Mostrando introducción');
                leccionActualIndex = -1; // Sincronizar estado
                mostrarIntroduccion();
            } else if (tipo === 'evaluacion') {
                console.log('Cargando evaluación');
                leccionActualIndex = window.leccionesOrdenadas?.length ?? 0; // Sincronizar estado
                cargarEvaluacion(btn.dataset.evaluacionId);
            } else if (leccionSlug && moduloActual) {
                console.log('Cargando lección:', leccionSlug);
                leccionActualIndex = leccionIndex; // Sincronizar estado
                cargarLeccion(moduloActual.slug, leccionSlug);
            }
        });
    });
}

// Función para mostrar mensaje de contenido bloqueado
function mostrarMensajeBloqueado(mensaje = 'Completa el contenido anterior para desbloquear este') {
    if (document.getElementById('locked-message')) return;

    const mensajeEl = document.createElement('div');
    mensajeEl.id = 'locked-message';
    mensajeEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ff9800;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        font-weight: bold;
        animation: slideUp 0.3s ease;
        text-align: center;
        min-width: 300px;
    `;
    mensajeEl.innerHTML = `${mensaje}`;

    document.body.appendChild(mensajeEl);

    setTimeout(() => {
        if (mensajeEl.parentNode) {
            mensajeEl.remove();
        }
    }, 3000);
}

// Función para mostrar mensaje de éxito
function mostrarMensajeExito(mensaje) {
    if (document.getElementById('success-message')) return;

    const mensajeEl = document.createElement('div');
    mensajeEl.id = 'success-message';
    mensajeEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #4caf50;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        font-weight: bold;
        animation: slideUp 0.3s ease;
        text-align: center;
        min-width: 300px;
    `;
    mensajeEl.innerHTML = `${mensaje}`;

    document.body.appendChild(mensajeEl);

    setTimeout(() => {
        if (mensajeEl.parentNode) {
            mensajeEl.remove();
        }
    }, 2000);
}

// Agregar estilos globales UNA SOLA VEZ
if (!document.getElementById('animation-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'animation-styles';
    styleElement.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translate(-50%, 20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
        .no-lessons {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
        /* Estilos para las lecciones visuales */
        .lessons .lesson {
            cursor: default !important;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 10px;
            transition: all 0.3s ease;
        }

          /* Botón de INTRODUCCIÓN (estilo base) */
        .sidebar button[data-tipo="intro"] {
            background-color: #FFFFFF;
            color: #616461;
        }

        /* Botón de EVALUACIÓN (estilo base - igual que intro) */
        .sidebar button[data-tipo="evaluacion"] {
            background-color: #FFFFFF;
            color: #616461;
        }
        
        /* Botón de INTRODUCCIÓN ACTIVO */
        .sidebar button[data-tipo="intro"].active {
            background-color: #0099FF !important;
            color: #FFFFFF !important;
        }

        /* Botón de EVALUACIÓN ACTIVO */
        .sidebar button[data-tipo="evaluacion"].active {
            background-color: #0099FF !important;
            color: #FFFFFF !important;
        }

        .sidebar button.vista {
            background-color: #FFFFFF;
            color: #616461;
        }

          .sidebar button.active {
            background-color: #0099FF !important;
            color: #FFFFFF !important;
            border-left: none; /* Quitamos el borde cuando está activo */
        }
        
        /* Botón ACTIVO que además es VISTO - prevalece el azul */
        .sidebar button.active.vista {
            background-color: #0099FF !important;
            color: #FFFFFF !important;
            border-left: none;
        }
        .lessons .lesson.completed {
            background-color: #f0fff0;
            border-color: #4caf50;
        }
      
        .lessons .lesson.evaluation.locked {
            opacity: 0.6;
            background-color: #f5f5f5;
        }
    `;
    document.head.appendChild(styleElement);
}

// ===============================
// CARGA DE CONTENIDO ESPECÍFICO
// ===============================

function limpiarContenidoHTML(html) {
    if (!html) return '<p>Contenido no disponible</p>';

    let contenidoLimpio = html;

    // Extraer contenido del body (pero conservar estilos)
    const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
    const bodyMatch = contenidoLimpio.match(bodyRegex);
    if (bodyMatch && bodyMatch[1]) {
        contenidoLimpio = bodyMatch[1];
    }

    // Extraer estilos del head y agregarlos al contenido
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styles = '';
    let styleMatch;
    while ((styleMatch = styleRegex.exec(html)) !== null) {
        styles += styleMatch[0];
    }

    // Si hay estilos, agregarlos al principio del contenido
    if (styles) {
        contenidoLimpio = styles + contenidoLimpio;
    }

    // Eliminar metadatos y doctype (no afectan estilos)
    contenidoLimpio = contenidoLimpio.replace(/<meta[^>]*>/gi, '');
    contenidoLimpio = contenidoLimpio.replace(/<!DOCTYPE[^>]*>/i, '');

    // Eliminar etiquetas html y head vacías
    contenidoLimpio = contenidoLimpio.replace(/<\/?html[^>]*>/gi, '');
    contenidoLimpio = contenidoLimpio.replace(/<\/?head[^>]*>/gi, '');

    return contenidoLimpio;
}

function mostrarContenidoNoDisponible() {
    const leccionContent = document.getElementById('leccionContent');
    if (leccionContent) {
        leccionContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Contenido no disponible</h3>
                <p>Lo sentimos, no se pudo cargar el contenido de esta lección.</p>
                <button onclick="window.location.reload()" style="
                    background: #0099FF;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                ">Reintentar</button>
            </div>
        `;
    }
}

async function cargarLeccion(moduloSlug, leccionSlug) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    mostrarSpinner(true);

    try {
        console.log('📖 Cargando lección:', { moduloSlug, leccionSlug });

        // Verificar que tenemos el módulo actual
        if (!moduloActual || !moduloActual.id) {
            console.error('No hay módulo actual');
            mostrarSpinner(false);
            return;
        }

        const response = await fetch(`${apiUrl}/modulos/${moduloSlug}/lecciones/${leccionSlug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Respuesta completa:', data);

            // Extraer la lección de la propiedad 'leccion'
            let leccion = null;

            if (data.leccion) {
                leccion = data.leccion;
                console.log('📦 Lección extraída de propiedad leccion:', leccion);
            } else if (data.data) {
                leccion = data.data;
            } else if (data.id) {
                leccion = data;
            }

            if (!leccion || !leccion.id) {
                console.error('❌ No se pudo extraer la lección con ID:', leccion);
                console.error('Estructura recibida:', data);
                mostrarContenidoNoDisponible();
                mostrarSpinner(false);
                return;
            }

            console.log('✅ Lección procesada - ID:', leccion.id, 'Título:', leccion.titulo);

            // Limpiar el contenido HTML
            let contenidoLimpio = leccion.contenido || '<p>Contenido no disponible</p>';
            contenidoLimpio = limpiarContenidoHTML(contenidoLimpio);

            console.log('📄 Contenido limpio (primeros 200 chars):', contenidoLimpio.substring(0, 200) + '...');

            // Mostrar contenido de la lección
            const introduccionContent = document.getElementById('introduccionContent');
            const leccionContent = document.getElementById('leccionContent');

            // Mostrar el botón "Siguiente" en lecciones normales
            const btnNextLeccion = document.getElementById('btnNext');
            if (btnNextLeccion) btnNextLeccion.style.display = '';

            if (introduccionContent) introduccionContent.style.display = 'none';
            if (leccionContent) {
                leccionContent.style.display = 'block';
                leccionContent.innerHTML = contenidoLimpio;
            }

            // Subir al tope automáticamente al cargar nueva lección
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Encontrar el índice de la lección actual
            if (window.leccionesOrdenadas) {
                const indiceActual = window.leccionesOrdenadas.findIndex(l => l.id === leccion.id);
                console.log('📍 Índice de lección actual:', indiceActual);
            }

        } else {
            console.error('Error cargando lección:', response.status);
            const errorText = await response.text();
            console.error('Detalle del error:', errorText);
            mostrarContenidoNoDisponible();
        }
    } catch (error) {
        console.error('Error cargando lección:', error);
        mostrarContenidoNoDisponible();
    } finally {
        mostrarSpinner(false);
    }
}

async function marcarLeccionVista(moduloId, leccionId, skipRender = false, mostrarMensaje = true) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    try {
        const response = await fetch(`${apiUrl}/modulos/${moduloId}/lecciones/${leccionId}/marcar-vista`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            // Recargar progreso
            await cargarProgresoModulo(moduloId);

            // Solo re-renderizar el sidebar si no se pide omitir
            if (!skipRender && window.leccionesOrdenadas) {
                renderizarLecciones(window.leccionesOrdenadas);
            }

            // Solo mostrar mensaje si es la primera vez que se completa
            if (mostrarMensaje) {
                mostrarMensajeExito('¡Lección completada!');
            }
        } else {
            console.error('❌ Error marcando lección:', await response.text());
        }

    } catch (error) {
        console.error('Error marcando lección como vista:', error);
    }
}

async function cargarEvaluacion(evaluacionId) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    mostrarSpinner(true);

    try {
        console.log('📝 Cargando evaluación para módulo:', moduloActual?.id);

        if (!moduloActual?.id) {
            console.error('No hay módulo actual');
            return;
        }

        const response = await fetch(`${apiUrl}/modulos/${moduloActual.id}/evaluacion`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const json = await response.json();
            console.log('✅ Evaluación cargada:', json);

            const introduccionContent = document.getElementById('introduccionContent');
            const leccionContent = document.getElementById('leccionContent');
            // Ocultar el botón "Siguiente" en la sección de evaluación
            const btnNext = document.getElementById('btnNext');
            if (btnNext) btnNext.style.display = 'none';

            if (introduccionContent) introduccionContent.style.display = 'none';
            if (leccionContent) {
                leccionContent.style.display = 'block';
                leccionContent.innerHTML = renderizarEvaluacion(json);
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Enlazar botón de iniciar evaluación
                const btnIniciar = leccionContent.querySelector('#btn-iniciar-evaluacion');
                if (btnIniciar && !btnIniciar.disabled) {
                    btnIniciar.addEventListener('click', () => {
                        const evalId = json.data?.evaluacion?.id;
                        iniciarEvaluacion(evalId);
                    });
                }
            }
        } else {
            console.error('Error cargando evaluación:', response.status);
            if (response.status === 403) {
                mostrarMensajeBloqueado('No tienes acceso a la evaluación. Completa todas las lecciones primero.');
            }
        }
    } catch (error) {
        console.error('Error cargando evaluación:', error);
    } finally {
        mostrarSpinner(false);
    }
}

function renderizarEvaluacion(json) {
    const imagesBase = document.querySelector('main.container')?.dataset.imagesUrl || '/images';
    const mascotaUrl = `${imagesBase}/gato_evaluacion.png`;

    // Extraer datos del JSON de la API: { success, data: { evaluacion, estado_usuario } }
    const data = json?.data || {};
    const evaluacion = data.evaluacion || {};
    const estadoUsuario = data.estado_usuario || {};

    const evaluacionAprobada = estadoUsuario.ya_aprobo || progresoModulo?.evaluacion_aprobada || false;
    const puedeIntentar = estadoUsuario.puede_intentar !== false;
    const mensajeBloqueo = estadoUsuario.mensaje || '';
    const intentosCompletados = estadoUsuario.intentos_completados || 0;
    const intentosDisponibles = estadoUsuario.intentos_disponibles;
    const mejorPorcentaje = estadoUsuario.mejor_porcentaje || 0;

    const titulo = evaluacion.titulo || 'Evaluación';
    const descripcion = evaluacion.descripcion || '';
    const tiempoLimite = evaluacion.tiempo_limite || null;
    const numeroPreguntas = evaluacion.numero_preguntas || null;
    const puntajeMinimo = evaluacion.puntaje_minimo || null;
    const maxIntentos = evaluacion.max_intentos || null;

    // Descripción arriba del grid
    let infoLines = '';
    if (descripcion) {
        infoLines += `<p class="eval-info-line eval-desc">${descripcion}</p>`;
    }

    // Grid de estadísticas con tarjetas visuales
    let statsCards = '';
    if (tiempoLimite) {
        statsCards += `
            <div class="eval-stat-card">
                <span class="eval-stat-icon"><i class="fa-regular fa-clock"></i></span>
                <span class="eval-stat-label">Duración</span>
                <span class="eval-stat-value">${tiempoLimite} min</span>
            </div>`;
    }
    if (numeroPreguntas) {
        statsCards += `
            <div class="eval-stat-card">
                <span class="eval-stat-icon"><i class="fa-regular fa-circle-question"></i></span>
                <span class="eval-stat-label">Preguntas</span>
                <span class="eval-stat-value">${numeroPreguntas}</span>
            </div>`;
    }
    if (puntajeMinimo) {
        statsCards += `
            <div class="eval-stat-card">
                <span class="eval-stat-icon"><i class="fa-solid fa-star"></i></span>
                <span class="eval-stat-label">Puntaje mínimo</span>
                <span class="eval-stat-value">${puntajeMinimo}%</span>
            </div>`;
    }
    if (maxIntentos) {
        const disponibles = intentosDisponibles !== undefined ? intentosDisponibles : maxIntentos;
        statsCards += `
            <div class="eval-stat-card">
                <span class="eval-stat-icon"><i class="fa-solid fa-rotate-right"></i></span>
                <span class="eval-stat-label">Intentos</span>
                <span class="eval-stat-value">${disponibles} / ${maxIntentos}</span>
            </div>`;
    }

    if (statsCards) {
        infoLines += `<div class="eval-stats-grid">${statsCards}</div>`;
    }

    infoLines += `
        <div class="eval-nota-banner">
            <i class="fa-solid fa-circle-info"></i>
            <span>Al finalizar, obtendrás tu puntaje automáticamente.</span>
        </div>`;

    // Badge estado
    let badgeHTML = '';
    if (evaluacionAprobada) {
        badgeHTML = `<div class="eval-badge eval-badge--aprobado">✓ ¡Ya aprobaste esta evaluación con ${mejorPorcentaje}%!</div>`;
    } else if (intentosCompletados > 0) {
        badgeHTML = `<div class="eval-badge eval-badge--intento">Mejor puntaje hasta ahora: <strong>${mejorPorcentaje}%</strong></div>`;
    }

    // Botón
    let botonHTML = '';
    if (evaluacionAprobada) {
        botonHTML = `<button class="btn-realizar-evaluacion btn-realizar-evaluacion--aprobado" id="btn-iniciar-evaluacion" disabled>✓ Evaluación aprobada</button>`;
    } else if (!puedeIntentar) {
        botonHTML = `<button class="btn-realizar-evaluacion btn-realizar-evaluacion--bloqueado" id="btn-iniciar-evaluacion" disabled>🔒 ${mensajeBloqueo || 'No puedes intentar ahora'}</button>`;
    } else if (estadoUsuario.tiene_intento_en_progreso) {
        botonHTML = `<button class="btn-realizar-evaluacion" id="btn-iniciar-evaluacion">Continuar evaluación</button>`;
    } else {
        botonHTML = `<button class="btn-realizar-evaluacion" id="btn-iniciar-evaluacion">Realizar evaluación</button>`;
    }

    return `
        <div class="evaluacion-vista">
            <div class="evaluacion-header">
                <h2 class="evaluacion-titulo">${titulo}</h2>
            </div>
            <div class="evaluacion-body">
                <div class="evaluacion-info">
                    ${infoLines}
                    ${badgeHTML}
                </div>
                <div class="evaluacion-mascota" style="margin-left: 48px;">
                    <img src="${mascotaUrl}" alt="Mascota evaluación" class="eval-mascota-img">
                </div>
            </div>
            <div class="eval-boton-wrap">
                ${botonHTML}
            </div>
        </div>`;
}

window.iniciarEvaluacion = async function (evaluacionId) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    if (!moduloActual?.id) {
        mostrarMensajeBloqueado('No se pudo identificar el módulo');
        return;
    }

    mostrarSpinner(true);
    try {
        const response = await fetch(`${apiUrl}/modulos/${moduloActual.id}/evaluacion/iniciar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const json = await response.json();

        if (response.ok && json.success) {
            console.log('Evaluación iniciada:', json.data);
            mostrarMensajeExito('Evaluación iniciada correctamente');
            // TODO: renderizar preguntas con json.data.preguntas
        } else {
            const msg = json.message || 'No se pudo iniciar la evaluación';
            mostrarMensajeBloqueado(msg);
        }
    } catch (error) {
        console.error('Error iniciando evaluación:', error);
        mostrarMensajeBloqueado('Error de conexión al intentar iniciar la evaluación');
    } finally {
        mostrarSpinner(false);
    }
};


function mostrarIntroduccion() {
    const introduccionContent = document.getElementById('introduccionContent');
    const leccionContent = document.getElementById('leccionContent');

    // Mostrar el botón "Siguiente" al volver a la introducción
    const btnNext = document.getElementById('btnNext');
    if (btnNext) btnNext.style.display = '';

    // Solo mostrar/ocultar — NO tocar el contenido interno que ya está bien renderizado
    if (introduccionContent) {
        introduccionContent.style.display = 'block';
    }
    if (leccionContent) {
        leccionContent.style.display = 'none';
    }
}

// ===============================
// UTILIDADES
// ===============================

function actualizarTituloModulo(modulo) {
    const moduleTitleElements = [
        document.getElementById('moduleTitle'),
        document.getElementById('moduleTitleMobile')
    ];

    const nombreCorto = modulo.modulo ? modulo.modulo.toUpperCase() : modulo.titulo.toUpperCase();

    moduleTitleElements.forEach(el => {
        if (el) el.textContent = nombreCorto;
    });

    document.title = `${modulo.titulo} - Varchate`;
}

function actualizarProgreso(porcentaje) {
    const progressPercentElements = [
        document.getElementById('progressPercent'),
        document.getElementById('progressPercentMobile')
    ];

    const progressFillElements = [
        document.getElementById('progressFill'),
        document.getElementById('progressFillMobile')
    ];

    progressPercentElements.forEach(el => {
        if (el) el.textContent = `${Math.round(porcentaje)}%`;
    });

    progressFillElements.forEach(el => {
        if (el) {
            el.style.width = `${porcentaje}%`;
            setTimeout(() => checkTextColorOverlap(el), 100);
        }
    });
}

function checkTextColorOverlap(progressFill) {
    if (!progressFill) return;

    const card = progressFill.closest('.progress-container, .progress-container-mobile');
    if (!card) return;

    const texto = card.querySelector('.progress-text');
    const percent = card.querySelector('.progress-percent');
    const barraRect = progressFill.getBoundingClientRect();

    if (texto) {
        const textoRect = texto.getBoundingClientRect();
        const textoOverlap = barraRect.right >= textoRect.left + (textoRect.width / 2);
        texto.style.color = textoOverlap ? "#fff" : "#000";
    }

    if (percent) {
        const percentRect = percent.getBoundingClientRect();
        const percentOverlap = barraRect.right >= percentRect.left + (percentRect.width / 2);
        percent.style.color = percentOverlap ? "#fff" : "#000";
    }
}

function mostrarSpinner(mostrar) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = mostrar ? 'block' : 'none';
    }
}

function mostrarBienvenidaModulos() {
    const contentSection = document.getElementById('contentSection');
    const nombre = localStorage.getItem('user_nombre') || 'Usuario';
    if (contentSection) {
        contentSection.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 40px;
                text-align: center;
                height: 100%;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">👋</div>
                <h2 style="
                    font-size: 28px;
                    font-weight: 700;
                    color: #1a1a2e;
                    margin-bottom: 12px;
                ">¡Hola, ${nombre}!</h2>
                <p style="
                    font-size: 18px;
                    color: #555;
                    margin-bottom: 8px;
                ">Bienvenido a Varchate.</p>
                <p style="
                    font-size: 16px;
                    color: #888;
                    max-width: 400px;
                    line-height: 1.6;
                ">Elige un módulo del menú para empezar a aprender.</p>
            </div>
        `;
    }
}

function mostrarErrorModulo() {
    mostrarBienvenidaModulos();
}

// ===============================
// FUNCIONALIDADES EXISTENTES
// ===============================

function inicializarFuncionalidades() {
    configurarProgreso();
    configurarHamburguesa();
    configurarMenusUsuario();
    configurarLogout();
    configurarBotonesModulos();
    manejarNavegacion();
    configurarBotonSiguiente();
}

function configurarProgreso() {
    const progressFills = document.querySelectorAll('.progress-fill');
    progressFills.forEach(fill => {
        const checkOverlap = () => {
            checkTextColorOverlap(fill);
            requestAnimationFrame(checkOverlap);
        };
        requestAnimationFrame(checkOverlap);
    });
}

function configurarHamburguesa() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (hamburgerBtn && sidebar && overlay) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
}

function configurarMenusUsuario() {
    // Menú desktop
    const profilePic = document.getElementById('profile-pic');
    const userMenu = document.getElementById('user-menu');

    if (profilePic && userMenu) {
        function toggleMenu() {
            const isOpen = userMenu.classList.toggle('show');
            profilePic.setAttribute('aria-expanded', isOpen);
            if (isOpen) {
                const firstItem = userMenu.querySelector('.menu-item');
                if (firstItem) firstItem.focus();
            }
        }

        profilePic.addEventListener('click', toggleMenu);

        profilePic.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        document.addEventListener('click', (e) => {
            if (!profilePic.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.remove('show');
                profilePic.setAttribute('aria-expanded', false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && userMenu.classList.contains('show')) {
                userMenu.classList.remove('show');
                profilePic.setAttribute('aria-expanded', false);
                profilePic.focus();
            }
        });

        userMenu.addEventListener('keydown', (e) => {
            const tag = e.target.tagName.toLowerCase();
            if ((e.key === 'Enter' || e.key === ' ') && tag === 'button') {
                e.preventDefault();
                e.target.click();
            }
        });
    }

    // Menú móvil
    const profilePicMobile = document.getElementById("profile-pic-mobile");
    const userMenuMobile = document.getElementById("user-menu-mobile");

    if (profilePicMobile && userMenuMobile) {
        profilePicMobile.addEventListener("click", (e) => {
            e.stopPropagation();
            userMenuMobile.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!profilePicMobile.contains(e.target) && !userMenuMobile.contains(e.target)) {
                userMenuMobile.classList.remove("show");
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        const el = document.activeElement;
        if (!el) return;

        const tag = el.tagName.toLowerCase();
        if ((e.key === 'Enter' || e.key === ' ') && tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
            e.preventDefault();
            el.click();
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (e.target.matches('.menu-item, #profile-pic, button, a')) {
            e.target.blur();
        }
    });
}

function configurarLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', cerrarSesion);
    }

    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', cerrarSesion);
    }
}

async function cerrarSesion(e) {
    e.preventDefault();

    const token = localStorage.getItem('auth_token');
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

    // Obtener URLs desde data-attributes (soporta subdirectorios)
    const mainEl = document.querySelector('main[data-clear-session-url]');
    const clearSessionUrl = mainEl?.dataset.clearSessionUrl || '/api/clear-session-token';
    const loginUrl = mainEl?.dataset.loginUrl || '/login';

    try {
        await fetch(`${apiUrl}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error en logout:', error);
    } finally {
        // Limpiar localStorage (no eliminar user_avatar para mantener avatar persistente)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_nombre');
        localStorage.removeItem('user_apellido');
        localStorage.removeItem('user_email');

        // Limpiar sesión en el servidor
        try {
            await fetch(clearSessionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
        } catch (error) {
            console.error('Error limpiando sesión:', error);
        }

        // Redirigir al login
        window.location.href = loginUrl;
    }
}


function configurarBotonSiguiente() {
    const btnNext = document.getElementById('btnNext');
    if (!btnNext) return;

    btnNext.addEventListener('click', async () => {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
        const token = localStorage.getItem('auth_token');

        // Deshabilitar botón mientras procesa
        btnNext.disabled = true;
        const textoOriginal = btnNext.textContent;
        btnNext.textContent = 'Cargando...';

        try {
            if (leccionActualIndex === -1) {
                // ===== DESDE INTRODUCCIÓN: ir a Lección 1 =====
                const lecciones = window.leccionesOrdenadas;
                if (!lecciones || lecciones.length === 0) {
                    mostrarMensajeBloqueado('No hay lecciones disponibles en este módulo');
                    return;
                }

                // Marcar introducción como vista en la API (si el backend lo soporta)
                // Algunos backends usan lección index 0 para la intro
                // Avanzamos a la lección 1
                leccionActualIndex = 0;
                const primeraLeccion = lecciones[0];

                // Verificar si la primera lección ya estaba completada
                const primeraYaCompletada = (progresoModulo?.lecciones_vistas || 0) > 0;
                await marcarLeccionVista(moduloActual.id, primeraLeccion.id, true, !primeraYaCompletada);

                // Cargar la primera lección
                await cargarLeccion(moduloActual.slug, primeraLeccion.slug);

                // Actualizar sidebar: activar botón de Lección 1
                actualizarSidebarActivo(0);

            } else {
                // ===== DESDE UNA LECCIÓN: marcar como vista e ir a la siguiente =====
                const lecciones = window.leccionesOrdenadas;
                const leccionActual = lecciones[leccionActualIndex];

                if (leccionActual) {
                    // Verificar si ya estaba completada ANTES de llamar a la API
                    const yaCompletada = leccionActualIndex < (progresoModulo?.lecciones_vistas || 0);
                    await marcarLeccionVista(moduloActual.id, leccionActual.id, true, !yaCompletada);
                }

                const siguienteIndex = leccionActualIndex + 1;

                if (siguienteIndex < lecciones.length) {
                    // Hay una lección siguiente
                    leccionActualIndex = siguienteIndex;
                    const siguienteLeccion = lecciones[siguienteIndex];

                    await cargarLeccion(moduloActual.slug, siguienteLeccion.slug);
                    actualizarSidebarActivo(siguienteIndex);

                } else {
                    // Última lección completada → ir a Evaluación
                    leccionActualIndex = lecciones.length; // índice "evaluación"
                    await cargarEvaluacion(moduloActual.id);
                    actualizarSidebarActivoEvaluacion();

                    // Cambiar texto del botón
                    btnNext.textContent = 'Ir a Evaluación';
                    btnNext.disabled = false;
                    return;
                }
            }

            // Scroll al inicio del contenido
            document.getElementById('contentSection')?.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error en botón Siguiente:', error);
        } finally {
            btnNext.disabled = false;
            btnNext.textContent = textoOriginal;
        }
    });
}

function actualizarSidebarActivo(leccionIndex) {
    document.querySelectorAll('.sidebar button').forEach(btn => {
        btn.classList.remove('active');

        if (parseInt(btn.dataset.leccionIndex) === leccionIndex) {
            // Este botón es el que se activa ahora
            btn.classList.add('active');
            btn.classList.remove('locked');

            // Eliminar el ícono de candado del HTML del botón
            const lockIcon = btn.querySelector('.icon-lock');
            if (lockIcon) lockIcon.remove();
        }
        // NO pre-desbloquear la siguiente lección — se desbloquea cuando el usuario
        // llegue a ella presionando "Siguiente" desde la lección actual
    });
}

function actualizarSidebarActivoEvaluacion() {
    document.querySelectorAll('.sidebar button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tipo === 'evaluacion') {
            btn.classList.add('active');
            btn.classList.remove('locked');
        }
    });
}

function configurarBotonesModulos() {
    function centrarBotonActivo() {
        const botonActivo = document.querySelector('.top-buttons button.active');
        if (botonActivo) {
            botonActivo.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    window.addEventListener('load', centrarBotonActivo);
    window.addEventListener('resize', centrarBotonActivo);
}

function manejarNavegacion() {
    let navegacionManual = false;

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
            navegacionManual = true;
        }
    });

    window.addEventListener('popstate', function (event) {
        const token = localStorage.getItem('auth_token');
        const currentPath = window.location.pathname;

        if (token) {
            if (!navegacionManual) {
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            }
            navegacionManual = false;
            return;
        }

        const publicRoutes = ['/login', '/register', '/recuperar', '/nueva_contrasena', '/enlace'];
        if (!publicRoutes.includes(currentPath) && !token) {
            redirigirALogin();
        }
    });

    if (!sessionStorage.getItem('historial_inicializado')) {
        history.replaceState({ page: 'current' }, '', window.location.href);
        sessionStorage.setItem('historial_inicializado', 'true');
    }
}

// ===============================
// INTERCEPTOR DE FETCH GLOBAL
// ===============================

(function () {
    const originalFetch = window.fetch;
    let redirigiendo = false;

    // Rutas locales de Laravel que NO deben recibir el Bearer token
    const rutasLocales = ['/api/set-session-token', '/api/clear-session-token'];

    window.fetch = async function (url, options = {}) {
        const urlString = url.toString();
        const esRutaLocal = rutasLocales.some(r => urlString.includes(r));

        if (!esRutaLocal && (urlString.includes('localhost:8001') || urlString.includes('/api/'))) {
            const token = localStorage.getItem('auth_token');

            if (token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                };
            }

            try {
                const response = await originalFetch(url, options);

                if (response.status === 401 && !redirigiendo) {
                    const peticionesCriticas = ['/me', '/logout'];
                    const esCritica = peticionesCriticas.some(p => urlString.includes(p));

                    if (esCritica) {
                        redirigiendo = true;
                        mostrarMensajeSesionExpirada();
                        // redirigirALogin() es async y limpia sesión Laravel automáticamente
                        redirigirALogin('?expired=true');
                    }
                }

                return response;
            } catch (error) {
                console.error('Error en fetch:', error);
                throw error;
            }
        }

        return originalFetch(url, options);
    };
})();


function iniciarVerificacionPeriodica() {
    setInterval(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            verificarTokenEnSegundoPlano(token);
        }
    }, 5 * 60 * 1000);
}

iniciarVerificacionPeriodica();