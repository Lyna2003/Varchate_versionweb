<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enlace de Confirmación</title>
  @vite('resources/css/enlace.css')
</head>
<body>
  <div class="container">
    <header>
      <img src="{{ asset('images/logo2.png')}}" alt="varchate" class="logo">
    </header>
    <main class="box">
      <div class="icon-check">✔</div>
      <h2>Enlace de confirmación</h2>
      <p>
        Te enviamos un enlace a tu correo electrónico para restablecer tu contraseña.
        Revisa tu bandeja de entrada o la carpeta de spam.
      </p>
    </main>
    <footer>
      <p>¿No lo recibiste? <a href="/recuperar" id="resend-link">Reenviar enlace</a></p>
    </footer>
  </div>
  <div class="wave-section">
    <img src="{{ asset('images/ola2.png') }}" alt="Ola inferior" class="ola2">
  </div>
</body>
</html>
