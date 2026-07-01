// Digitalizador Theme Switcher Manager
window.ImageDigitalizador = window.ImageDigitalizador || {};

(function(exports) {
    function initTheme() {
        const botonTema = document.getElementById('botonTema');
        if (!botonTema) return;

        // Cargar tema guardado o por defecto oscuro
        const temaGuardado = localStorage.getItem('tema-digitalizador') || 'oscuro';
        aplicarTema(temaGuardado);

        botonTema.addEventListener('click', () => {
            const esOscuro = document.body.classList.contains('tema-oscuro');
            const nuevoTema = esOscuro ? 'claro' : 'oscuro';
            aplicarTema(nuevoTema);
            
            // Disparar un evento para notificar a otros componentes (ej. redibujar histograma)
            window.dispatchEvent(new CustomEvent('themechanged', { detail: { tema: nuevoTema } }));
        });
    }

    function aplicarTema(tema) {
        if (tema === 'claro') {
            document.body.classList.remove('tema-oscuro');
            document.body.classList.add('tema-claro');
            localStorage.setItem('tema-digitalizador', 'claro');
        } else {
            document.body.classList.remove('tema-claro');
            document.body.classList.add('tema-oscuro');
            localStorage.setItem('tema-digitalizador', 'oscuro');
        }
    }

    exports.ThemeManager = {
        init: initTheme
    };
})(window.ImageDigitalizador);
