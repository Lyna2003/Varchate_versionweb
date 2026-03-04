<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Contraseña - Varchate</title>
  @vite('resources/css/nueva_contrasena.css')
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
        <p>Crea una contraseña nueva de ocho caracteres como mínimo. Una contraseña segura tiene una combinación de letras, números y signos de puntuación.</p>
        
        <!-- Mostrar email (opcional) -->
        <div id="emailDisplay" style="background-color: #f0f0f0; padding: 8px; border-radius: 4px; margin-bottom: 15px; display: none;"></div>
        
        <!-- Formulario corregido con IDs correctos -->
        <form id="resetForm">
          <input type="password" name="password" class="input-password" id="password" placeholder="Contraseña" required>
              <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="password">
              </i>
              <input type="password" name="password" class="input-password" id="password_confirmation" placeholder="Contraseña" required>
              <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="password">
              </i>
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