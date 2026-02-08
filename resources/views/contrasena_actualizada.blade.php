<!DOCTYPE html>
<html lang="es">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contraseña actualizada - Varchate</title>
  @vite('resources/css/contrasena_actualizada.css')
</head>

<body>

  <div class="main">
    <div class="left">
      <img src="{{asset('images/logo_azul.png')  }}" alt="Logo Varchate" class="logo">
      <div class="card">
        <div class="icon-check">✔</div>
        <h2>¡Contraseña actualizada!</h2>
        <p>La contraseña se cambió con éxito. Vuelve a iniciar sesión.</p>
         <a href="/login">
            <button type="button">Entrar</button>
          </a>
      </div>
    </div>
    <img src="{{ asset('images/alegre 1.png') }}" alt="Gato feliz" class="cat">
  </div>

  <div class="wave-section">
    <div class="footer">
      <img src="{{asset('images/ola2.png')}}" alt="Ola inferior" class="ola2">
    </div>
  </div>

</body>
</html>
