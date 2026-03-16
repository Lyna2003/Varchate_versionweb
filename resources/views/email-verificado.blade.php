<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Email – Varchate</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <script>
    try {
      var dm = localStorage.getItem('dark_mode');
      if (dm === '1') document.documentElement.classList.add('dark-mode');
    } catch(e) {}
  </script>
  @vite('resources/css/email_verificado.css')
</head>
<body>

  <!-- Partículas de fondo -->
  <div class="bg-particles" aria-hidden="true">
    <span></span><span></span><span></span>
    <span></span><span></span><span></span>
  </div>

  <div class="page-wrapper">

    <!-- Logo -->
    <header class="ev-header">
      <img src="{{ asset('images/logo_blanco.png') }}" alt="Varchate" class="ev-logo">
    </header>

    <!-- Tarjeta principal -->
    <main class="ev-card" id="evCard">

      <!-- Estado: cargando -->
      <div class="ev-state" id="stateLoading">
        <div class="ev-icon-wrap loading">
          <div class="ev-spinner"></div>
        </div>
        <h1 class="ev-title">Verificando tu correo...</h1>
        <p class="ev-desc">Por favor espera un momento.</p>
      </div>

      <!-- Estado: éxito -->
      <div class="ev-state hidden" id="stateSuccess">
        <div class="ev-icon-wrap success">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h1 class="ev-title">¡Correo verificado!</h1>
        <p class="ev-desc">Tu cuenta ha sido activada exitosamente.<br>Ya puedes iniciar sesión en Varchate.</p>
        <div class="ev-countdown">
          Redirigiendo al login en <strong id="countdownNum">5</strong>s...
        </div>
        <a href="/login" class="ev-btn ev-btn--primary">
          <i class="fa-solid fa-arrow-right-to-bracket"></i>
          Ir al login ahora
        </a>
      </div>

      <!-- Estado: expirado / error -->
      <div class="ev-state hidden" id="stateExpired">
        <div class="ev-icon-wrap expired">
          <i class="fa-solid fa-clock-rotate-left"></i>
        </div>
        <h1 class="ev-title">Enlace expirado</h1>
        <p class="ev-desc" id="expiredMsg">Este enlace de verificación ya no es válido o ha expirado.</p>
        <a href="/login" class="ev-btn ev-btn--secondary">
          <i class="fa-solid fa-envelope"></i>
          Volver al login
        </a>
      </div>

      <!-- Estado: ya verificado -->
      <div class="ev-state hidden" id="stateAlready">
        <div class="ev-icon-wrap already">
          <i class="fa-solid fa-shield-check"></i>
        </div>
        <h1 class="ev-title">Ya verificado</h1>
        <p class="ev-desc">Este correo ya fue verificado anteriormente.<br>Puedes iniciar sesión normalmente.</p>
        <a href="/login" class="ev-btn ev-btn--primary">
          <i class="fa-solid fa-arrow-right-to-bracket"></i>
          Ir al login
        </a>
      </div>

    </main>

    <footer class="ev-footer">
      <p>© VARCHATE – SENA – PROYECTO ADSO</p>
    </footer>

  </div>

  @vite('resources/js/email_verificado.js')
</body>
</html>
