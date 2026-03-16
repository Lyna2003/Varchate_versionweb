function mostrarEstado(id) {
    ['stateLoading', 'stateSuccess', 'stateExpired', 'stateAlready'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.toggle('hidden', s !== id);
    });
}

function iniciarContador(segundos = 5, destino = '/login') {
    const numEl = document.getElementById('countdownNum');
    let restante = segundos;
    const intervalo = setInterval(() => {
        restante--;
        if (numEl) numEl.textContent = restante;
        if (restante <= 0) {
            clearInterval(intervalo);
            window.location.href = destino;
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    const status = new URLSearchParams(window.location.search).get('status');

    switch (status) {
        case 'success':
            mostrarEstado('stateSuccess');
            iniciarContador(5, '/login');
            break;
        case 'already':
            mostrarEstado('stateAlready');
            break;
        case 'expired':
        case 'invalid':
            mostrarEstado('stateExpired');
            break;
        default:
            document.getElementById('expiredMsg').textContent =
                'Accede a este enlace desde el correo de verificación.';
            mostrarEstado('stateExpired');
            break;
    }
});
