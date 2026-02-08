<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>Varchate</title>
    <!-- Enlace al archivo CSS externo -->
    @vite('resources/css/dashboard.css')

    <!-- Fuentes -->
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;600;700&display=swap"
        rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

    <!-- CodeMirror CSS 5.65.13 -->
    {{-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/dracula.min.css">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/material-darker.min.css">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/hint/show-hint.min.css"> --}}

    <!-- CodeMirror JS 5.65.13 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/php/php.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/edit/closebrackets.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/edit/matchbrackets.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/hint/show-hint.min.js"></script>

    <!-- CodeMirror CSS 5.65.15 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/codemirror.min.css">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/show-hint.min.css">

    <!-- CodeMirror JS 5.65.15 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/codemirror.min.js"></script>

    <!-- Modos 5.65.15 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/xml/xml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/javascript/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/mode/css/css.min.js"></script>

    <!-- Addons para autocompletado 5.65.15 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/show-hint.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/html-hint.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/css-hint.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/hint/javascript-hint.min.js"></script>

    <!-- Addons para cierre automático 5.65.15 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/edit/closetag.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.15/addon/edit/closebrackets.min.js"></script>


</head>

<body style="background-image: url('{{ asset('images/fondo.png') }}'); 
             background-repeat: no-repeat;
             background-size: cover;
             background-position: center 120%;
             background-attachment: scroll;">

    <header>
        <nav class="navbar">
            <div class="logo">
                <img src="{{ asset('images/logo_blanco.png') }}" alt="Logo">
            </div>
            <a href="login" class="login-btn">
                <i class="fa-slab-press fa-regular fa-user"></i>
                Login
            </a>

        </nav>

        <!-- Navbar inferior -->
        <nav class="navbar navbar-lower">
            <div class="hamburger">☰</div>
            <ul>
                <li><a href="#">INTRODUCCIÓN A LA PROGRAMACIÓN</a></li>
                <li><a href="#">HTML</a></li>
                <li><a href="#">CSS</a></li>
                <li><a href="#">JAVASCRIPT</a></li>
                <li><a href="#">SQL</a></li>
                <li><a href="#">PHP</a></li>
            </ul>

            <div id="dropdown" class="dropdown-menu">
                <a href="#">INTRODUCCIÓN A LA PROGRAMACIÓN</a>
                <a href="#">HTML</a>
                <a href="#">CSS</a>
                <a href="#">JAVASCRIPT</a>
                <a href="#">SQL</a>
                <a href="#">PHP</a>
            </div>
        </nav>


        <!-- Contenido principal HTML-->
        <section class="main-section">
            <div class="left-content">
                <h1>Programación desde cero</h1>
                <p>Bienvenido a VARCHATE.</p>
                <p>Aprendé a programar desde cero, practicá con ejercicios interactivos y avanzá paso a paso.<br>
                    Tu código, tu progreso, tu poder.</p>
                <button class="start-btn">Empieza a programar</button>
            </div>
            <div class="right-content">
                <!-- Aquí luego puedes colocar una imagen, video, ilustración, etc. -->
            </div>

        </section>

    </header>
    <!-- iconos introduccion -->
    <section class="features-section">
        <h2>Introducción a la <br>programación </h2>
        <p>Domina los fundamentos que harán fácil aprender cualquier lenguaje de programación.</p>
        <div class="icons-row">
            <div class="icon-item">
                <img src="{{ asset('images/iconos_inicio.png') }}" alt="Icono 1">

            </div>
        </div>
    </section>



    <!-- Contenido HTML -->
    <section class="container">
        <div class="left-content-html">
            <h1>HTML</h1>
            <p class="texto-justificado">
                Aprende a estructurar páginas web desde cero con el lenguaje base de Internet.
            </p>
            <button class="start-btn">Aprende HTML</button>
        </div>
        <div class="right-content-html">
            <!-- Aquí luego puedes colocar una imagen, video, ilustración, etc. -->
            <!-- Editor de código -->
            <div class="editor-container">
                <div class="editor">
                    <textarea id="code-editor">
<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
</head>
<body>

<h1>Primer titulo</h1>
<p>Primer parrafo</p>

</body>
</html>
        </textarea>
                    <button id="btn-html">Ejecutar</button>
                </div>
            </div>
            <div class="content-preview">
                <iframe id="preview"></iframe>
            </div>
    </section>


    <!-- Contenido CSS -->
    <section class="container-css">
        <div class="left-content-css">
            <h1>CSS</h1>
            <p class="texto-justificado-css">
                Dale estilo a tus páginas web y convierte un simple HTML en un diseño atractivo y moderno.
            </p>
            <button class="start-btn">Aprende CSS</button>
        </div>
        <div class="right-content-css">
            <!-- Editor de código CSS -->
            <div class="editor-container-css">
                <div class="editor-css">
                    <textarea id="code-editor-css">
body {
    background-color: lightblue;
}
p {
    font-size: 13px;
}
h1 {
    color: darkblue;
    text-align: center;
}
                </textarea>
                    <button id="btn-css">Ejecutar</button>
                </div>
            </div>
            <div class="content-preview-css">
                <iframe id="preview-css"></iframe>
            </div>
        </div>
    </section>

    <!-- Contenido JS -->
    <section class="container-js">
        <div class="left-content-js">
            <h1>JS</h1>
            <p class="texto-justificado-js">
                Aprende a agregar interactividad a tus páginas web y manipular el DOM con JavaScript.
            </p>
            <button class="start-btn">Aprende JS</button>
        </div>
        <div class="right-content-js">
            <!-- Editor de código JS -->
            <div class="editor-container-js">
                <div class="editor-js">
                    <textarea id="code-editor-js">
// Mensaje en consola
console.log("Hola, Mundo");

// Crear un div animado con colores cambiantes
const div = document.createElement("div");
div.textContent = " JS es increíble ";
div.style.fontSize = "30px";
div.style.fontWeight = "bold";
div.style.color = "white";
div.style.padding = "20px";
div.style.textAlign = "center";
div.style.borderRadius = "12px";
div.style.marginTop = "20px";
div.style.transition = "all 0.5s";

// Agregar el div al body
document.body.appendChild(div);

// Animación de cambio de color y movimiento
let hue = 0;
setInterval(() => {
  hue = (hue + 10) % 360;
  div.style.backgroundColor = `hsl(${hue}, 80%, 50%)`;
  div.style.transform = `translateY(${Math.sin(hue / 10) * 20}px)`;
}, 200);

// Mensaje de bienvenida para aprender JS
console.log("¡Bienvenido a la consola de JavaScript!");
console.log("Aquí puedes ver mensajes, valores de variables y resultados de tus cálculos.");

                </textarea>
                    <button id="btn-js">Ejecutar</button>
                </div>
            </div>
            <div class="content-preview-js">
                <iframe id="preview-js"></iframe>
            </div>
        </div>
    </section>


    <!-- Contenido SQL -->
    <section class="container-sql">
        <div class="left-content-sql">
            <h1>SQL</h1>
            <p class="texto-justificado-sql">
                Aprende a consultar y manipular bases de datos usando el lenguaje SQL.
            </p>
            <button class="start-btn">Aprende SQL</button>
        </div>
        <div class="right-content-sql">
            <!-- Editor de código SQL -->
            <div class="editor-container-sql">
                <div class="editor-sql">
                    <textarea id="code-editor-sql">

SELECT * FROM Customers;
                </textarea>
                    <button id="btn-sql">Ejecutar</button>
                </div>
            </div>
            <div class="content-preview-sql">
                <div id="preview-sql" class="sql-result">
                    <!-- Aquí se mostrarán los resultados simulados -->
                </div>
            </div>
        </div>
    </section>

    <section class="container-php">
        <div class="left-content-php">
            <h1>PHP</h1>
            <p class="texto-justificado-php">
                Aprende a crear páginas web dinámicas con PHP.
            </p>
            <button class="start-btn">Aprende PHP</button>
        </div>
        <div class="right-content-php">
            <div class="editor-container-php">
                <div class="editor-php">
                    

<textarea id="code-editor-php">
&lt;?php
// Ejemplo 1: Mostrar un mensaje
echo "Hola, Mundo desde PHP!";

// Ejemplo 2: Crear una variable y mostrarla
$nombre = "Luis";
echo "&lt;br&gt;Hola, " . $nombre;

// Ejemplo 3: Sumar dos números
$a = 5;
$b = 10;
$suma = $a + $b;
echo "&lt;br&gt;La suma de $a y $b es: " . $suma;
?&gt;
</textarea>
                    <button id="btn-php">Ejecutar</button>
                </div>
            </div>
            <div class="content-preview-php">
                <div id="preview-php"></div>
            </div>
        </div>
    </section>


    <!-- Contenedor del footer -->
    <div class="footer-container">
        <!-- Footer personalizado -->
        <footer class="custom-footer">

            <div class="footer-top">
                <div class="footer-left">
                    <img src="{{ asset('images/gato_footer.png') }}" alt="Mascota Varchate" class="footer-logo">
                    <div class="footer-welcome">
                        <h2>¡¡¡Bienvenido!!!</h2>
                        <p>
                            ¡Nos alegra tenerte aquí! En VARCHATE podrás aprender desarrollo web y programación desde
                            cero,
                            practicar con ejercicios interactivos y seguir tu progreso de manera divertida y
                            estructurada.
                        </p>
                    </div>
                </div>
                <div class="footer-right">
                    <div class="footer-section">
                        <h3>Navegación</h3>
                        <a href="#">Inicio</a>
                        <a href="#">Progreso</a>
                        <a href="#">Acerca de</a>
                    </div>
                    <div class="footer-section">
                        <h3>Aprendizaje</h3>
                        <a href="#">Introducción</a>
                        <a href="#">HTML</a>
                        <a href="#">CSS</a>
                        <a href="#">JAVASCRIPT</a>
                    </div>
                    <div class="footer-section">
                        <h3>Soporte</h3>
                        <a href="#">Ayuda</a>
                        <a href="#">Contáctanos</a>
                        <a href="#">Reportar</a>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-social">
                    <a href="#"><img src="{{ asset('images/facebook.png') }}" alt="Facebook" class="social-icon"></a>
                    <a href="#"><img src="{{ asset('images/instagram.png') }}" alt="Instagram" class="social-icon"></a>
                </div>

                <p>© VARCHATE v.1.0 - SENA - PROYECTO ADSO</p>
            </div>

        </footer>
    </div>




    @vite('resources/js/dashboard.js')
</body>

</html>