<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar Contraseña - Varchate</title>
  @vite('resources/css/recuperar.css')
</head>

<body>
  <div class="container">
    <div class="left">
      <img src="{{ asset('images/olvidaste.png') }}" alt="Mascota Varchate">
    </div>

    <div class="right">
      <img src="{{ asset('images/logo_azul.png') }}" alt="Logo Varchate" class="logo">
      <div class="recovery-box">
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
        <form>
          <input type="email" placeholder="Correo electrónico" required>
          <a href="enlace">
            <button type="button">Entrar</button>
          </a>
        </form>
      </div>
      <p class="register">¿Recordaste tu contraseña? <a href="login">Iniciar sesión</a></p>
    </div>
  </div>

  <div class="wave-section">
    <img src="{{ asset('images/ola2.png') }}" alt="Ola inferior" class="ola2">
  </div>
</body>
</html>
