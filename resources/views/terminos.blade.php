<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Términos y Condiciones - VARCHATE</title>
    @vite('resources/css/terminos.css')
</head>
<body>
    <!-- Header simple sin olas -->
    <div class="header-simple">
        <a href="/" class="logo-link">
            <img src="{{ asset('images/logo_blanco.png') }}" alt="Logo Varchate" class="logo">
        </a>
        <button id="btn-darkmode" class="icono-tema" aria-label="Cambiar tema">
            <img src="{{ asset('images/modo-oscuro.svg') }}" alt="" />
        </button>
    </div>

    <main class="container">
        <!-- Botón de regresar -->
        <div class="volver-header">
            <a href="javascript:history.back()" class="btn-regresar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 1-.5.5H3.707l4.147 4.146a.5.5 0 0 1-.708.708l-5-5a.5.5 0 0 1 0-.708l5-5a.5.5 0 0 1 .708.708L3.707 7.5H14.5A.5.5 0 0 1 15 8z"/>
                </svg>
                Regresar
            </a>
        </div>

        <div class="terminos-container">
            <h1>Términos y Condiciones de Uso de VARCHATE</h1>

            <div class="fecha-actualizacion">
                <p>Última actualización: 22 de febrero de 2026</p>
            </div>

            <div class="terminos-contenido">
                <!-- 1. Aceptación de los Términos -->
                <section class="termino-seccion">
                    <h2>1. Aceptación de los Términos</h2>
                    <p>Al acceder y utilizar la plataforma educativa <strong>VARCHATE</strong> (en adelante, "la Plataforma"), propiedad de los aprendices del programa ADSO del SENA como proyecto de formación, usted acepta cumplir y estar legalmente obligado por los siguientes Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, debe abstenerse de utilizar nuestros servicios.</p>
                </section>

                <!-- 2. Descripción del Servicio -->
                <section class="termino-seccion">
                    <h2>2. Descripción del Servicio</h2>
                    <p>VARCHATE es una plataforma educativa digital cuyo propósito es ofrecer cursos progresivos y estructurados en tecnologías de desarrollo web (HTML, CSS, JavaScript, PHP, SQL e Introducción a la Programación). El servicio incluye:</p>
                    <ul>
                        <li>Acceso a módulos de aprendizaje.</li>
                        <li>Un editor de código embebido para prácticas ("Pruébelo usted mismo").</li>
                        <li>Evaluaciones automáticas.</li>
                        <li>Un chatbot con Inteligencia Artificial para asistencia educativa.</li>
                        <li>Seguimiento del progreso del usuario.</li>
                        <li>Un panel de administración para gestores de contenido.</li>
                    </ul>
                </section>

                <!-- 3. Registro y Cuenta de Usuario -->
                <section class="termino-seccion">
                    <h2>3. Registro y Cuenta de Usuario</h2>
                    <ul>
                        <li><strong>Elegibilidad:</strong> Para registrarse y utilizar la Plataforma, debe ser mayor de edad o contar con la autorización de sus padres o tutores.</li>
                        <li><strong>Información Veraz:</strong> Usted se compromete a proporcionar información precisa, actual y completa durante el proceso de registro.</li>
                        <li><strong>Confidencialidad de la Cuenta:</strong> Es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta. Notifique de inmediato cualquier uso no autorizado de su cuenta.</li>
                        <li><strong>Cuentas de Terceros:</strong> El registro mediante proveedores externos (Google, Facebook) está sujeto también a los términos y políticas de privacidad de dichos servicios.</li>
                    </ul>
                </section>

                <!-- 4. Propiedad Intelectual -->
                <section class="termino-seccion">
                    <h2>4. Propiedad Intelectual y Licencia de Uso</h2>
                    <p><strong>Contenido de VARCHATE:</strong> Todo el contenido educativo (lecciones, ejercicios, código de ejemplo, evaluaciones, diseño, software subyacente) es propiedad de los desarrolladores del proyecto VARCHATE o de sus licenciantes y está protegido por derechos de autor y otras leyes de propiedad intelectual.</p>
                    <p><strong>Licencia Limitada:</strong> Se le otorga una licencia limitada, no exclusiva, intransferible y revocable para acceder y utilizar el contenido <strong>únicamente para su aprendizaje personal y no comercial</strong>. Queda prohibida la reproducción, distribución, modificación, creación de obras derivadas o cualquier uso comercial del contenido sin autorización expresa por escrito.</p>
                </section>

                <!-- 5. Conducta del Usuario -->
                <section class="termino-seccion">
                    <h2>5. Conducta del Usuario</h2>
                    <p>Usted se compromete a utilizar la Plataforma de manera legal y ética. <strong>Queda estrictamente prohibido:</strong></p>
                    <ul>
                        <li>Utilizar la Plataforma para cualquier propósito ilegal o no autorizado.</li>
                        <li>Alojar o introducir cualquier código malicioso (virus, gusanos, etc.) en el editor de código o en cualquier parte del sistema.</li>
                        <li>Realizar actividades que puedan dañar, sobrecargar o perjudicar el funcionamiento de la Plataforma (ataques de denegación de servicio, scraping agresivo, etc.).</li>
                        <li>Intentar acceder a áreas restringidas de la Plataforma o a datos de otros usuarios sin autorización.</li>
                        <li>Suplantar la identidad de otro usuario o de los administradores.</li>
                    </ul>
                </section>

                <!-- 6. Contenido Generado por el Usuario -->
                <section class="termino-seccion">
                    <h2>6. Contenido Generado por el Usuario</h2>
                    <p>Al utilizar el editor de código y enviar ejercicios o respuestas:</p>
                    <ul>
                        <li>Usted es el titular del código que escribe.</li>
                        <li>Concede a VARCHATE una licencia mundial, no exclusiva y libre de regalías para usar, almacenar, reproducir y analizar dicho código con el único fin de proporcionarle el servicio (ejecutar el código, dar retroalimentación, evaluar sus respuestas y calcular su progreso).</li>
                    </ul>
                </section>

                <!-- 7. Limitación de Responsabilidad -->
                <section class="termino-seccion">
                    <h2>7. Limitación de Responsabilidad</h2>
                    <ul>
                        <li><strong>Proyecto de Formación:</strong> VARCHATE es un proyecto educativo desarrollado por aprendices. Si bien se esfuerza por proporcionar contenido de calidad, <strong>el uso de la Plataforma es bajo su propio riesgo</strong>. El servicio se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean expresas o implícitas.</li>
                        <li><strong>Precisión del Contenido:</strong> No garantizamos que el contenido educativo sea completamente exacto, completo o actualizado en todo momento.</li>
                        <li><strong>Chatbot IA:</strong> Las respuestas proporcionadas por el chatbot con IA son generativas y pueden contener imprecisiones. No deben considerarse como una fuente de verdad absoluta y se recomienda contrastar la información.</li>
                        <li><strong>Ejecución de Código:</strong> Usted acepta que la ejecución de código, ya sea en el editor embebido o en las evaluaciones, conlleva riesgos inherentes. VARCHATE no se hace responsable por daños indirectos o consecuentes resultantes del uso de la Plataforma.</li>
                    </ul>
                </section>

                <!-- 8. Política de Privacidad -->
                <section class="termino-seccion">
                    <h2>8. Política de Privacidad</h2>
                    <p>Su privacidad es importante para nosotros. El registro y uso de sus datos personales se rige por nuestra <a href="/privacidad" class="enlace">Política de Privacidad</a> separada, que forma parte integral de estos Términos y Condiciones. Al usar la Plataforma, usted consiente el procesamiento de sus datos según dicha política.</p>
                </section>

                <!-- 9. Modificaciones -->
                <section class="termino-seccion">
                    <h2>9. Modificaciones del Servicio y de los Términos</h2>
                    <p>Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto de la Plataforma en cualquier momento. Asimismo, podemos actualizar estos Términos y Condiciones. Las modificaciones entrarán en vigor tras su publicación en la Plataforma. El uso continuado de la Plataforma después de los cambios implicará su aceptación de los nuevos términos.</p>
                </section>

                <!-- 10. Terminación -->
                <section class="termino-seccion">
                    <h2>10. Terminación</h2>
                    <p>Podemos suspender o terminar su acceso a la Plataforma inmediatamente, sin previo aviso ni responsabilidad, si considera que ha violado estos Términos y Condiciones.</p>
                </section>

                <!-- 11. Ley Aplicable -->
                <section class="termino-seccion">
                    <h2>11. Ley Aplicable y Jurisdicción</h2>
                    <p>Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República de Colombia. Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de la ciudad de Bogotá D.C.</p>
                </section>

                <!-- 12. Contacto -->
                <section class="termino-seccion">
                    <h2>12. Contacto</h2>
                    <p>Para cualquier pregunta respecto a estos Términos y Condiciones, puede contactarnos a través de: <a href="mailto:soporte@varchate.edu.co" class="enlace">soporte@varchate.edu.co</a></p>
                </section>
            </div>

        </div>
    </main>

    <!-- Footer simple sin olas -->
    <footer class="footer-simple">
        <p>&copy; {{ date('Y') }} VARCHATE. Todos los derechos reservados.</p>
    </footer>

</body>
</html>
