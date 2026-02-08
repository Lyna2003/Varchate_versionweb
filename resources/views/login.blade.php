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
      <img src="{{ asset('images/logo.png') }}" alt="Logo Varchate" class="logo">
      <div class="login-box">
        <h2>Iniciar sesión</h2>
          <form>
            <input type="email" class="input-text" placeholder="Correo" required>

            <div class="input-pass">
              <input type="password" class="input-password" id="password" placeholder="Contraseña" required>
              <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="password">
              </i>
            </div>

            <a href="recuperar.html">¿Olvidaste tu contraseña?</a>
            <button type="submit">Entrar</button>
          </form>

        <div class="divider"><span>O</span></div>
        <div class="social-login">
          <button class="facebook">Facebook</button>
          <button class="gmail">Gmail</button>
        </div>
        
      </div>
      <p class="register">¿No tienes cuenta? <a href="register.html">Regístrate</a></p>
    </div>
  </div>

  @vite('resources/js/login.js')

</body>
</html>
