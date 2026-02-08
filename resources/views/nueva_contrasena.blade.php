<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  @vite('resources/css/nueva_contrasena.css')
</head>
<body>
  <div class="container">
    <div class="left">
      <img src="{{asset('images/gato.png')  }}" alt="Mascota Varchate">
    </div>

    <div class="right">
      <img src="{{ asset('images/logo.png ') }}" alt="Logo Varchate" class="logo">
      <div class="recovery-box">
        <h2>Crea una contraseña nueva</h2>
        <p>Crea una contraseña nueva de ocho caracteres como mínimo. Una contraseña segura tiene una combinación de letras, números y signos de puntuación.</p>
        <form>
          <input type="email" placeholder="Contraseña nueva" required>
          <input type="email" placeholder="Confirmar contraseña" required>
          <button type="submit">Guardar</button>
        </form>
      </div>
    </div>
  </div>

  <div class="wave-section">
    <img src="{{('images/ola2.png')}}" alt="Ola inferior" class="ola2">
  </div>
</body>
</html>
