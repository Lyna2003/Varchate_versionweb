<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Editar perfil</title>
    @vite('resources/css/perfil.css')
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
</head>
<body>

  <header class="header">
      <a href="#" class="logo-link">
        <img src="{{ asset('images/logo_blanco.png') }}" alt="Logo Varchate" class="logo">
      </a>

      <button id="btn-darkmode" class="icono-tema" aria-label="Cambiar tema">
        <img src="{{ asset('images/modo-oscuro.svg') }}" alt="" />
      </button>

    <img src="{{ asset('images/olas1.svg') }}" alt="Decoración olas" class="olas">
  </header>


    <main class="container">
      <div class="volver-header">
      <a href="{{ route('modulos') }}" class="btn-regresar">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" 
        fill="currentColor" viewBox="0 0 16 16">
      <path fill-rule="evenodd" 
            d="M15 8a.5.5 0 0 1-.5.5H3.707l4.147 4.146a.5.5 
            0 0 1-.708.708l-5-5a.5.5 0 0 1 0-.708l5-5a.5.5 
            0 0 1 .708.708L3.707 7.5H14.5A.5.5 0 0 1 15 8z"/>
    </svg>Regresar</a>
    </div>
    
    <section class="perfil">
      <h2>Perfil de usuario</h2>
      <form id="perfilForm" class="perfil-card"
            data-modulos-url="{{ route('modulos') }}"
            data-api-url="{{ env('VITE_API_BASE_URL', 'http://localhost:8000/api') }}">
        <div class="perfil-imagen">
          <img src="{{ asset('avatars/default.png') }}" alt="Foto de perfil" id="perfil-imagen" data-default="{{ asset('avatars/default.png') }}">

             <div class="acciones-foto">
              <button type="button" class="eliminar-foto" aria-label="Eliminar foto">
                <img src="{{ asset('images/delete-icon.svg') }}" alt="Eliminar">
              </button>
              <button type="button" class="editar-foto" aria-label="Editar foto">
                <img src="{{ asset('images/editar-cuadrado.svg') }}" alt="Editar">
              </button>
            </div>
        </div>
        <div class="perfil-info">
          <div class="campo">
            <label for="usuario">Usuario</label>

            <input type="text" id="usuario" name="name" value="{{ $currentUser->name ?? '' }}">
          </div>
          <!-- Nombre completo removed from modal per request -->
          <div class="campo">
            <label for="correo">Correo electrónico</label>
            <input type="email" id="correo" name="correo" value="{{ $currentUser->email ?? '' }}" disabled>
          </div>
          <div class="campo input-pass">
            <label for="current_password">Contraseña actual</label>
            <input type="password" id="current_password" name="current_password" value="">
            <button type="button" class="toggle-pass" data-target="current_password" aria-label="Mostrar contraseña">
              <!-- eye icon (closed by default) -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#374151" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="#374151" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="campo input-pass">
            <label for="password">Nueva contraseña</label>
            <input type="text" id="password" name="password" value="">
            <button type="button" class="toggle-pass" data-target="password" aria-label="Mostrar contraseña">
              <!-- eye icon (open by default for text, but acts as toggle) -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#374151" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="#374151" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="campo input-pass">
            <label for="password_confirmation">Confirmar contraseña</label>
            <input type="password" id="password_confirmation" name="password_confirmation" value="">
            <button type="button" class="toggle-pass" data-target="password_confirmation" aria-label="Mostrar contraseña">
              <!-- eye icon (closed by default) -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#374151" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="#374151" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      
        <div class="botones">
          <button type="reset" form="perfilForm" class="cancelar">Cancelar</button>
          <button type="submit" form="perfilForm" class="guardar">Guardar cambios</button>
        </div>
      </form>
    </section>


    <section class="progreso">
      <h2>Progreso</h2>
      <div class="contenedor-progreso">
      <div class="grid-progreso">
        <div class="card">
          <h3>INTRODUCCIÓN A LA PROGRAMACIÓN</h3>
          <div class="barra"><div></div></div>
          <span></span>
        </div>
        <div class="card">
          <h3>HTML</h3>
          <div class="barra"><div></div></div>
          <span></span>
        </div>
        <div class="card">
          <h3>CSS</h3>
          <div class="barra"><div></div></div>
          <span></span>
        </div>
        <div class="card">
          <h3>JS</h3>
          <div class="barra"><div></div></div>
          <span></span>
        </div>
      </div>
    </div>
    </section>
  </main>

  <footer class="ola-bottom">
    <img src="images/ola-bottom.svg" alt="Ola inferior">
  </footer>

 
  <div class="modal-overlay" id="modalAvatar">
    <div class="modal-box" tabindex="-1">
      <h2>Selecciona un avatar</h2>
      <div class="avatar-grid">

        <div class="avatar-option" data-id="1" tabindex="0"><img src="{{ asset('avatars/avatar_01.png') }}" alt="avatar_1"></div>
        <div class="avatar-option" data-id="2" tabindex="0"><img src="{{ asset('avatars/avatar_02.png') }}" alt="avatar_2"></div>
        <div class="avatar-option" data-id="3" tabindex="0"><img src="{{ asset('avatars/avatar_03.png') }}" alt="avatar_3"></div>
        <div class="avatar-option" data-id="4" tabindex="0"><img src="{{ asset('avatars/avatar_04.png') }}" alt="avatar_4"></div>
        <div class="avatar-option" data-id="5" tabindex="0"><img src="{{ asset('avatars/avatar_05.png') }}" alt="avatar_5"></div>
        <div class="avatar-option" data-id="6" tabindex="0"><img src="{{ asset('avatars/avatar_06.png') }}" alt="avatar_6"></div>
        <div class="avatar-option" data-id="7" tabindex="0"><img src="{{ asset('avatars/avatar_07.png') }}" alt="avatar_7"></div>
        <div class="avatar-option" data-id="8" tabindex="0"><img src="{{ asset('avatars/avatar_08.png') }}" alt="avatar_8"></div>
        <div class="avatar-option avatar-default" data-id="default" tabindex="0">
          <img src="{{ asset('avatars/default.png') }}" alt="Avatar por defecto">
        </div>
      </div>
      <div class="modal-buttons">
        <button class="btn btn-cancel">Cancelar</button>
        <button class="btn btn-save">Guardar cambios</button>
      </div>
    </div>
  </div>

  <div id="modalEliminar" class="modal-eliminar">
    <div class="modal-eliminar-content">
      <p>¿Estás segur@ de eliminar la foto?</p>
      <button id="confirmarEliminar" class="btn-confirm">Sí, eliminar</button>
      <button id="cancelarEliminar" class="btn-cancel">Cancelar</button>
    </div>
  </div>

  @vite('resources/js/perfil.js')
  <script>
    // Prefill usuario and correo from localStorage if server-side auth doesn't provide them
    document.addEventListener('DOMContentLoaded', function(){
      try {
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        const usuarioEl = document.getElementById('usuario');
        const correoEl = document.getElementById('correo');
        const userNombre = localStorage.getItem('user_nombre');
        const userEmail = localStorage.getItem('user_email');
        if (usuarioEl) {
          if (stored && (stored.name || stored.usuario || stored.username)) {
            usuarioEl.value = stored.name || stored.usuario || stored.username;
          } else if (userNombre) {
            usuarioEl.value = userNombre;
          }
        }
        if (correoEl) {
          if (stored && stored.email) correoEl.value = stored.email;
          else if (userEmail) correoEl.value = userEmail;
        }
      } catch (e) { /* noop */ }
    });
  </script>
</body>
</html>