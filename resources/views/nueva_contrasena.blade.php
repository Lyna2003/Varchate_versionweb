<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Contraseña - Varchate</title>
  <script>try { var t = localStorage.getItem('varchate_theme'); if (t === 'dark') { document.documentElement.classList.add('dark-mode'); } } catch (e) { }</script>
  @vite('resources/js/theme.js')
  @vite('resources/css/dark-mode.css')
  @vite('resources/css/nueva_contrasena.css')
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>

<body>
  <div class="container">
    <div class="left">
      <img src="{{ asset('images/gato.png') }}" alt="Mascota Varchate">
    </div>

    <div class="right">
      <img src="{{ asset('images/logo2.png') }}" alt="Logo Varchate" class="logo">
      <div class="recovery-box">
        <h2>Crea una contraseña nueva</h2>
        <p>Crea una contraseña nueva de ocho caracteres como mínimo. Una contraseña segura tiene una combinación de
          letras, números y signos de puntuación.</p>

        <div id="emailDisplay"
          style="background-color: #f0f0f0; padding: 8px; border-radius: 4px; margin-bottom: 15px; display: none;">
        </div>

        <form id="resetForm" data-api-url="{{ env('VITE_API_BASE_URL', 'http://127.0.0.1:8001/api') }}">

          <!-- Contraseña -->
          <div class="input-pass">
            <input type="password" name="password" class="input-password" id="password"
              placeholder="Contraseña" required>
            <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="password"></i>
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

          <!-- Confirmar contraseña -->
          <div class="input-pass">
            <input type="password" name="password_confirmation" class="input-password" id="password_confirmation"
              placeholder="Confirmar contraseña" required>
            <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="password_confirmation"></i>
          </div>

          <button type="submit">Guardar</button>
        </form>
      </div>
    </div>
  </div>

  <div class="wave-section">
    <img src="{{ asset('images/ola2.png') }}" alt="Ola inferior" class="ola2">
  </div>

  @vite('resources/js/nueva_contrasena.js')
</body>

</html>
