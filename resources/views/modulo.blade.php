<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title id="pageTitle">Varchate</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <!-- Anti-flash: aplicar tema ANTES del render (inline sincrono) -->
  <script>try { var t = localStorage.getItem('varchate_theme'); if (t === 'dark') { document.documentElement.classList.add('dark-mode'); } } catch (e) { }</script>
  <!-- Aplicar tema antes del render para evitar flash -->
  @vite('resources/js/theme.js')
  @vite('resources/css/dark-mode.css')
  @vite('resources/css/modulo.css')
</head>

<body>
  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <a href="#" class="logo-link">
        <img src="{{ asset('images/logo_blanco.png') }}" alt="Logo Varchate" class="logo">
      </a>
    </div>


    <div class="ranking">
      <a href="#" class="ranking-link" id="btn-ranking" title="Ver ranking del módulo">
        <img src="{{ asset('images/medallas.svg') }}" alt="Ranking" class="ranking-icon">
      </a>
    </div>

    <div class="progress-container">
      <span class="progress-text" id="moduleTitle">CARGANDO...</span>
      <span class="progress-percent" id="progressPercent">0%</span>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%;"></div>
      </div>
    </div>


    <div class="header-right">
      <button id="btn-darkmode" class="icono-tema" aria-label="Cambiar tema">
        <img src="{{ asset('images/modo-oscuro.svg') }}" alt="Modo oscuro">
      </button>

      <div class="user">
        <div class="user-name" id="userNameDesktop">
          <span class="first-name"></span>
          <span class="last-name"></span>
        </div>
        <img src="" alt="Usuario" id="profile-pic" tabindex="0" aria-haspopup="true" aria-expanded="false"
          style="opacity:0;transition:opacity 0.3s ease;">

        <div class="user-menu" id="user-menu" role="menu">
          <a href="{{ route('perfil') }}" class="menu-item" role="menuitem" tabindex="0">
            <span>Editar perfil</span>
            <img src="{{ asset('images/editar-cuadrado.svg') }}" alt="Editar" class="menu-svg">
          </a>
          <button class="menu-item" role="menuitem" id="logout-btn">
            <span>Cerrar sesión</span>
            <img src="{{ asset('images/logout-icon.svg') }}" alt="Cerrar sesión" class="menu-svg">
          </button>
        </div>
      </div>
  </header>

  <!-- Header exclusivo para móvil -->
  <div class="mobile-header">
    <div class="mobile-top">
      <a href="#" class="logo-link">
        <img src="{{ asset('images/logo_blanco.png') }}" alt="Logo Varchate" class="logo-mobile">
      </a>

      <div class="mobile-user">
        <span class="user-name-mobile" id="userNameMobile">
          <span class="first-name"></span>
          <span class="last-name"></span>
        </span>

        <img src="" alt="Usuario" id="profile-pic-mobile" tabindex="0" aria-haspopup="true" aria-expanded="false"
          style="opacity:0;transition:opacity 0.3s ease;">

        <div class="user-menu-mobile" id="user-menu-mobile" role="menu">
          <a href="{{ route('perfil') }}" class="menu-item" role="menuitem" tabindex="0">
            <span>Editar perfil</span>
            <img src="{{ asset('images/editar-cuadrado.svg') }}" alt="Editar" class="menu-svg">
          </a>
          <button class="menu-item" role="menuitem" id="logout-btn-mobile">
            <span>Cerrar sesión</span>
            <img src="{{ asset('images/logout-icon.svg') }}" alt="Cerrar sesión" class="menu-svg">
          </button>
          <button class="menu-item" role="menuitem" id="darkmode-btn-mobile">
            <span>Modo oscuro</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Barra de progreso móvil -->
    <div class="progress-container-mobile">
      <span class="progress-text" id="moduleTitleMobile">CARGANDO...</span>
      <span class="progress-percent" id="progressPercentMobile">0%</span>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFillMobile" style="width: 0%;"></div>
      </div>
    </div>
  </div>

  <main class="container" data-modulo-base-url="{{ url('/modulo') }}" data-lock-url="{{ asset('images/Lock.svg') }}"
    data-avatars-url="{{ asset('avatars') }}" data-images-url="{{ asset('images') }}"
    data-clear-session-url="{{ url('/api/clear-session-token') }}" data-login-url="{{ url('/login') }}"
    data-api-url="{{ env('VITE_API_BASE_URL', 'http://localhost:8001/api') }}">

    <!-- Nueva barra que incluye el hamburguesa + los top-buttons -->
    <div class="topbar">

      <button id="hamburgerBtn" class="hamburger" aria-label="Mostrar lecciones">
        <span></span>
        <span></span>
        <span></span>
      </button>


      <div class="top-buttons" id="topButtonsContainer">
        <span></span>
        <span></span>
        <span></span>

      </div>
    </div>

    <!-- Contenedor inferior (sidebar + contenido) -->
    <div class="main-layout">
      <aside class="sidebar" id="sidebar">

      </aside>

      <!-- Content -->
      <section class="content" id="contentSection">

        <div id="introduccionContent">
          <h2 class="intro-header">
            {{-- <img src="{{ asset('images/chatbot-icon.svg') }}" alt="Chatbot" class="chatbot-icon" /> --}}
          </h2>

          <p>
            Cargando modulo...
          </p>

          <p>

          </p>


          <h3>Contenido</h3>
          <div class="lessons" id="lessonsContainer">

            <!-- Las lecciones se generarán desde JavaScript -->
          </div>
        </div>

        <!-- Contenedor para contenido dinámico de lecciones -->
        <div id="leccionContent" style="display: none;"></div>

        <div class="btn-container">
          <button class="btn-next" id="btnNext">Siguiente</button>
        </div>
      </section>
    </div>
  </main>

  <!-- Footer -->
  <div class="footer-container">
    <footer class="custom-footer">
      <div class="footer-top">
        <div class="footer-left">
          <img src="{{ asset('images/gato_footer.png') }}" alt="Mascota Varchate" class="footer-logo">
          <div class="footer-welcome">
            <h2>¡¡¡Bienvenido!!!</h2>
            <p>
              ¡Nos alegra tenerte aquí! En VARCHATE podrás aprender desarrollo web y programación desde
              cero, practicar con ejercicios interactivos y seguir tu progreso de manera divertida y
              estructurada.
            </p>
          </div>
        </div>
        <div class="footer-right">
          <div class="footer-section">
            <h3>Navegación</h3>
            <a href="#">Inicio</a>
            <a href="#">Progreso</a>
            <a href="#">Acerca de</a>
          </div>
          <div class="footer-section">
            <h3>Aprendizaje</h3>
            <a href="#">Introducción</a>
            <a href="#">HTML</a>
            <a href="#">CSS</a>
            <a href="#">JAVASCRIPT</a>
          </div>
          <div class="footer-section">
            <h3>Soporte</h3>
            <a href="#">Ayuda</a>
            <a href="#">Contáctanos</a>
            <a href="#">Reportar</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-social">
          <a href="#"><img src="{{ asset('images/facebook.png') }}" alt="Facebook"></a>
          <a href="#"><img src="{{ asset('images/instagram.png') }}" alt="Instagram"></a>
        </div>
        <p>© VARCHATE - SENA - PROYECTO ADSO</p>
      </div>
    </footer>
  </div>

  <div id="sidebarOverlay" class="sidebar-overlay"></div>

  <!-- Loading spinner opcional -->
  <div id="loadingSpinner"
    style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;">
    <div class="spinner"></div>
  </div>

  @vite('resources/js/modulo.js')

  <!-- ===== MODAL DE EVALUACIÓN ===== -->
  <div id="eval-modal-overlay"
    style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:3000; align-items:center; justify-content:center;">
    <div class="eval-modal">

      <!-- Header del modal -->
      <div class="eval-modal-header">
        <div class="eval-modal-info">
          <div class="eval-progress-bar">
            <div class="eval-progress-fill" id="eval-modal-progress" style="width:0%"></div>
          </div>
          <h2 class="eval-modal-title" id="eval-modal-titulo" style="text-transform: uppercase;">Evaluación</h2>
          <span id="eval-modal-counter">Pregunta 1 de ?</span>
        </div>
        <div class="eval-time-box">
          <span><b>TIEMPO</b></span>
          <span class="eval-timer" id="eval-modal-timer">00:00</span>
        </div>
        <button class="eval-cancel-btn" id="eval-modal-cancel-btn" title="Salir">✕</button>
      </div>

      <!-- Cuerpo -->
      <div class="eval-modal-body">
        <p class="eval-instrucciones" id="eval-modal-instrucciones"></p>
        <p class="eval-question" id="eval-modal-question">Cargando pregunta...</p>
        <div class="eval-options" id="eval-modal-options"></div>
      </div>

      <!-- Footer -->
      <div class="eval-modal-footer">
        <button class="eval-btn eval-btn-prev" id="eval-modal-prev-btn">← Anterior</button>
        <button class="eval-btn eval-btn-check" id="eval-modal-check-btn">Comprobar</button>
        <button class="eval-btn eval-btn-next" id="eval-modal-next-btn" style="display:none">Siguiente →</button>
        <button class="eval-btn eval-btn-finish" id="eval-modal-finish-btn" style="display:none">Finalizar
          evaluación</button>
      </div>

    </div>
  </div>
  <!-- ===== FIN MODAL DE EVALUACIÓN ===== -->

  <!-- ===== MODAL DE RANKING ===== -->
  <div id="ranking-modal-overlay"
    style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:4000; align-items:center; justify-content:center;">

    <div id="ranking-modal" style="
      background: var(--color-surface, #fff);
      border-radius: 20px;
      width: 92%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 60px rgba(0,0,0,.35);
      animation: rankingSlideIn .28s cubic-bezier(.16,1,.3,1) both;
      position: relative;
    ">
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #0099FF 0%, #0060cc 100%);
        border-radius: 20px 20px 0 0;
        padding: 24px 24px 20px;
        display: flex; align-items: center; justify-content: space-between;
      ">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:2rem;">🏆</span>
          <div>
            <h2 style="color:#fff; font-size:1.2rem; font-weight:700; margin:0;">Top 5 del Módulo</h2>
            <p id="ranking-modal-subtitulo" style="color:rgba(255,255,255,.8); font-size:0.8rem; margin:0;"></p>
          </div>
        </div>
        <button id="ranking-modal-close" style="
          background: rgba(255,255,255,.2); border:none; color:#fff;
          width:34px; height:34px; border-radius:50%; font-size:1.1rem;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition: background .2s;
        " title="Cerrar">✕</button>
      </div>

      <!-- Body -->
      <div id="ranking-modal-body" style="padding: 20px 20px 8px;">
        <!-- Se rellena dinámicamente -->
        <div id="ranking-skeleton" style="display:flex; flex-direction:column; gap:12px;">
          <div style="height:60px; border-radius:12px; background:#f0f0f0; animation: rankingPulse 1.2s ease-in-out infinite;"></div>
          <div style="height:60px; border-radius:12px; background:#f0f0f0; animation: rankingPulse 1.2s ease-in-out infinite .1s;"></div>
          <div style="height:60px; border-radius:12px; background:#f0f0f0; animation: rankingPulse 1.2s ease-in-out infinite .2s;"></div>
        </div>
        <div id="ranking-lista" style="display:none; flex-direction:column; gap:10px;"></div>
      </div>

      <!-- Footer stats -->
      <div id="ranking-modal-footer" style="
        padding: 14px 20px 20px;
        border-top: 1px solid var(--color-border, #e5e7eb);
        display: flex; justify-content: space-between; align-items:center;
        font-size:0.8rem; color: var(--color-text-muted, #6b7280);
        display:none;
      ">
        <span id="ranking-total-participantes"></span>
        <span id="ranking-actualizado" style="font-style:italic;"></span>
      </div>
    </div>
  </div>

  <style>
    @keyframes rankingSlideIn {
      from { opacity: 0; transform: translateY(30px) scale(.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes rankingPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: .45; }
    }
    #ranking-modal-close:hover { background: rgba(255,255,255,.35) !important; }
    .ranking-row { transition: transform .15s, box-shadow .15s; }
    .ranking-row:hover { transform: translateX(4px); box-shadow: 0 4px 14px rgba(0,0,0,.08); }
  </style>
  <!-- ===== FIN MODAL DE RANKING ===== -->

</body>

</html>