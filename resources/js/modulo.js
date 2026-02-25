// ===============================
// VERIFICACIÓN DE AUTENTICACIÓN
// ===============================

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar token en localStorage
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        redirigirALogin();
        return;
    }
    
    // Obtener el slug del módulo desde la URL
    const moduleSlug = obtenerSlugDeURL();
    console.log('Módulo actual:', moduleSlug);
    
    // Verificar que el token sea válido con la API
    await verificarTokenEnSegundoPlano(token);
    
    // Cargar datos del usuario desde localStorage primero
    cargarDatosUsuario();
    
    // Cargar datos del módulo desde la API
    await cargarDatosModulo(moduleSlug);
});

// Función auxiliar para redirigir a login de manera consistente
function redirigirALogin(params = '') {
    // Construir URL absoluta sin barras dobles
    const baseUrl = window.location.origin;
    const loginUrl = params ? `${baseUrl}/login${params}` : `${baseUrl}/login`;
    window.location.href = loginUrl;
}

function obtenerSlugDeURL() {
    // Ejemplo: /modulo/introduccion-a-html
    const pathParts = window.location.pathname.split('/');
    const slugIndex = pathParts.indexOf('modulo') + 1;
    return slugIndex < pathParts.length ? pathParts[slugIndex] : 'introduccion-a-html';
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
                
                cargarDatosUsuario();
            }
        } else {
            // Token inválido, limpiar y redirigir
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('user_nombre');
            localStorage.removeItem('user_apellido');
            localStorage.removeItem('user_email');
            redirigirALogin('?expired=true');
        }
    } catch (error) {
        console.error('Error verificando token:', error);
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

    // Mostrar avatar si está guardado en localStorage (puede ser filename o URL)
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
        const buildUrl = (val) => {
            if (!val) return null;
            // Si viene con ruta absoluta o ya contiene 'avatars/' usar tal cual
            if (val.startsWith('http') || val.startsWith('/') || val.includes('avatars/')) return val;
            return `/avatars/${val}`;
        };
        const avatarUrl = buildUrl(savedAvatar);
        const profilePic = document.getElementById('profile-pic');
        const profilePicMobile = document.getElementById('profile-pic-mobile');
        if (profilePic && avatarUrl) profilePic.src = avatarUrl;
        if (profilePicMobile && avatarUrl) profilePicMobile.src = avatarUrl;
    }
}

// ===============================
// CARGA DE DATOS DESDE LA API
// ===============================

let modulosGlobal = [];
let moduloActual = null;
let leccionesModulo = [];
let progresoModulo = null;

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
        
        // 2. Cargar el módulo específico por slug
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
            
            // 3. Cargar lecciones del módulo
            await cargarLeccionesModulo(moduloActual.id, moduleSlug);
            
            // 4. Cargar progreso del módulo (si existe)
            await cargarProgresoModulo(moduloActual.id);
        } else {
            console.error('Error cargando módulo:', moduloResponse.status);
            mostrarErrorModulo();
        }
        
    } catch (error) {
        console.error('Error cargando datos del módulo:', error);
        mostrarErrorModulo();
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
            window.location.href = `/modulo/${modulo.slug}`;
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
        // ===== LÓGICA DE DESBLOQUEO CORREGIDA =====
        // La primera lección (índice 0) siempre está desbloqueada
        // Las siguientes se desbloquean cuando se completa la anterior
        const estaDesbloqueada = index === 0 || index < leccionesCompletadas;
        
        // Si la evaluación ya está aprobada, TODAS las lecciones están desbloqueadas
        const todasDesbloqueadas = progresoModulo?.evaluacion_aprobada === true;
        const desbloqueadaFinal = todasDesbloqueadas ? true : estaDesbloqueada;
        
        const claseBloqueo = desbloqueadaFinal ? '' : 'locked';
        const iconoLlave = desbloqueadaFinal ? '' : '<img src="/images/Lock.svg" alt="Bloqueado" class="icon-lock">';
        
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
    
    sidebarHTML += `
        <button class="${evaluacionDesbloqueada ? '' : 'locked'}" data-tipo="evaluacion" data-evaluacion-id="${moduloActual?.id || 1}">
            EVALUACIÓN ${evaluacionDesbloqueada ? '' : '<img src="/images/Lock.svg" alt="Bloqueado" class="icon-lock">'}
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

        lessonsHTML += `
            <div class="lesson evaluation ${evaluacionAprobada ? 'completed' : ''}" 
                data-tipo="evaluacion" 
                data-evaluacion-id="${moduloActual?.id || 1}">
                <i class="fa-regular fa-file-lines"></i>
                <div>
                    <strong>Evaluación del Módulo</strong>
                    <p>${moduloActual?.descripcion_larga ? 
                        moduloActual.descripcion_larga.substring(0, 100) + '...' : 
                        'Pon a prueba tus conocimientos del módulo'}</p>
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
                mostrarIntroduccion();
            } else if (tipo === 'evaluacion') {
                console.log('Cargando evaluación');
                cargarEvaluacion(btn.dataset.evaluacionId);
            } else if (leccionSlug && moduloActual) {
                console.log('Cargando lección:', leccionSlug);
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
    mensajeEl.innerHTML = `🔒 ${mensaje}`;
    
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
    mensajeEl.innerHTML = `✅ ${mensaje}`;
    
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
        
        /* Botón de INTRODUCCIÓN ACTIVO */
        .sidebar button[data-tipo="intro"].active {
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
            
            if (introduccionContent) introduccionContent.style.display = 'none';
            if (leccionContent) {
                leccionContent.style.display = 'block';
                leccionContent.innerHTML = contenidoLimpio;
            }
            
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

async function marcarLeccionVista(moduloId, leccionId) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');
    
    try {
        console.log('📝 Marcando lección como vista:', { moduloId, leccionId });
        
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
            console.log('✅ Respuesta de marcar vista:', data);
            
            // Recargar progreso
            await cargarProgresoModulo(moduloId);
            
            // Log para verificar el progreso actualizado
            console.log('🔄 Progreso actualizado:', progresoModulo);
            
            // Actualizar la interfaz con el nuevo progreso
            if (window.leccionesOrdenadas) {
                renderizarLecciones(window.leccionesOrdenadas);
            }
            
            mostrarMensajeExito('¡Lección completada!');
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
        console.log('📝 Cargando evaluación para módulo:', moduloActual.id);
        
        const response = await fetch(`${apiUrl}/modulos/${moduloActual.id}/evaluacion`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const evaluacion = await response.json();
            console.log('✅ Evaluación cargada:', evaluacion);
            
            // Mostrar interfaz de evaluación
            const introduccionContent = document.getElementById('introduccionContent');
            const leccionContent = document.getElementById('leccionContent');
            
            if (introduccionContent) introduccionContent.style.display = 'none';
            if (leccionContent) {
                leccionContent.style.display = 'block';
                leccionContent.innerHTML = renderizarEvaluacion(evaluacion);
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

function renderizarEvaluacion(evaluacion) {
    const evaluacionAprobada = progresoModulo?.evaluacion_aprobada || false;
    
    return `
        <div class="evaluacion-container">
            <h2>${evaluacion.titulo || 'Evaluación Final'}</h2>
            <p>${evaluacion.descripcion || 'Responde las siguientes preguntas'}</p>
            <p><strong>Tiempo límite:</strong> ${evaluacion.tiempo_limite || 30} minutos</p>
            <p><strong>Puntaje mínimo:</strong> ${evaluacion.puntaje_minimo || 70}%</p>
            <p><strong>Número de preguntas:</strong> ${evaluacion.numero_preguntas || 10}</p>
            
            ${evaluacionAprobada ? `
                <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-radius: 8px; color: #155724;">
                    <strong>✓ Evaluación ya aprobada</strong>
                    <p>Ya has aprobado esta evaluación. Puedes ver tu certificado en la sección de logros.</p>
                </div>
            ` : ''}
            
            <div style="margin-top: 30px;">
                <button class="btn-start-evaluation" onclick="iniciarEvaluacion(${evaluacion.id})" ${evaluacionAprobada ? 'disabled' : ''}>
                    ${evaluacionAprobada ? 'Ya aprobada' : 'Comenzar Evaluación'}
                </button>
            </div>
        </div>
    `;
}

window.iniciarEvaluacion = async function(evaluacionId) {
    console.log('Iniciar evaluación:', evaluacionId);
    // Aquí iría la lógica para iniciar la evaluación
    mostrarMensajeExito('Función de evaluación en desarrollo');
};

function mostrarIntroduccion() {
    const introduccionContent = document.getElementById('introduccionContent');
    const leccionContent = document.getElementById('leccionContent');
    
    if (introduccionContent) {
        introduccionContent.style.display = 'block';
        
        // Actualizar la introducción con la descripción larga del módulo si está disponible
        if (moduloActual && moduloActual.descripcion_larga) {
            const introHeader = introduccionContent.querySelector('h2');
            const paragraphs = introduccionContent.querySelectorAll('p');
            
            if (paragraphs.length > 0) {
                paragraphs[0].innerHTML = moduloActual.descripcion_larga;
                for (let i = 1; i < paragraphs.length; i++) {
                    paragraphs[i].style.display = 'none';
                }
            } else {
                const newParagraph = document.createElement('p');
                newParagraph.innerHTML = moduloActual.descripcion_larga;
                introHeader.insertAdjacentElement('afterend', newParagraph);
            }
        }
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

function mostrarErrorModulo() {
    const contentSection = document.getElementById('contentSection');
    if (contentSection) {
        contentSection.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>Error al cargar el módulo</h2>
                <p>No se pudo cargar la información del módulo. Por favor, intenta de nuevo.</p>
                <button onclick="window.location.reload()" style="
                    background: #007bff;
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
        // Limpiar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_nombre');
        localStorage.removeItem('user_apellido');
        localStorage.removeItem('user_email');
        
        // Limpiar sesión en el servidor
        try {
            await fetch('/api/clear-session-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error limpiando sesión:', error);
        }
        
        // Usar la función de redirección consistente
        redirigirALogin();
    }
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
    
    window.addEventListener('popstate', function(event) {
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

(function() {
    const originalFetch = window.fetch;
    let redirigiendo = false;
    
    window.fetch = async function(url, options = {}) {
        if (url.includes('localhost:8001') || url.includes('/api/')) {
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
                    const urlString = url.toString();
                    const peticionesCriticas = ['/me', '/logout'];
                    const esCritica = peticionesCriticas.some(p => urlString.includes(p));
                    
                    if (esCritica) {
                        redirigiendo = true;
                        // Limpiar localStorage
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('user_nombre');
                        localStorage.removeItem('user_apellido');
                        localStorage.removeItem('user_email');
                        
                        mostrarMensajeSesionExpirada();
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