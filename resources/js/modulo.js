// ===============================
// VERIFICACIÓN DE AUTENTICACIÓN
// ===============================

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar token en localStorage
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        window.location.href = '/login';
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
            mostrarMensajeSesionExpirada();
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
        <button onclick="renovarSesion()" style="
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

window.renovarSesion = function() {
    window.location.href = '/login?expired=true';
};

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
            leccionesModulo = await response.json();
            console.log('Lecciones cargadas:', leccionesModulo);
            renderizarLecciones(leccionesModulo);
        }
    } catch (error) {
        console.error('Error cargando lecciones:', error);
    }
}

async function cargarProgresoModulo(moduloId) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');
    
    try {
        // Intentar cargar progreso de módulos con progreso
        const response = await fetch(`${apiUrl}/modulos-con-progreso`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const modulosConProgreso = await response.json();
            progresoModulo = modulosConProgreso.find(m => m.id === moduloId);
            console.log('Progreso del módulo:', progresoModulo);
            
            if (progresoModulo) {
                actualizarProgreso(progresoModulo.porcentaje_completado || 0);
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
    
    // Ordenar lecciones por orden
    const leccionesOrdenadas = [...lecciones].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    // 1. Renderizar sidebar
    let sidebarHTML = '<button class="active" data-tipo="intro" data-leccion-id="intro">INTRODUCCIÓN</button>';
    
    leccionesOrdenadas.forEach((leccion, index) => {
        // Verificar si la lección está desbloqueada (primera lección siempre disponible, 
        // o si la lección anterior fue vista)
        const estaDesbloqueada = index === 0 || (progresoModulo && leccionesModulo[index - 1]?.vista);
        const claseBloqueo = estaDesbloqueada ? '' : 'locked';
        const iconoLlave = estaDesbloqueada ? '' : '<img src="/images/Lock.svg" alt="Bloqueado" class="icon-lock">';
        
        sidebarHTML += `
            <button class="${claseBloqueo}" data-leccion-id="${leccion.id}" data-leccion-slug="${leccion.slug}">
                LECCIÓN ${index + 1} ${iconoLlave}
            </button>
        `;
    });
    
    // Verificar si todas las lecciones están vistas para desbloquear evaluación
    const todasLeccionesVistas = leccionesOrdenadas.every(leccion => leccion.vista);
    const evaluacionDesbloqueada = todasLeccionesVistas || (progresoModulo?.lecciones_vistas === leccionesOrdenadas.length);
    
    sidebarHTML += `
        <button class="${evaluacionDesbloqueada ? '' : 'locked'}" data-tipo="evaluacion" data-evaluacion-id="${moduloActual?.id || 1}">
            EVALUACIÓN ${evaluacionDesbloqueada ? '' : '<img src="/images/Lock.svg" alt="Bloqueado" class="icon-lock">'}
        </button>
    `;
    
    sidebar.innerHTML = sidebarHTML;
    
    // 2. Renderizar lista de lecciones en contenido
    let lessonsHTML = '';
    
    leccionesOrdenadas.forEach((leccion, index) => {
        // Extraer un párrafo corto del contenido para la descripción
        // Si el contenido es HTML, extraemos texto plano
        let descripcionCorta = '';
        if (leccion.contenido) {
            // Eliminar etiquetas HTML y tomar los primeros 100 caracteres
            const textoPlano = leccion.contenido.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            descripcionCorta = textoPlano.substring(0, 100) + (textoPlano.length > 100 ? '...' : '');
        } else {
            descripcionCorta = 'Contenido de la lección';
        }
        
        lessonsHTML += `
            <div class="lesson" data-leccion-id="${leccion.id}" data-leccion-slug="${leccion.slug}">
                <i class="fa-regular fa-file-lines"></i>
                <div>
                    <strong>Lección ${index + 1} – ${leccion.titulo}</strong>
                    <p>${descripcionCorta}</p>
                </div>
            </div>
        `;
    });
    
    // Agregar evaluación
    lessonsHTML += `
        <div class="lesson evaluation" data-tipo="evaluacion" data-evaluacion-id="${moduloActual?.id || 1}">
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
    
    // Agregar event listeners a las lecciones
    document.querySelectorAll('.lesson').forEach(lesson => {
        lesson.addEventListener('click', () => {
            const leccionId = lesson.dataset.leccionId;
            const leccionSlug = lesson.dataset.leccionSlug;
            const tipo = lesson.dataset.tipo;
            
            if (tipo === 'evaluacion') {
                cargarEvaluacion(lesson.dataset.evaluacionId);
            } else if (leccionSlug) {
                cargarLeccion(moduloActual.slug, leccionSlug);
            }
        });
    });
    
    // Agregar event listeners a los botones del sidebar
    document.querySelectorAll('.sidebar button').forEach(btn => {
        btn.addEventListener('click', () => {
            const leccionId = btn.dataset.leccionId;
            const leccionSlug = btn.dataset.leccionSlug;
            const tipo = btn.dataset.tipo;
            
            // Marcar como activo
            document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (tipo === 'intro') {
                mostrarIntroduccion();
            } else if (tipo === 'evaluacion') {
                cargarEvaluacion(btn.dataset.evaluacionId);
            } else if (leccionSlug && moduloActual) {
                cargarLeccion(moduloActual.slug, leccionSlug);
            }
        });
    });
}

// ===============================
// CARGA DE CONTENIDO ESPECÍFICO
// ===============================

async function cargarLeccion(moduloSlug, leccionSlug) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');
    
    mostrarSpinner(true);
    
    try {
        const response = await fetch(`${apiUrl}/modulos/${moduloSlug}/lecciones/${leccionSlug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const leccion = await response.json();
            console.log('Lección cargada:', leccion);
            
            // Mostrar contenido de la lección
            const introduccionContent = document.getElementById('introduccionContent');
            const leccionContent = document.getElementById('leccionContent');
            
            if (introduccionContent) introduccionContent.style.display = 'none';
            if (leccionContent) {
                leccionContent.style.display = 'block';
                // El contenido ya viene en HTML desde la BD, lo insertamos directamente
                leccionContent.innerHTML = leccion.contenido || '<p>Contenido no disponible</p>';
            }
            
            // Marcar lección como vista (si no está ya marcada)
            await marcarLeccionVista(moduloActual.id, leccion.id);
            
        } else {
            console.error('Error cargando lección:', response.status);
        }
    } catch (error) {
        console.error('Error cargando lección:', error);
    } finally {
        mostrarSpinner(false);
    }
}

async function marcarLeccionVista(moduloId, leccionId) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');
    
    try {
        await fetch(`${apiUrl}/modulos/${moduloId}/lecciones/${leccionId}/marcar-vista`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        // Recargar progreso
        await cargarProgresoModulo(moduloId);
        
    } catch (error) {
        console.error('Error marcando lección como vista:', error);
    }
}

async function cargarEvaluacion(evaluacionId) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';
    const token = localStorage.getItem('auth_token');
    
    mostrarSpinner(true);
    
    try {
        const response = await fetch(`${apiUrl}/modulos/${moduloActual.id}/evaluacion`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const evaluacion = await response.json();
            console.log('Evaluación cargada:', evaluacion);
            
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
        }
    } catch (error) {
        console.error('Error cargando evaluación:', error);
    } finally {
        mostrarSpinner(false);
    }
}

function renderizarEvaluacion(evaluacion) {
    return `
        <div class="evaluacion-container">
            <h2>${evaluacion.titulo || 'Evaluación Final'}</h2>
            <p>${evaluacion.descripcion || 'Responde las siguientes preguntas'}</p>
            <p><strong>Tiempo límite:</strong> ${evaluacion.tiempo_limite || 30} minutos</p>
            <p><strong>Puntaje mínimo:</strong> ${evaluacion.puntaje_minimo || 70}%</p>
            <p><strong>Número de preguntas:</strong> ${evaluacion.numero_preguntas || 10}</p>
            
            <div style="margin-top: 30px;">
                <button class="btn-start-evaluation" onclick="iniciarEvaluacion(${evaluacion.id})">
                    Comenzar Evaluación
                </button>
            </div>
        </div>
    `;
}

window.iniciarEvaluacion = async function(evaluacionId) {
    // Implementar lógica para iniciar evaluación
    console.log('Iniciar evaluación:', evaluacionId);
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
            
            // Mantener el primer párrafo? O reemplazar todo?
            // Aquí asumimos que quieres reemplazar los párrafos existentes
            if (paragraphs.length > 0) {
                // Reemplazar el primer párrafo con la descripción larga
                paragraphs[0].innerHTML = moduloActual.descripcion_larga;
                
                // Ocultar los demás párrafos o reemplazarlos también
                for (let i = 1; i < paragraphs.length; i++) {
                    paragraphs[i].style.display = 'none';
                }
            } else {
                // Si no hay párrafos, crear uno nuevo
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
    // modulo es el objeto completo del módulo actual
    const moduleTitleElements = [
        document.getElementById('moduleTitle'),
        document.getElementById('moduleTitleMobile')
    ];
    
    // Usar modulo.modulo (el valor del enum) en lugar de modulo.titulo
    const nombreCorto = modulo.modulo ? modulo.modulo.toUpperCase() : modulo.titulo.toUpperCase();
    
    moduleTitleElements.forEach(el => {
        if (el) el.textContent = nombreCorto;
    });
    
    // Actualizar título de la página (opcional, puedes mantener el título completo aquí)
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
        if (el) el.textContent = `${porcentaje}%`;
    });
    
    progressFillElements.forEach(el => {
        if (el) {
            el.style.width = `${porcentaje}%`;
            // Verificar color del texto después de aplicar el ancho
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
// FUNCIONALIDADES EXISTENTES (ADAPTADAS)
// ===============================

function inicializarFuncionalidades() {
    configurarProgreso();
    configurarHamburguesa();
    configurarMenusUsuario();
    configurarLogout();
    configurarBotonesModulos();
    manejarNavegacion();
    
    // Agregar event listeners para los botones del sidebar ya renderizados
    document.querySelectorAll('.sidebar button:not(.locked)').forEach(btn => {
        if (!btn._listenerAgregado) {
            btn._listenerAgregado = true;
            btn.addEventListener('click', function() {
                document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        }
    });
}

function configurarProgreso() {
    // Ya implementado en actualizarProgreso, pero mantenemos para verificación periódica
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
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_nombre');
        localStorage.removeItem('user_apellido');
        localStorage.removeItem('user_email');
        
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
        
        window.location.href = '/login';
    }
}

function configurarBotonesModulos() {
    // Ya se maneja en renderizarBotonesModulos, pero mantenemos la función
    // para centrar el botón activo
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
            window.location.href = '/login';
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