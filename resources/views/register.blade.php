<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Registro - Varchate</title>
    <script>
        try {
            var t = localStorage.getItem('varchate_theme');
            if (t === 'dark') {
                document.documentElement.classList.add('dark-mode');
            }
        } catch (e) {}
    </script>
    @vite('resources/js/theme.js')
    @vite('resources/css/dark-mode.css')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    @vite('resources/css/register.css')
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>

<body>
    <header class="header">
        <img src="{{ asset('images/olas.svg') }}" alt="Ola superior" class="olas">
    </header>

    <div class="container">
        <div class="left">
            <h1>¡Nos encanta verte aquí!</h1>
            <h3>¡Únete a la comunidad más genial!</h3>
            <img src="{{ asset('images/alegre.png') }}" alt="Mascota Varchate">
        </div>

        <div class="right">
            <img src="{{ asset('images/logo_azul.png') }}" alt="Logo Varchate" class="logo">
            <div class="register-box">
                <h2>Crear cuenta</h2>
                <form id="registerForm" method="POST"
                    data-api-url="{{ env('VITE_API_BASE_URL', 'http://localhost:8001/api') }}"
                    data-session-url="{{ url('/api/set-session-token') }}" data-modulos-url="{{ route('modulos') }}">
                    <input type="text" name="nombre" placeholder="Nombre completo" required>
                    <input type="email" name="email" placeholder="Correo electrónico" required>

                    <div class="input-pass">
                        <input type="password" name='password' class="input-password" id="regPass1"
                            placeholder="Contraseña" required>
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
                        <input type="password" name='password_confirmation' class="input-password" id="regPass2"
                            placeholder="Confirmar contraseña" required>
                        <i class="fa-solid fa-eye-slash toggle-pass" style="font-size:14px;" data-target="regPass2"></i>
                    </div>

                    <div class="terms">
                        <label for="terms">
                            <input type="checkbox" name="terms_accepted" id="terms" required>
                            Acepto los <a href="terminos">términos y condiciones</a>
                        </label>
                    </div>

                    <button type="submit">Registrarse</button>

                    <div class="divider"><span>O</span></div>

                    <div class="social-register">
                        <!-- Botón oficial de Google -->
                        <div id="g_id_onload" data-client_id="{{ env('GOOGLE_CLIENT_ID') }}"
                            data-callback="handleGoogleLogin" data-auto_prompt="false">
                        </div>
                        <div class="g_id_signin" data-type="standard" data-theme="outline" data-text="signup_with"
                            data-shape="rectangular" data-locale="es" data-width="300">
                        </div>
                    </div>
                </form>
            </div>

            <p class="login-link">¿Ya tienes cuenta? <a href="login">Iniciar sesión</a></p>
        </div>
    </div>

    <!-- Pantalla de carga Google -->
    <div id="googleLoadingScreen"
        style="display:none; position:fixed; inset:0; background:rgba(255,255,255,0.95); z-index:9999; flex-direction:column; align-items:center; justify-content:center; gap:20px;">
        <img src="{{ asset('images/logo_azul.png') }}" alt="Varchate"
            style="width:140px; animation: pulse 1.5s ease-in-out infinite;">
        <div style="display:flex; gap:8px;">
            <span
                style="width:10px;height:10px;border-radius:50%;background:#4285F4;animation:bounce 0.8s ease-in-out infinite;"></span>
            <span
                style="width:10px;height:10px;border-radius:50%;background:#EA4335;animation:bounce 0.8s ease-in-out 0.15s infinite;"></span>
            <span
                style="width:10px;height:10px;border-radius:50%;background:#FBBC05;animation:bounce 0.8s ease-in-out 0.3s infinite;"></span>
            <span
                style="width:10px;height:10px;border-radius:50%;background:#34A853;animation:bounce 0.8s ease-in-out 0.45s infinite;"></span>
        </div>
        <p style="color:#555; font-size:15px; font-family:sans-serif;">Creando tu cuenta con Google...</p>
    </div>

    <style>
        @keyframes bounce {

            0%,
            100% {
                transform: translateY(0);
            }

            50% {
                transform: translateY(-12px);
            }
        }

        @keyframes pulse {

            0%,
            100% {
                opacity: 1;
                transform: scale(1);
            }

            50% {
                opacity: 0.7;
                transform: scale(0.95);
            }
        }
    </style>

    <script>
        async function handleGoogleLogin(response) {
            const form = document.getElementById('registerForm');
            const apiUrl = form.dataset.apiUrl;
            const sessionUrl = form.dataset.sessionUrl;
            const modulosUrl = form.dataset.modulosUrl;

            document.getElementById('googleLoadingScreen').style.display = 'flex';

            try {
                const res = await fetch(`${apiUrl}/auth/google`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        id_token: response.credential
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('auth_token', data.access_token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    await fetch(sessionUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        },
                        body: JSON.stringify({
                            token: data.access_token
                        })
                    });

                    window.location.href = modulosUrl;
                } else {
                    document.getElementById('googleLoadingScreen').style.display = 'none';
                    alert(data.message || 'Error al registrarse con Google');
                }
            } catch (e) {
                document.getElementById('googleLoadingScreen').style.display = 'none';
                console.error('Error Google registro:', e);
                alert('Error de conexión. Intenta de nuevo.');
            }
        }
    </script>

    @vite('resources/js/register.js')

</body>

</html>
