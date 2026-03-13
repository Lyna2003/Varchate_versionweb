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
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';

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
                const avatarsBase = document.querySelector('main.container')?.dataset.avatarsUrl || '/avatars';

                let avatarUrl;
                if (avatarId) {
                    const num = parseInt(avatarId);
                    const filename = isNaN(num)
                        ? 'default.png'
                        : `avatar_${String(num).padStart(2, '0')}.png`;
                    avatarUrl = `${avatarsBase}/${filename}`;
                } else {
                    // Sin avatar (null) → usar default
                    avatarUrl = `${avatarsBase}/default.png`;
                }

                // Siempre actualizar localStorage con el valor correcto (incluso si es default)
                localStorage.setItem('user_avatar', avatarUrl);
                if (userData.id) {
                    localStorage.setItem(`user_avatar_for_${userData.id}`, avatarUrl);
                }

                // Actualizar el DOM directamente
                showProfilePic(document.getElementById('profile-pic'), avatarUrl);
                showProfilePic(document.getElementById('profile-pic-mobile'), avatarUrl);

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
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    mostrarSpinner(true);

    try {
        // 1. Cargar todos los módulos para los botones superiores SOLO si no se han cargado
        if (modulosGlobal.length === 0) {
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
        } else {
            // Si ya están cargados, solo actualizamos el botón activo visualmente
            const currentSlug = moduleSlug || obtenerSlugDeURL();
            const container = document.getElementById('topButtonsContainer');
            if (container) {
                container.querySelectorAll('button').forEach(btn => {
                    if (btn.dataset.moduloSlug === currentSlug) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
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

            // --- Resetear vista general antes de cargar nuevo contenido ---
            leccionActualIndex = -1;
            document.getElementById('ejerciciosSeccion')?.remove();
            document.getElementById('bienvenidaContent')?.remove();

            const introduccionContent = document.getElementById('introduccionContent');
            const leccionContent = document.getElementById('leccionContent');
            const btnNext = document.getElementById('btnNext');

            if (leccionContent) {
                leccionContent.innerHTML = ''; // Limpiar lección anterior
            }
            // ----------------------------------------------------------------

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
    // Asegurar que el contenedor de introducción sea el visible
    mostrarIntroduccion();
}

async function cargarLeccionesModulo(moduloId, moduleSlug) {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
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
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
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
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
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
            // Actualizar estado visual inmediatamente
            container.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const baseUrl = document.querySelector('main.container')?.dataset.moduloBaseUrl || '/modulo';
            const newUrl = `${baseUrl}/${modulo.slug}`;

            // Usar pushState para cambiar la URL sin recargar la página
            window.history.pushState({ moduleSlug: modulo.slug }, '', newUrl);

            // Cargar los datos del nuevo módulo
            cargarDatosModulo(modulo.slug);
        });

        container.appendChild(button);
    });
}

// Escuchar el evento popstate para manejar los botones Atrás/Adelante del navegador
window.addEventListener('popstate', (event) => {
    // Si hay un estado guardado, o podemos extraer el slug de la URL, lo cargamos
    const slug = event.state?.moduleSlug || obtenerSlugDeURL();
    console.log('Navegación popstate a:', slug);
    cargarDatosModulo(slug);
});

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

    // Botón CERTIFICADOS: sólo disponible si la evaluación fue aprobada
    const certificadoDesbloqueado = evaluacionAprobadaSidebar;
    const claseCertificado = certificadoDesbloqueado ? '' : 'locked';
    sidebarHTML += `
        <button class="${claseCertificado}" data-tipo="certificado" data-modulo-id="${moduloActual?.id || 1}">
            CERTIFICADOS ${!certificadoDesbloqueado ? `<img src="${document.querySelector('main.container')?.dataset.lockUrl || '/images/Lock.svg'}" alt="Bloqueado" class="icon-lock">` : ''}
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

    // Agregar certificado (SOLO VISUAL)
    lessonsHTML += `
            <div class="lesson certificado ${evaluacionAprobada ? 'completed' : 'locked-lesson'}" 
                data-tipo="certificado" 
                data-modulo-id="${moduloActual?.id || 1}">
                <i class="fa-solid fa-certificate"></i>
                <div>
                    <strong>Certificado del Módulo</strong>
                    <p>${evaluacionAprobada ? 'Descarga tu certificado de finalización' : 'Aprueba la evaluación para obtener tu certificado'}</p>
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
                } else if (tipo === 'certificado') {
                    mostrarMensajeBloqueado('Aprueba la evaluación para obtener tu certificado');
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
                document.getElementById('ejerciciosSeccion')?.remove();
                mostrarIntroduccion();
            } else if (tipo === 'evaluacion') {
                console.log('Cargando evaluación');
                leccionActualIndex = window.leccionesOrdenadas?.length ?? 0; // Sincronizar estado
                document.getElementById('ejerciciosSeccion')?.remove();
                cargarEvaluacion(btn.dataset.evaluacionId);
            } else if (tipo === 'certificado') {
                console.log('Mostrando certificado');
                document.getElementById('ejerciciosSeccion')?.remove();
                cargarCertificado(btn.dataset.moduloId);
            } else if (leccionSlug && moduloActual) {
                console.log('Cargando lección:', leccionSlug);
                leccionActualIndex = leccionIndex; // Sincronizar estado
                cargarLeccion(moduloActual.slug, leccionSlug);
            }
        });
    });

    // Auto-navegar a la evaluación o lección específica si viene en la URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('seccion') === 'evaluacion') {
        const evalBtn = document.querySelector('.sidebar button[data-tipo="evaluacion"]');
        if (evalBtn && !evalBtn.classList.contains('locked')) {
            // Eliminar parámetro de URL inmediatamente para no afectar recargas futuras
            window.history.replaceState({}, document.title, window.location.pathname);

            // Simular click después de un pequeño retraso para asegurar que el DOM esté listo
            setTimeout(() => evalBtn.click(), 100);
        }
    }
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

        /* Botón de EVALUACIÓN BLOQUEADO - restaurar gris */
        .sidebar button[data-tipo="evaluacion"].locked {
            background-color: #8C8C8C72 !important;
            color: #616461 !important;
            cursor: not-allowed !important;
        }

        /* Botón de CERTIFICADOS (estilo base) */
        .sidebar button[data-tipo="certificado"] {
            background-color: #FFFFFF;
            color: #616461;
        }

        /* Botón de CERTIFICADOS BLOQUEADO - restaurar gris */
        .sidebar button[data-tipo="certificado"].locked {
            background-color: #8C8C8C72 !important;
            color: #616461 !important;
            cursor: not-allowed !important;
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

        /* Botón de CERTIFICADOS ACTIVO */
        .sidebar button[data-tipo="certificado"].active {
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
      
        .lessons .lesson.evaluation.locked,
        .lessons .lesson.certificado.locked-lesson {
            opacity: 0.6;
            background-color: #f5f5f5;
        }

        /* Card de certificado desbloqueado */
        .lessons .lesson.certificado.completed {
            background-color: #fffbea;
            border-color: #C9A227;
        }
        .lessons .lesson.certificado .fa-certificate {
            color: #C9A227;
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
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    mostrarSpinner(true);
    // Limpiar sección de ejercicios previa (puede ser de otra lección)
    document.getElementById('ejerciciosSeccion')?.remove();


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

            // ===== EJERCICIOS: cargar y mostrar si la lección tiene =====
            if (moduloActual && moduloActual.id) {
                await cargarEjerciciosLeccion(moduloActual.id, leccion.id);
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

// ===============================
// EJERCICIOS INTERACTIVOS EN LECCIÓN
// ===============================

async function cargarEjerciciosLeccion(moduloId, leccionId) {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    try {
        const url = `${apiUrl}/modulos/${moduloId}/lecciones/${leccionId}/ejercicios`;
        console.log('🔍 Cargando ejercicios desde:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn('⚠️ Ejercicios HTTP error:', response.status);
            return;
        }

        const json = await response.json();
        console.log('📦 Respuesta ejercicios completa:', JSON.stringify(json));
        const data = json?.data;

        if (!data?.tiene_ejercicios || !data?.ejercicios?.length) {
            console.log('ℹ️ Esta lección no tiene ejercicios');
            return;
        }

        console.log(`✅ ${data.ejercicios.length} ejercicio(s) encontrado(s):`, data.ejercicios);
        renderizarEjerciciosLeccion(data.ejercicios, moduloId, leccionId);

    } catch (err) {
        console.warn('No se pudieron cargar ejercicios:', err);
    }
}

// Escapa texto para inserción segura en innerHTML
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderizarEjerciciosLeccion(ejercicios, moduloId, leccionId) {
    // Inyectamos en contentSection (FUERA de leccionContent) para evitar
    // que los <style> del HTML de la lección sobreescriban nuestros estilos
    const contentSection = document.getElementById('contentSection');
    if (!contentSection) return;

    // Eliminar sección previa si existe (al navegar entre lecciones)
    document.getElementById('ejerciciosSeccion')?.remove();

    // Estado por ejercicio: { respondido, correcto, seleccion, parejas }
    const estados = ejercicios.map(() => ({
        respondido: false,
        correcto: null,
        feedback: '',
        opcionCorrecta: null,
        seleccionId: null,
        parejas: []
    }));

    let indexActual = 0;

    // Sección principal
    const seccion = document.createElement('div');
    seccion.className = 'ejercicios-leccion-seccion';
    seccion.id = 'ejerciciosSeccion';

    // Insertar antes del btn-container (botón "Siguiente" de la lección)
    const btnContainer = contentSection.querySelector('.btn-container');
    if (btnContainer) {
        contentSection.insertBefore(seccion, btnContainer);
    } else {
        contentSection.appendChild(seccion);
    }


    function buildOpcionesHTML(ej) {
        const opciones = Array.isArray(ej.opciones) ? ej.opciones : [];
        console.log(`🧩 buildOpcionesHTML tipo=${ej.tipo} opciones=${opciones.length}`, opciones);

        if (ej.tipo === 'seleccion_multiple' || ej.tipo === 'verdadero_falso') {
            if (!opciones.length) return '<p style="color:#e57373;font-size:13px;">⚠️ Sin opciones cargadas</p>';
            return `<div class="ejercicio-opciones">
                ${opciones.map(op => `
                    <button class="ejercicio-opcion" data-opcion-id="${op.id}">${escapeHTML(op.texto)}</button>
                `).join('')}
            </div>`;
        } else if (ej.tipo === 'arrastrar_soltar') {
            if (!opciones.length) return '<p style="color:#e57373;font-size:13px;">⚠️ Sin opciones cargadas</p>';
            const destinos = [...new Set(opciones.map(op => op.pareja_arrastre))];
            return `
                <div class="drag-drop-container">
                    <div class="drag-items-col">
                        <p class="drag-col-label">Elementos</p>
                        ${opciones.map(op => `
                            <div class="drag-item" draggable="true" data-opcion-id="${op.id}">${escapeHTML(op.texto)}</div>
                        `).join('')}
                    </div>
                    <div class="drag-destinos-col">
                        <p class="drag-col-label">Definiciones</p>
                        ${destinos.map(dest => `
                            <div class="drag-destino">
                                <span class="drag-destino-label">${escapeHTML(dest)}</span>
                                <div class="drag-zona" data-pareja="${escapeHTML(dest)}">Arrastra aquí</div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        }
        return '';
    }

    function render() {
        const ej = ejercicios[indexActual];
        const est = estados[indexActual];

        const respondido = est.respondido;
        const correcto = est.correcto;

        seccion.innerHTML = `
            <div class="ejercicios-leccion-header">
                <i class="fa-solid fa-pen-to-square"></i>
                <div>
                    <h3 class="ejercicios-leccion-titulo">Ejercicios de práctica</h3>
                    <p class="ejercicios-leccion-subtitulo">Pon a prueba lo que aprendiste en esta lección</p>
                </div>
                <span class="ejercicios-leccion-badge">${indexActual + 1} / ${ejercicios.length}</span>
            </div>

            <div class="ejercicio-card ${respondido ? (correcto ? 'ejercicio-correcto' : 'ejercicio-incorrecto') : ''}">
                <div class="ejercicio-card-header">
                    <span class="ejercicio-num">Ejercicio ${indexActual + 1}</span>
                    <span class="ejercicio-tipo-badge">${getTipoBadge(ej.tipo)}</span>
                </div>
                <p class="ejercicio-instrucciones">${escapeHTML(ej.instrucciones)}</p>
                <p class="ejercicio-pregunta">${escapeHTML(ej.pregunta)}</p>
                ${buildOpcionesHTML(ej)}
                <div class="ejercicio-feedback" id="ejFeedback" style="${respondido ? 'display:block' : 'display:none'}">
                    ${respondido ? (correcto
                ? `✅ ${escapeHTML(est.feedback)}`
                : `❌ ${escapeHTML(est.feedback)}${est.opcionCorrecta?.texto ? ` La respuesta correcta era: <strong>${escapeHTML(est.opcionCorrecta.texto)}</strong>` : ''}`)
                : ''}
                </div>
                ${respondido ? '' : `
                <div class="ejercicio-acciones-check">
                    <button class="ejercicio-btn-comprobar" id="btnComprobar">Comprobar</button>
                </div>`}
                ${(respondido && !correcto) ? `
                <div class="ejercicio-acciones-check">
                    <button class="ejercicio-btn-reintentar" id="btnReintentar">Reintentar</button>
                </div>` : ''}
            </div>

            <div class="ejercicio-nav">
                <button class="ejercicio-btn-nav" id="btnAnterior" ${indexActual === 0 ? 'disabled' : ''}>← Anterior</button>
                <div class="ejercicio-dots">
                    ${ejercicios.map((_, i) => `
                        <span class="ej-dot ${estados[i].respondido ? (estados[i].correcto ? 'dot-correcto' : 'dot-incorrecto') : ''} ${i === indexActual ? 'dot-actual' : ''}"></span>
                    `).join('')}
                </div>
                <button class="ejercicio-btn-nav" id="btnSiguiente" ${indexActual === ejercicios.length - 1 ? 'disabled' : ''}>Siguiente →</button>
            </div>
        `;

        // Restaurar selección previa si ya respondió o había seleccionado
        if (est.seleccionId && (ej.tipo === 'seleccion_multiple' || ej.tipo === 'verdadero_falso')) {
            const prevBtn = seccion.querySelector(`[data-opcion-id="${est.seleccionId}"]`);
            if (prevBtn) {
                prevBtn.classList.add('selected');
                if (respondido) prevBtn.disabled = true;
            }
            if (respondido) {
                seccion.querySelectorAll('.ejercicio-opcion').forEach(b => b.disabled = true);
            }
        }

        // Restaurar drag & drop si ya respondió
        if (respondido && ej.tipo === 'arrastrar_soltar') {
            seccion.querySelectorAll('.drag-item').forEach(i => i.setAttribute('draggable', 'false'));
        }

        // Feedback class
        const feedbackEl = seccion.querySelector('#ejFeedback');
        if (feedbackEl && respondido) {
            feedbackEl.className = `ejercicio-feedback ${correcto ? 'feedback-correcto' : 'feedback-incorrecto'}`;
        }

        // Eventos
        seccion.querySelector('#btnAnterior')?.addEventListener('click', () => {
            if (indexActual > 0) { indexActual--; render(); }
        });

        seccion.querySelector('#btnSiguiente')?.addEventListener('click', () => {
            if (indexActual < ejercicios.length - 1) { indexActual++; render(); }
        });

        // Selección de opciones
        if (!respondido && (ej.tipo === 'seleccion_multiple' || ej.tipo === 'verdadero_falso')) {
            seccion.querySelectorAll('.ejercicio-opcion').forEach(btn => {
                btn.addEventListener('click', () => {
                    seccion.querySelectorAll('.ejercicio-opcion').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    estados[indexActual].seleccionId = parseInt(btn.dataset.opcionId);
                });
            });
        }

        // Drag & Drop
        if (!respondido && ej.tipo === 'arrastrar_soltar') {
            let draggedItem = null;
            seccion.querySelectorAll('.drag-item').forEach(item => {
                item.addEventListener('dragstart', () => { draggedItem = item; item.classList.add('dragging'); });
                item.addEventListener('dragend', () => { item.classList.remove('dragging'); });
            });
            seccion.querySelectorAll('.drag-zona').forEach(zona => {
                zona.addEventListener('dragover', e => { e.preventDefault(); zona.classList.add('drag-over'); });
                zona.addEventListener('dragleave', () => zona.classList.remove('drag-over'));
                zona.addEventListener('drop', e => {
                    e.preventDefault();
                    zona.classList.remove('drag-over');
                    if (draggedItem) {
                        const existing = zona.querySelector('.drag-item');
                        if (existing) seccion.querySelector('.drag-items-col').appendChild(existing);
                        zona.appendChild(draggedItem);
                        draggedItem = null;
                    }
                });
            });
        }

        // Comprobar
        const btnComprobar = seccion.querySelector('#btnComprobar');
        if (btnComprobar) {
            btnComprobar.addEventListener('click', async () => {
                const mainEl = document.querySelector('main.container');
                const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
                const token = localStorage.getItem('auth_token');
                const est = estados[indexActual];
                let body = {};

                if (ej.tipo === 'seleccion_multiple' || ej.tipo === 'verdadero_falso') {
                    const selected = seccion.querySelector('.ejercicio-opcion.selected');
                    if (!selected) {
                        const fb = seccion.querySelector('#ejFeedback');
                        fb.style.display = 'block';
                        fb.className = 'ejercicio-feedback feedback-warning';
                        fb.textContent = '⚠️ Selecciona una opción antes de comprobar';
                        return;
                    }
                    body = { opcion_id: parseInt(selected.dataset.opcionId) };
                } else if (ej.tipo === 'arrastrar_soltar') {
                    const parejas = [];
                    seccion.querySelectorAll('.drag-zona').forEach(zona => {
                        const item = zona.querySelector('.drag-item');
                        if (item) parejas.push({ id_opcion: parseInt(item.dataset.opcionId), pareja: zona.dataset.pareja });
                    });
                    if (!parejas.length) {
                        const fb = seccion.querySelector('#ejFeedback');
                        fb.style.display = 'block';
                        fb.className = 'ejercicio-feedback feedback-warning';
                        fb.textContent = '⚠️ Arrastra los elementos antes de comprobar';
                        return;
                    }
                    body = { parejas };
                }

                btnComprobar.disabled = true;
                btnComprobar.textContent = 'Comprobando...';

                try {
                    const resp = await fetch(`${apiUrl}/modulos/${moduloId}/lecciones/${leccionId}/ejercicios/${ej.id}/intento`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    const result = await resp.json();
                    est.respondido = true;
                    est.correcto = result?.data?.es_correcta;
                    est.feedback = result?.data?.feedback || '';
                    est.opcionCorrecta = result?.data?.opcion_correcta || null;
                    render();
                } catch {
                    btnComprobar.disabled = false;
                    btnComprobar.textContent = 'Comprobar';
                    const fb = seccion.querySelector('#ejFeedback');
                    fb.style.display = 'block';
                    fb.className = 'ejercicio-feedback feedback-warning';
                    fb.textContent = '⚠️ Error de conexión. Inténtalo de nuevo.';
                }
            });
        }

        // Reintentar
        const btnReintentar = seccion.querySelector('#btnReintentar');
        if (btnReintentar) {
            btnReintentar.addEventListener('click', () => {
                estados[indexActual] = { respondido: false, correcto: null, feedback: '', opcionCorrecta: null, seleccionId: null, parejas: [] };
                render();
            });
        }
    }

    render();
}

function getTipoBadge(tipo) {
    const badges = {
        'seleccion_multiple': '☑ Selección múltiple',
        'verdadero_falso': '✓/✗ Verdadero o Falso',
        'arrastrar_soltar': '⇄ Relacionar'
    };
    return badges[tipo] || tipo;
}

async function marcarLeccionVista(moduloId, leccionId, skipRender = false, mostrarMensaje = true) {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
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
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
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

// ===============================
// CERTIFICADOS
// ===============================

async function cargarCertificado(moduloId) {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    mostrarSpinner(true);

    try {
        const introduccionContent = document.getElementById('introduccionContent');
        const leccionContent = document.getElementById('leccionContent');
        const btnNext = document.getElementById('btnNext');
        if (btnNext) btnNext.style.display = 'none';
        if (introduccionContent) introduccionContent.style.display = 'none';

        // Obtener todas las certificaciones del usuario
        const response = await fetch(`${apiUrl}/certificaciones`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error consultando certificaciones');
        }

        const json = await response.json();
        const certificaciones = json?.data?.certificaciones || [];

        // Buscar certificado del módulo actual
        const cert = certificaciones.find(c => {
            // Comparar por slug del módulo si está disponible
            return moduloActual && (
                c.modulo?.slug === moduloActual.slug ||
                c.modulo?.titulo === moduloActual.titulo
            );
        });

        if (leccionContent) {
            leccionContent.style.display = 'block';
            leccionContent.innerHTML = renderizarPantallaCertificado(cert, moduloId, apiUrl);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Enlazar botón de generar certificado si no existe
            const btnGenerar = leccionContent.querySelector('#btn-generar-certificado');
            if (btnGenerar) {
                btnGenerar.addEventListener('click', async () => {
                    btnGenerar.disabled = true;
                    btnGenerar.textContent = 'Generando...';
                    await generarCertificado(moduloId);
                });
            }

            // Enlazar botón de descargar
            const btnDescargar = leccionContent.querySelector('#btn-descargar-certificado');
            if (btnDescargar && cert) {
                // IMPORTANTE: Remover cualquier onclick anterior
                btnDescargar.removeAttribute('onclick');

                // Agregar nuevo event listener que usa nuestra función
                btnDescargar.addEventListener('click', (e) => {
                    e.preventDefault();
                    descargarCertificado(cert.codigo_certificado);
                });
            }

            // Enlazar botón de ver
            const btnVer = leccionContent.querySelector('#btn-ver-certificado');
            if (btnVer && cert) {
                btnVer.addEventListener('click', (e) => {
                    e.preventDefault();
                    verCertificado(cert.codigo_certificado);
                });
            }
        }

    } catch (error) {
        console.error('Error cargando certificado:', error);
        mostrarMensajeBloqueado('Error al cargar el certificado. Intenta de nuevo.');
    } finally {
        mostrarSpinner(false);
    }
}

function renderizarPantallaCertificado(cert, moduloId, apiUrl) {
    const imagesBase = document.querySelector('main.container')?.dataset.imagesUrl || '/images';
    const moduloTitulo = moduloActual?.modulo.toUpperCase() || 'este módulo';

    if (cert) {
        // Ya tiene certificado
        const fecha = cert.resultados?.fecha_emision || '';
        const porcentaje = cert.resultados?.porcentaje_obtenido || 100;

        return `
            <div class="eval-card" style="max-width:680px; margin:0 auto;">
                <div class="eval-card-header" style="text-align:center; padding: 32px 24px 16px;">
                    <h2 style="font-size: 1.8rem; color: var(--color-text, #1a1a2e); margin-bottom: 8px;">¡Felicitaciones, lo lograste!</h2>
                    <p style="color: #666; font-size: 1.2rem;">Has finalizado el módulo <strong>${moduloTitulo}</strong> con un <strong>${porcentaje}%</strong>.</p>
                    <p style="color: #666; font-size: 1.2rem;">Este certificado valida que completaste el módulo y adquiriste los conocimiento básicos necesarios para continuar tu aprendizaje en programación</p>
                    <p style="color: #666; font-size: 1.2rem;">¡Sigue avanzando y desbloquea nuevos retos!</p>
                    ${fecha ? `<p style="color:#888; font-size:1rem;">Emitido el ${fecha}</p>` : ''}
                    
                    <!-- Imagen del gato centrada -->
                    <div style="display: flex; justify-content: center; margin: 24px 0 8px;">
                        <img src="${imagesBase}/gato-certificados.png" alt="Gato con certificado" style="width: 180px; height: auto; border-radius: 12px;">
                    </div>
                </div>

                <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap; padding: 8px 24px 32px;">
                    <button id="btn-ver-certificado"
                        style="display:flex; align-items:center; gap:10px; padding:14px 28px; background:#0099FF; color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:600; cursor:pointer; transition:background 0.2s;">
                        <i class="fa-regular fa-eye"></i> Ver certificado
                    </button>
                    <button id="btn-descargar-certificado"
                        style="display:flex; align-items:center; gap:10px; padding:14px 28px; background:#C9A227; color:#fff; border:none; border-radius:10px; font-size:1rem; font-weight:600; cursor:pointer; transition:background 0.2s;">
                        <i class="fa-solid fa-download"></i> Descargar PNG
                    </button>
                </div>

                <div style="background:#f0fff0; border:1px solid #4caf50; border-radius:10px; padding:14px 20px; margin:0 24px 24px; display:flex; align-items:center; gap:12px;">
                    <i class="fa-solid fa-circle-check" style="color:#4caf50; font-size:1.4rem;"></i>
                    <span style="color:#2e7d32; font-size:0.95rem;">¡Módulo completado! Tu certificado ha sido emitido con código <strong>${cert.codigo_certificado}</strong>.</span>
                </div>
            </div>
        `;
    } else {
        // No tiene certificado aún, puede generarlo
        return `
            <div class="eval-card" style="max-width:680px; margin:0 auto;">
                <div class="eval-card-header" style="text-align:center; padding: 32px 24px 16px;">
                    <span style="font-size: 80px; display: block; margin-bottom: 16px;">📜</span>
                    <h2 style="font-size: 1.6rem; color: var(--color-text, #1a1a2e); margin-bottom: 8px;">Tu certificado te espera</h2>
                    <p style="color: #666; font-size: 1rem;">Has aprobado la evaluación de <strong>${moduloTitulo}</strong>. ¡Genera tu certificado ahora!</p>
                    
                    <!-- Imagen del gato centrada -->
                    <div style="display: flex; justify-content: center; margin: 24px 0 8px;">
                        <img src="${imagesBase}/gato-certificados.png" alt="Gato con certificado" style="width: 180px; height: auto; border-radius: 12px;">
                    </div>
                </div>

                <div style="display:flex; justify-content:center; padding: 8px 24px 32px;">
                    <button id="btn-generar-certificado"
                        style="display:flex; align-items:center; gap:10px; padding:16px 36px; background:linear-gradient(135deg,#C9A227,#e8c84a); color:#fff; border:none; border-radius:12px; font-size:1.1rem; font-weight:700; cursor:pointer; transition:opacity 0.2s; box-shadow: 0 4px 14px rgba(201,162,39,0.35);">
                        <i class="fa-solid fa-certificate"></i> Generar mi certificado
                    </button>
                </div>

                <div style="background:#fffbea; border:1px solid #C9A227; border-radius:10px; padding:14px 20px; margin:0 24px 24px; display:flex; align-items:center; gap:12px;">
                    <i class="fa-solid fa-circle-info" style="color:#C9A227; font-size:1.4rem;"></i>
                    <span style="color:#7a5c00; font-size:0.95rem;">Una vez generado, podrás ver y descargar tu certificado en formato PNG.</span>
                </div>
            </div>
        `;
    }
}

async function generarCertificado(moduloId) {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    try {
        const response = await fetch(`${apiUrl}/modulos/${moduloId}/certificacion/generar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const json = await response.json();

        if (response.ok && json.success) {
            mostrarMensajeExito('¡Certificado generado exitosamente! 🎓');
            // Recargar la pantalla del certificado
            setTimeout(() => cargarCertificado(moduloId), 1500);
        } else {
            // Si ya existe, recargar para mostrarlo
            if (json.data?.codigo_existente) {
                mostrarMensajeExito('Ya tienes un certificado para este módulo.');
                setTimeout(() => cargarCertificado(moduloId), 1500);
            } else {
                mostrarMensajeBloqueado(json.message || 'No se pudo generar el certificado.');
                const btnGenerar = document.getElementById('btn-generar-certificado');
                if (btnGenerar) { btnGenerar.disabled = false; btnGenerar.innerHTML = '<i class="fa-solid fa-certificate"></i> Generar mi certificado'; }
            }
        }
    } catch (error) {
        console.error('Error generando certificado:', error);
        mostrarMensajeBloqueado('Error de conexión al generar el certificado.');
        const btnGenerar = document.getElementById('btn-generar-certificado');
        if (btnGenerar) { btnGenerar.disabled = false; btnGenerar.innerHTML = '<i class="fa-solid fa-certificate"></i> Generar mi certificado'; }
    }
}


async function descargarCertificado(codigo) {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    if (!token) {
        redirigirALogin();
        return;
    }

    try {
        mostrarSpinner(true);

        const response = await fetch(`${apiUrl}/certificaciones/${codigo}/descargar`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'image/png',
            }
        });

        if (response.status === 401) {
            mostrarMensajeSesionExpirada();
            return;
        }

        if (response.status === 403) {
            mostrarMensajeBloqueado('No tienes permiso para descargar este certificado');
            return;
        }

        if (!response.ok) {
            throw new Error('Error al descargar');
        }

        // Convertir la respuesta a blob
        const blob = await response.blob();

        // Crear URL temporal y descargar
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado-${codigo}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        mostrarMensajeExito('✅ Descarga completada');

    } catch (error) {
        console.error('Error en descarga:', error);
        mostrarMensajeBloqueado('Error al descargar el certificado');
    } finally {
        mostrarSpinner(false);
    }
}


async function verCertificado(codigo) {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    // Abrir en nueva pestaña con fetch no es práctico, 
    // así que usamos una ventana nueva con el token en la URL
    const ventana = window.open('', '_blank');

    try {
        const response = await fetch(`${apiUrl}/certificaciones/${codigo}/ver`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Escribir la imagen en la nueva ventana
        ventana.document.write(`
            <html>
                <head><title>Certificado</title></head>
                <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0;">
                    <img src="${url}" style="max-width:100%; max-height:100vh; object-fit:contain;">
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Error:', error);
        ventana.close();
        mostrarMensajeBloqueado('Error al ver el certificado');
    }
}

function renderizarEvaluacion(json) {
    const imagesBase = document.querySelector('main.container')?.dataset.imagesUrl || '/images';
    const mascotaUrl = `${imagesBase}/gato_evaluacion.png`;

    // Extraer datos del JSON de la API: { success, data: { evaluacion, estado_usuario } }
    const data = json?.data || {};
    const evaluacion = data.evaluacion || {};
    const estadoUsuario = data.estado_usuario || {};

    const evaluacionAprobada = estadoUsuario.ya_aprobo; // Priorizamos lo que diga la API de evaluación directamente
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
    const introduccionContent = document.getElementById('introduccionContent');
    const leccionContent = document.getElementById('leccionContent');
    const btnNext = document.getElementById('btnNext');

    if (introduccionContent) introduccionContent.style.display = 'none';
    if (leccionContent) leccionContent.style.display = 'none';
    if (btnNext) btnNext.style.display = 'none';

    document.getElementById('bienvenidaContent')?.remove();

    const nombre = localStorage.getItem('user_nombre') || 'Usuario';
    if (contentSection) {
        const bienvenidaDiv = document.createElement('div');
        bienvenidaDiv.id = 'bienvenidaContent';
        bienvenidaDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 40px;
            text-align: center;
            height: 100%;
        `;
        bienvenidaDiv.innerHTML = `
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
        `;
        // Insertamos al principio para que quede por encima de los contenedores ocultos
        contentSection.insertBefore(bienvenidaDiv, contentSection.firstChild);
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
    if (window._hamburguesa_btn_ok) return;
    window._hamburguesa_btn_ok = true;

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
    if (window._user_menus_ok) return;
    window._user_menus_ok = true;

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
    if (window._logout_btn_ok) return;
    window._logout_btn_ok = true;

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
    if (!btnNext || btnNext.dataset.listenerAdded) return;

    btnNext.dataset.listenerAdded = 'true';

    btnNext.addEventListener('click', async () => {
        const mainEl = document.querySelector('main.container');
        const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
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

// ===============================
// EVALUACIÓN — iniciar desde tarjeta
// ===============================

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
            console.log('✅ Evaluación iniciada:', json.data);
            abrirModalEvaluacion(json.data);
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

// ===============================
// MODAL DE EVALUACIÓN
// ===============================

// Estado interno del modal
let _evalState = {
    preguntas: [],
    respuestas: {},        // { preguntaId: { opcion_id?, parejas? } }
    comprobadas: {},       // { preguntaId: true/false } → ya comprobó esta pregunta
    indice: 0,
    intentoId: null,
    moduloId: null,
    timerInterval: null,
    segundosRestantes: 0,
    titulo: '',
};

function abrirModalEvaluacion(data) {
    _evalState.preguntas = data.preguntas || [];
    _evalState.intentoId = data.intento_id;
    _evalState.moduloId = data.modulo_id || moduloActual?.id;
    _evalState.segundosRestantes = data.tiempo_limite_segundos || 0;
    _evalState.segundosTotales = data.tiempo_limite_segundos || 0; // guardar total para calcular tiempo usado
    _evalState.titulo = data.titulo || moduloActual?.modulo || 'Evaluación';
    _evalState.respuestas = {};
    _evalState.comprobadas = {};
    _evalState.indice = 0;

    const tituloEl = document.getElementById('eval-modal-titulo');
    if (tituloEl) tituloEl.textContent = _evalState.titulo;

    const overlay = document.getElementById('eval-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    _iniciarTimerModal();
    _renderizarPreguntaModal(0);

    if (!abrirModalEvaluacion._listenersOk) {
        abrirModalEvaluacion._listenersOk = true;
        document.getElementById('eval-modal-cancel-btn')
            ?.addEventListener('click', _cerrarModalEvaluacion);
        document.getElementById('eval-modal-prev-btn')
            ?.addEventListener('click', () => _navigateModal(-1));
        document.getElementById('eval-modal-check-btn')
            ?.addEventListener('click', _comprobarRespuesta);
        document.getElementById('eval-modal-next-btn')
            ?.addEventListener('click', () => _navigateModal(1));
        document.getElementById('eval-modal-finish-btn')
            ?.addEventListener('click', _finalizarEvaluacionModal);
    }
}

function _cerrarModalEvaluacion() {
    clearInterval(_evalState.timerInterval);
    const overlay = document.getElementById('eval-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function _iniciarTimerModal() {
    clearInterval(_evalState.timerInterval);
    const timerEl = document.getElementById('eval-modal-timer');

    function tick() {
        const s = _evalState.segundosRestantes;
        const mm = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        if (timerEl) {
            timerEl.textContent = `${mm}:${ss}`;
            timerEl.classList.toggle('urgente', s <= 60);
        }
        if (s <= 0) {
            clearInterval(_evalState.timerInterval);
            mostrarMensajeBloqueado('¡Tiempo agotado! Enviando respuestas automáticamente...');
            setTimeout(_finalizarEvaluacionModal, 1500);
            return;
        }
        _evalState.segundosRestantes--;
    }

    tick();
    _evalState.timerInterval = setInterval(tick, 1000);
}

function _renderizarPreguntaModal(indice) {
    const preguntas = _evalState.preguntas;
    if (!preguntas.length) return;

    const pregunta = preguntas[indice];
    _evalState.indice = indice;

    const pct = ((indice + 1) / preguntas.length) * 100;
    const progressEl = document.getElementById('eval-modal-progress');
    if (progressEl) progressEl.style.width = `${pct}%`;

    const counterEl = document.getElementById('eval-modal-counter');
    if (counterEl) counterEl.textContent = `Pregunta ${indice + 1} de ${preguntas.length}`;

    const instrEl = document.getElementById('eval-modal-instrucciones');
    if (instrEl) instrEl.textContent = pregunta.instrucciones || '';

    const questionEl = document.getElementById('eval-modal-question');
    if (questionEl) questionEl.textContent = pregunta.pregunta;

    const optionsEl = document.getElementById('eval-modal-options');
    if (!optionsEl) return;
    optionsEl.innerHTML = '';

    const yaComprobada = pregunta.id in _evalState.comprobadas;

    if (pregunta.tipo === 'seleccion_multiple' || pregunta.tipo === 'verdadero_falso') {
        _renderOpcionesMultiple(optionsEl, pregunta, yaComprobada);
    } else if (pregunta.tipo === 'arrastrar_soltar') {
        _renderDragAndDrop(optionsEl, pregunta, yaComprobada);
    }

    const prevBtn = document.getElementById('eval-modal-prev-btn');
    const checkBtn = document.getElementById('eval-modal-check-btn');
    const nextBtn = document.getElementById('eval-modal-next-btn');
    const finishBtn = document.getElementById('eval-modal-finish-btn');
    const esUltima = indice === preguntas.length - 1;

    if (prevBtn) prevBtn.disabled = (indice === 0);
    if (checkBtn) { checkBtn.style.display = yaComprobada ? 'none' : ''; }
    if (nextBtn) { nextBtn.style.display = (yaComprobada && !esUltima) ? '' : 'none'; }
    if (finishBtn) { finishBtn.style.display = (yaComprobada && esUltima) ? '' : 'none'; }
}

function _renderOpcionesMultiple(container, pregunta, bloqueada) {
    const respGuardada = _evalState.respuestas[pregunta.id];

    pregunta.opciones.forEach(opcion => {
        const label = document.createElement('label');
        label.className = 'eval-option-label';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `pregunta_${pregunta.id}`;
        radio.value = opcion.id;
        radio.disabled = bloqueada;

        if (respGuardada?.opcion_id === opcion.id) {
            radio.checked = true;
            label.classList.add('selected');
        }

        if (bloqueada && _evalState.comprobadas[pregunta.id] !== undefined) {
            const esCorrecta = _evalState.comprobadas[pregunta.id];
            if (respGuardada?.opcion_id === opcion.id) {
                label.classList.add(esCorrecta ? 'correcta' : 'incorrecta');
            }
        }

        radio.addEventListener('change', () => {
            container.querySelectorAll('.eval-option-label').forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');
            _evalState.respuestas[pregunta.id] = { opcion_id: opcion.id };
        });

        label.appendChild(radio);
        label.appendChild(document.createTextNode(opcion.texto));
        container.appendChild(label);
    });
}

function _renderDragAndDrop(container, pregunta, bloqueada) {
    const opciones = pregunta.opciones;
    const respGuardada = _evalState.respuestas[pregunta.id]?.parejas || {};

    const dragArea = document.createElement('div');
    dragArea.className = 'eval-drag-area';

    const colLeft = document.createElement('div');
    colLeft.className = 'eval-drag-col';
    colLeft.innerHTML = '<h4>Arrastra</h4>';

    const colRight = document.createElement('div');
    colRight.className = 'eval-drag-col';
    colRight.innerHTML = '<h4>Suelta aquí</h4>';

    opciones.forEach(opcion => {
        const chip = document.createElement('div');
        chip.className = 'eval-draggable';
        chip.textContent = opcion.texto;
        chip.draggable = !bloqueada;
        chip.dataset.opcionId = opcion.id;

        chip.addEventListener('dragstart', (e) => {
            chip.classList.add('dragging');
            e.dataTransfer.setData('opcionId', opcion.id);
            e.dataTransfer.setData('opcionTexto', opcion.texto);
        });
        chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
        colLeft.appendChild(chip);

        const zona = document.createElement('div');
        zona.className = 'eval-drop-zone';

        const labelTexto = document.createElement('span');
        labelTexto.className = 'eval-drop-label';
        labelTexto.textContent = opcion.pareja_arrastre || '?';

        const blank = document.createElement('div');
        blank.className = 'eval-blank';
        blank.dataset.pairingTarget = opcion.pareja_arrastre || '';
        blank.dataset.opcionId = opcion.id;

        if (respGuardada[opcion.id]) {
            blank.textContent = respGuardada[opcion.id].texto;
            blank.classList.add('filled');
        }

        if (bloqueada && _evalState.comprobadas[pregunta.id] !== undefined) {
            const esCorrecta = _evalState.comprobadas[pregunta.id];
            blank.classList.add(esCorrecta ? 'correcta' : 'incorrecta');
        }

        if (!bloqueada) {
            blank.addEventListener('dragover', (e) => { e.preventDefault(); blank.classList.add('drag-over'); });
            blank.addEventListener('dragleave', () => blank.classList.remove('drag-over'));
            blank.addEventListener('drop', (e) => {
                e.preventDefault();
                blank.classList.remove('drag-over');
                const id = e.dataTransfer.getData('opcionId');
                const txt = e.dataTransfer.getData('opcionTexto');
                blank.textContent = txt;
                blank.classList.add('filled');

                if (!_evalState.respuestas[pregunta.id]) {
                    _evalState.respuestas[pregunta.id] = { parejas: {} };
                }
                _evalState.respuestas[pregunta.id].parejas[opcion.id] = { id_opcion: id, texto: txt, pareja: opcion.pareja_arrastre };
            });
        }

        zona.appendChild(labelTexto);
        zona.appendChild(blank);
        colRight.appendChild(zona);
    });

    dragArea.appendChild(colLeft);
    dragArea.appendChild(colRight);
    container.appendChild(dragArea);
}

async function _comprobarRespuesta() {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');
    const pregunta = _evalState.preguntas[_evalState.indice];
    const resp = _evalState.respuestas[pregunta.id];

    if (!resp) {
        mostrarMensajeBloqueado('Selecciona una respuesta antes de comprobar');
        return;
    }

    let body = { pregunta_id: pregunta.id };
    if (pregunta.tipo === 'seleccion_multiple' || pregunta.tipo === 'verdadero_falso') {
        if (!resp.opcion_id) { mostrarMensajeBloqueado('Selecciona una opción'); return; }
        body.opcion_id = resp.opcion_id;
    } else if (pregunta.tipo === 'arrastrar_soltar') {
        const parejas = resp.parejas;
        if (!parejas || Object.keys(parejas).length === 0) {
            mostrarMensajeBloqueado('Arrastra todos los elementos a su lugar');
            return;
        }
        body.parejas = Object.values(parejas).map(p => ({ id_opcion: parseInt(p.id_opcion), pareja: p.pareja }));
    }

    try {
        const response = await fetch(
            `${apiUrl}/modulos/${_evalState.moduloId}/evaluacion/${_evalState.intentoId}/respuesta`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        const json = await response.json();
        if (response.ok && json.success) {
            const esCorrecta = json.data.es_correcta;
            _evalState.comprobadas[pregunta.id] = esCorrecta;
            _renderizarPreguntaModal(_evalState.indice);

            const optionsEl = document.getElementById('eval-modal-options');
            if (optionsEl) {
                const fb = document.createElement('div');
                fb.className = `eval-feedback ${esCorrecta ? 'correcto' : 'incorrecto'}`;
                fb.textContent = esCorrecta ? '✅ ¡Correcto!' : '❌ Respuesta incorrecta';
                optionsEl.appendChild(fb);
            }
        } else {
            mostrarMensajeBloqueado(json.message || 'Error al comprobar respuesta');
        }
    } catch (e) {
        console.error('Error comprobando respuesta:', e);
        mostrarMensajeBloqueado('Error de conexión');
    }
}

function _navigateModal(delta) {
    const nuevo = _evalState.indice + delta;
    if (nuevo < 0 || nuevo >= _evalState.preguntas.length) return;
    _renderizarPreguntaModal(nuevo);
}

async function _finalizarEvaluacionModal() {
    const mainEl = document.querySelector('main.container');
    const apiUrl = mainEl?.dataset.apiUrl || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    clearInterval(_evalState.timerInterval);
    mostrarSpinner(true);

    try {
        const response = await fetch(
            `${apiUrl}/modulos/${_evalState.moduloId}/evaluacion/${_evalState.intentoId}/finalizar`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        const json = await response.json();

        if (response.ok && json.success) {
            _mostrarResultadoModal(json.data);
        } else {
            mostrarMensajeBloqueado(json.message || 'Error al finalizar la evaluación');
            _cerrarModalEvaluacion();
        }
    } catch (e) {
        console.error('Error finalizando evaluación:', e);
        mostrarMensajeBloqueado('Error de conexión al finalizar');
        _cerrarModalEvaluacion();
    } finally {
        mostrarSpinner(false);
    }
}

function _mostrarResultadoModal(data) {
    const overlay = document.getElementById('eval-modal-overlay');
    const modal = overlay?.querySelector('.eval-modal');
    if (!modal) return;

    // Guardamos el intentoId en el estado para poder consultarlo en la revisión
    _evalState.intentoIdActual = data.intento_id || _evalState.intentoId;

    const aprobado = data.aprobado;
    const porcentaje = Math.round(data.porcentaje_obtenido || 0);
    const correctas = data.preguntas_correctas || 0;
    const totales = data.preguntas_totales || _evalState.preguntas.length;

    // Calcular tiempo usado
    const segundosUsados = (_evalState.segundosTotales || 0) - (_evalState.segundosRestantes || 0);
    const mm = String(Math.floor(segundosUsados / 60)).padStart(2, '0');
    const ss = String(segundosUsados % 60).padStart(2, '0');
    const tiempoUsado = `${mm}:${ss}`;

    const imagesBase = document.querySelector('main.container')?.dataset.imagesUrl || '/images';
    const mascotaUrl = aprobado ? `${imagesBase}/bien1.png` : `${imagesBase}/error1.png`;
    const moduloNombre = (moduloActual?.modulo || _evalState.titulo || 'Módulo').toUpperCase();

    modal.innerHTML = `
        <div class="eval-result-screen">
            <div class="eval-result-header">
                <img src="${imagesBase}/logo_azul.png" alt="Varchate" class="eval-result-logo" onerror="this.style.display='none'">
            </div>

            <div class="eval-result-body">
                <div class="eval-result-mascota">
                    <img src="${mascotaUrl}" alt="${aprobado ? 'Aprobado' : 'No aprobado'}" class="eval-result-mascota-img">
                </div>

                <div class="eval-result-info">
                    <p class="eval-result-label">Modulo</p>
                    <h2 class="eval-result-modulo">${moduloNombre}</h2>

                    <div class="eval-result-tiempo">
                        <span class="eval-result-tiempo-label">TIEMPO</span>
                        <span class="eval-result-tiempo-valor">${tiempoUsado}</span>
                    </div>

                    <div class="eval-result-score">
                        ${aprobado ? `
                            <p class="eval-result-score-line eval-result-score-title">¡Felicidades!</p>
                            <p class="eval-result-score-line">Has respondido correctamente <strong>${correctas} de ${totales}</strong> preguntas.</p>
                            <p class="eval-result-score-line">Has superado la evaluación con éxito</p>
                        ` : `
                            <p class="eval-result-score-line eval-result-score-title">¡Buen intento!</p>
                            <p class="eval-result-score-line">Has respondido correctamente <strong>${correctas} de ${totales}</strong> preguntas.</p>
                            <p class="eval-result-score-line">Estudia un poco más y vuelve a intentarlo.</p>
                        `}
                    </div>
                </div>
            </div>

            <div class="eval-result-footer">
                <button class="eval-result-btn-secondary" id="eval-ver-respuestas-btn">Ver mis respuestas</button>
                <button class="eval-result-btn-primary" id="eval-close-result-btn">Cerrar</button>
            </div>
        </div>
    `;

    // Estilos optimizados
    if (!document.getElementById('eval-result-styles')) {
        const st = document.createElement('style');
        st.id = 'eval-result-styles';
        st.textContent = `
            .eval-result-screen { display: flex; flex-direction: column; background: #D9EEFF; border-radius: 20px; min-height: 480px; width: 100%; border: 1px solid #cce4f7; box-shadow: 0 10px 40px rgba(0,0,0,0.06); }
            .eval-result-header { padding: 30px 40px 0; }
            .eval-result-logo { height: 45px; }
            .eval-result-body { display: flex; align-items: flex-start; gap: 40px; flex: 1; padding: 20px 50px 20px; }
            .eval-result-mascota-img { width: 280px; height: auto; object-fit: contain; margin-top: 10px; }
            .eval-result-info { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 5px; padding-top: 20px; }
            .eval-result-label { font-size: 15px; color: #555; font-weight: 600; text-transform: capitalize; margin: 0; }
            .eval-result-modulo { font-size: 3.2rem; font-weight: 900; color: #1a1a2e; margin: 0 0 40px 0; line-height: 1; }
            .eval-result-tiempo { margin-bottom: 60px; display: flex; gap: 10px; font-weight: 700; color: #444; font-size: 1.1rem; }
            .eval-result-score { margin-top: auto; display: flex; flex-direction: column; gap: 8px; align-items: center; }
            .eval-result-score-line { font-size: 1.1rem; font-weight: 700; color: #222; margin: 0; line-height: 1.3; }
            .eval-result-score-title { font-size: 1.4rem; font-weight: 900; color: #1a1a2e; margin-bottom: 5px; }
            .eval-result-footer { display: flex; justify-content: space-between; padding: 25px 40px; border-top: 1px solid rgba(0,0,0,0.07); }
            .eval-result-btn-primary, .eval-result-btn-secondary {
                background: #0099FF; color: #fff; border: none; border-radius: 30px; 
                padding: 12px 32px; font-size: 1rem; font-weight: 700; cursor: pointer; 
                transition: all 0.2s;
            }
            .eval-result-btn-primary:hover, .eval-result-btn-secondary:hover { background: #007acc; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,153,255,0.3); }
            .eval-result-btn-primary:active, .eval-result-btn-secondary:active { transform: translateY(0); }
            
            /* Revision Styles */
            .eval-revision-container { display: flex; flex-direction: column; height: 500px; width: 100%; background: #fff; border-radius: 18px; overflow: hidden; }
            .eval-revision-header { padding: 20px; background: #D9EEFF; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cce4f7; }
            .eval-revision-title { font-size: 1.5rem; font-weight: 800; color: #1a1a2e; margin: 0; }
            .eval-revision-list { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
            .eval-revision-item { border-radius: 12px; padding: 15px; border: 1px solid #eee; background: #fdfdfd; }
            .eval-revision-item.correct { border-left: 6px solid #4caf50; background: #f1f9f2; }
            .eval-revision-item.incorrect { border-left: 6px solid #f44336; background: #fff5f5; }
            .eval-revision-question { font-weight: 700; margin-bottom: 8px; color: #333; }
            .eval-revision-user-ans { font-size: 0.95rem; margin-bottom: 4px; }
            .eval-revision-correct-ans { font-size: 0.95rem; font-weight: 600; color: #2e7d32; }
            .eval-revision-back-btn { background: #1a1a2e; color: #fff; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 700; cursor: pointer; }
        `;
        document.head.appendChild(st);
    }

    document.getElementById('eval-close-result-btn')?.addEventListener('click', () => {
        _cerrarModalEvaluacion();
        window.location.href = window.location.pathname + '?seccion=evaluacion';
    });

    document.getElementById('eval-ver-respuestas-btn')?.addEventListener('click', () => {
        _mostrarRevisionRespuestas(_evalState.intentoIdActual, data);
    });
}

async function _mostrarRevisionRespuestas(intentoId, originalData) {
    const overlay = document.getElementById('eval-modal-overlay');
    const modal = overlay?.querySelector('.eval-modal');
    if (!modal) return;

    mostrarSpinner(true);
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');

    try {
        const response = await fetch(`${apiUrl}/modulos/${_evalState.moduloId}/evaluacion/${intentoId}/resultado`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const json = await response.json();

        if (json.success && json.data.respuestas_detalladas) {
            const respuestas = json.data.respuestas_detalladas;

            modal.innerHTML = `
                <div class="eval-revision-container">
                    <div class="eval-revision-header">
                        <h2 class="eval-revision-title">Revisión de respuestas</h2>
                        <button class="eval-revision-back-btn" id="eval-revision-back-btn">Volver</button>
                    </div>
                    <div class="eval-revision-list">
                        ${respuestas.map((r, i) => `
                            <div class="eval-revision-item ${r.respuesta_usuario.es_correcta ? 'correct' : 'incorrect'}">
                                <div class="eval-revision-question">${i + 1}. ${escapeHTML(r.pregunta_texto)}</div>
                                <div class="eval-revision-user-ans">
                                    <strong>Tu respuesta:</strong> ${escapeHTML(r.respuesta_usuario.opcion_texto || r.respuesta_usuario.respuesta_texto || '(Sin respuesta)')}
                                    ${r.respuesta_usuario.es_correcta ? ' ✅' : ' ❌'}
                                </div>
                                ${!r.respuesta_usuario.es_correcta && r.respuesta_correcta ? `
                                    <div class="eval-revision-correct-ans">
                                        <strong>Respuesta correcta:</strong> ${escapeHTML(r.respuesta_correcta.texto)}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            document.getElementById('eval-revision-back-btn')?.addEventListener('click', () => {
                _mostrarResultadoModal(originalData);
            });
        } else {
            mostrarMensajeBloqueado('No se pudieron obtener los detalles de la revisión');
        }
    } catch (e) {
        console.error('Error cargando revisión:', e);
        mostrarMensajeBloqueado('Error al cargar la revisión');
    } finally {
        mostrarSpinner(false);
    }
}