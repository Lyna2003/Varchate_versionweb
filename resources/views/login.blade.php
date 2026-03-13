<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Login - Varchate</title>
  <script>try { var t = localStorage.getItem('varchate_theme'); if (t === 'dark') { document.documentElement.classList.add('dark-mode'); } } catch (e) { }</script>
  @vite('resources/js/theme.js')
  @vite('resources/css/dark-mode.css')
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  @vite('resources/css/login.css')
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>

<body>
  <header>
    <img src="{{ asset('images/olas.svg') }}" alt="Ola superior" class="olas">
  </header>

  <div class="container">
    <div class="left">
      <h1>¡Hora de volver a casa!</h1>
      <img src="{{ asset('images/gato.png') }}" alt="Mascota Varchate">
    </div>
    <div class="right">
      <img src="{{ asset('images/logo_azul.png') }}" alt="Logo Varchate" class="logo">
      <div class="login-box">
        <h2>Iniciar sesión</h2>

        <form id="loginForm"
          data-api-url="{{ env('VITE_API_BASE_URL', 'http://localhost:8001/api') }}"
          data-session-url="{{ url('/api/set-session-token') }}"
          data-modulos-url="{{ route('modulos') }}">
          <input type="email" name="email" class="input-text" placeholder="Correo">
          <div class="input-pass">
            <input type="password" name="password" class="input-password" id="password" placeholder="Contraseña">
            <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="password"></i>
          </div>
          <a href="recuperar">¿Olvidaste tu contraseña?</a>
          <button type="submit">Entrar</button>
        </form>

        <div class="divider"><span>O</span></div>

        <div class="social-login">
          <div id="g_id_onload"
               data-client_id="{{ env('GOOGLE_CLIENT_ID') }}"
               data-callback="handleGoogleLogin"
               data-auto_prompt="false">
          </div>
          <div class="g_id_signin"
               data-type="standard"
               data-theme="outline"
               data-text="signin_with"
               data-shape="rectangular"
               data-locale="es"
               data-width="300">
          </div>
        </div>
      </div>
      <p class="register">¿No tienes cuenta? <a href="register">Regístrate</a></p>
    </div>
  </div>

  <!-- Modal correo no verificado -->
  <div id="emailVerificationModal" class="modal" style="display: none;">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Correo no verificado</h3>
        <span class="modal-close">&times;</span>
      </div>
      <div class="modal-body">
        <p id="modalMessage">Debes verificar tu correo electrónico antes de iniciar sesión.</p>
        <p>¿No recibiste el correo?</p>
      </div>
      <div class="modal-footer">
        <button id="resendEmailBtn" class="btn-primary">Reenviar correo</button>
        <button id="closeModalBtn" class="btn-secondary">Cerrar</button>
      </div>
      <div id="resendStatus" style="margin-top: 10px; font-size: 13px;"></div>
    </div>
  </div>

  <!-- Pantalla de carga Google -->
  <div id="googleLoadingScreen"
    style="display:none; position:fixed; inset:0; background:rgba(255,255,255,0.95); z-index:9999; flex-direction:column; align-items:center; justify-content:center; gap:20px;">
    <img src="{{ asset('images/logo_azul.png') }}" alt="Varchate"
      style="width:140px; animation: pulse 1.5s ease-in-out infinite;">
    <div style="display:flex; gap:8px;">
      <span style="width:10px;height:10px;border-radius:50%;background:#4285F4;animation:bounce 0.8s ease-in-out infinite;"></span>
      <span style="width:10px;height:10px;border-radius:50%;background:#EA4335;animation:bounce 0.8s ease-in-out 0.15s infinite;"></span>
      <span style="width:10px;height:10px;border-radius:50%;background:#FBBC05;animation:bounce 0.8s ease-in-out 0.3s infinite;"></span>
      <span style="width:10px;height:10px;border-radius:50%;background:#34A853;animation:bounce 0.8s ease-in-out 0.45s infinite;"></span>
    </div>
    <p style="color:#555; font-size:15px; font-family:sans-serif;">Iniciando sesión con Google...</p>
  </div>

  <style>
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(0.95); }
    }
  </style>

  <!-- UNA sola función Google -->
  <script>
    async function handleGoogleLogin(response) {
      const form = document.getElementById('loginForm');
      const apiUrl = form.dataset.apiUrl;
      const modulosUrl = form.dataset.modulosUrl;
      const sessionUrl = form.dataset.sessionUrl;

      document.getElementById('googleLoadingScreen').style.display = 'flex';

      try {
        const res = await fetch(`${apiUrl}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ id_token: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('auth_token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));

          await fetch(sessionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ token: data.access_token })
          });

          window.location.href = '/modulos';
        } else {
          document.getElementById('googleLoadingScreen').style.display = 'none';
          alert(data.message || 'Error al iniciar sesión con Google');
        }
      } catch (e) {
        document.getElementById('googleLoadingScreen').style.display = 'none';
        console.error('Error Google login:', e);
        alert('Error de conexión. Intenta de nuevo.');
      }
    }
  </script>

  @vite('resources/js/login.js')

</body>
</html>
