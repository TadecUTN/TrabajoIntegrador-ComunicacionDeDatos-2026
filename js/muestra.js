// Digitalizador Procedural Sample Pattern Generator
window.ImageDigitalizador = window.ImageDigitalizador || {};

(function(exports) {
    /**
     * Genera un patrón de atardecer geométrico HD en un canvas para pruebas analíticas libres de CORS.
     */
    function generarPatronMuestra(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        // 1. Degradado del atardecer
        const degradadoCielo = ctx.createLinearGradient(0, 0, 0, h);
        degradadoCielo.addColorStop(0, '#0f172a'); // Navy
        degradadoCielo.addColorStop(0.4, '#1e1b4b'); // Indigo oscuro
        degradadoCielo.addColorStop(0.7, '#581c87'); // Violeta
        degradadoCielo.addColorStop(1, '#f43f5e'); // Rosa
        ctx.fillStyle = degradadoCielo;
        ctx.fillRect(0, 0, w, h);

        // 2. Sol radial brillante (degradado)
        const degradadoSol = ctx.createRadialGradient(w / 2, h * 0.43, 10, w / 2, h * 0.43, 120);
        degradadoSol.addColorStop(0, '#ffffff');
        degradadoSol.addColorStop(0.2, '#fef08a'); // Amarillo
        degradadoSol.addColorStop(0.5, '#f97316'); // Naranja
        degradadoSol.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = degradadoSol;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.43, 120, 0, Math.PI * 2);
        ctx.fill();

        // 3. Silueta de montañas
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h * 0.77);
        ctx.quadraticCurveTo(w * 0.22, h * 0.65, w * 0.45, h * 0.8);
        ctx.quadraticCurveTo(w * 0.72, h * 0.93, w, h * 0.7);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // 4. Esferas tridimensionales de color puro
        const esferas = [
            { x: w * 0.22, y: h * 0.37, r: 60, color: '#f43f5e' }, // Rojo/Rosa
            { x: w * 0.77, y: h * 0.33, r: 70, color: '#0ea5e9' }, // Cyan
            { x: w * 0.6, y: h * 0.25, r: 40, color: '#eab308' }  // Amarillo
        ];
        esferas.forEach(esfera => {
            const grad = ctx.createRadialGradient(esfera.x - esfera.r * 0.25, esfera.y - esfera.r * 0.25, esfera.r * 0.08, esfera.x, esfera.y, esfera.r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, esfera.color);
            grad.addColorStop(1, '#020617');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(esfera.x, esfera.y, esfera.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // 5. Rejilla de alta resolución
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
        }
        for (let j = 0; j < h; j += 40) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(w, j);
            ctx.stroke();
        }

        // 6. Texto descriptivo para pruebas de aliasing
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Outfit, sans-serif';
        ctx.fillText('UTN DIGITALIZADOR - 2026', 40, h * 0.9);
    }

    /**
     * Carga el patrón y llama a onLoad pasándole la imagen, el tamaño y nombre simulados.
     */
    function cargarMuestra(onLoad) {
        const canvasMuestra = document.createElement('canvas');
        canvasMuestra.width = 800;
        canvasMuestra.height = 600;
        generarPatronMuestra(canvasMuestra);

        const img = new Image();
        img.onload = () => {
            onLoad(img, 245760, 'muestra_patron_utn'); // 240 KB simulados
        };
        img.src = canvasMuestra.toDataURL('image/png');
    }

    exports.SampleManager = {
        cargarMuestra: cargarMuestra
    };
})(window.ImageDigitalizador);
