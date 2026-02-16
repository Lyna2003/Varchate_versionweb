<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Varchate</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  @vite('resources/css/login.css')

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
          <form id="loginForm" data-api-url="{{ env('VITE_API_BASE_URL', 'http://localhost:8000/api') }}">
            <input type="email" name="email" class="input-text" placeholder="Correo">

            <div class="input-pass">
              <input type="password" name="password" class="input-password" id="password" placeholder="Contraseña">
              <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="password">
              </i>
            </div>

            <a href="recuperar">¿Olvidaste tu contraseña?</a>
            <button type="submit">Entrar</button>
          </form>

        <div class="divider"><span>O</span></div>
        <div class="social-login">
          <button class="facebook">Facebook</button>
          <button class="gmail">Gmail</button>
        </div>

      </div>
      <p class="register">¿No tienes cuenta? <a href="register">Regístrate</a></p>
    </div>
  </div>

        <!-- Modal para correo no verificado -->
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

  @vite('resources/js/login.js')

</body>
</html>
