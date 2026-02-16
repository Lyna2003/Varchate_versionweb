<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registro - Varchate</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  @vite('resources/css/register.css')
</head>

<body>
  <!-- Olas superpuestas -->
  <header class="header">
    <img src="{{ asset('images/olas.svg') }}" alt="Ola superior" class="olas">
  </header>

  <div class="container">
    <!-- Columna izquierda -->
    <div class="left">
      <h1>¡Nos encanta verte aquí!</h1>
      <h3>¡Únete a la comunidad más genial!</h3>
      <img src="{{ asset('images/alegre.png') }}" alt="Mascota Varchate">
    </div>

    <!-- Columna derecha -->
    <div class="right">
      <img src="{{ asset('images/logo_azul.png') }}" alt="Logo Varchate" class="logo">
      <div class="register-box">
        <h2>Crear cuenta</h2>
        <form id="registerForm" method="POST" data-api-url="{{ env('VITE_API_BASE_URL', 'http://localhost:8000/api') }}">
          <input type="text" name="nombre" placeholder="Nombre completo" required>
          <input type="email" name="email" placeholder="Correo electrónico" required>

          <div class="input-pass">
            <input type="password" name='password'class="input-password" id="regPass1" placeholder="Contraseña" required>
            <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="regPass1"></i>
          
           <div class="password-requirements-tooltip">
            <i class="fa-solid fa-circle-info info-icon"></i>
            <div class="tooltip-content">
              <strong>Requisitos de seguridad</strong>
              <ul>
                <li class="req-length">8+ caracteres</li>
                <li class="req-uppercase">Una mayúscula (A-Z)</li>
                <li class="req-lowercase">Una minúscula (a-z)</li>
                <li class="req-number">Un número (0-9)</li>
              </ul>
            </div>
          </div>
        </div>

         
        

          <div class="input-pass">
            <input type="password" name='password_confirmation' class="input-password" id="regPass2" placeholder="Confirmar contraseña" required>
            <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="regPass2"></i>
          </div>

          
          <div class="terms">
            <label for="terms">
              <input type="checkbox" name="terms_accepted" id="terms" required>
              Acepto los <a href="#">términos y condiciones</a>
            </label>
          </div>

          <button type="submit">Registrarse</button>
          
          <div class="divider">
            <span>O</span>
          </div>
          
          <div class="social-register">
            <button type="button" class="facebook">Facebook</button>
            <button type="button" class="gmail">Gmail</button>
          </div>
        </form>
      </div>
      
      <!-- "¿Ya tienes cuenta?" fuera del register-box -->
      <p class="login-link">¿Ya tienes cuenta? <a href="login">Iniciar sesión</a></p>
    </div>
  </div>

  @vite('resources/js/register.js')


</body>
</html>

