// Digitalizador Interactive Split View & Zoom Controllers
window.ImageDigitalizador = window.ImageDigitalizador || {};

(function(exports) {
    /**
     * Inicializa el comparador deslizable (Split View)
     */
    function initSplitSlider(container, capaDigitalizado, barraDivisoria) {
        if (!container || !capaDigitalizado || !barraDivisoria) return null;
        
        let isDragging = false;

        function move(clientX) {
            const rect = container.getBoundingClientRect();
            let x = clientX - rect.left;
            
            // Limitar entre 0 y el ancho del contenedor
            x = Math.max(0, Math.min(x, rect.width));
            
            const pct = (x / rect.width) * 100;
            capaDigitalizado.style.width = `${pct}%`;
            barraDivisoria.style.left = `${pct}%`;
        }

        barraDivisoria.addEventListener('mousedown', (e) => {
            isDragging = true;
            container.classList.add('arrastrando-split');
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            move(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                container.classList.remove('arrastrando-split');
            }
        });

        // Soporte para pantallas táctiles
        barraDivisoria.addEventListener('touchstart', (e) => {
            isDragging = true;
            container.classList.add('arrastrando-split');
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            if (e.touches.length > 0) {
                move(e.touches[0].clientX);
            }
        });

        window.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                container.classList.remove('arrastrando-split');
            }
        });

        // Hacer click en el contenedor también mueve la barra
        container.addEventListener('click', (e) => {
            if (e.target === barraDivisoria || barraDivisoria.contains(e.target)) return;
            move(e.clientX);
        });

        function reset() {
            capaDigitalizado.style.width = '50%';
            barraDivisoria.style.left = '50%';
        }

        reset();

        return { reset };
    }

    /**
     * Inicializa los controles de Zoom y Desplazamiento (Pan) en un contenedor
     * Soporta uno o múltiples elementos canvas a transformar (para Split View síncrono)
     */
    function initZoomPan(container, targetCanvases, floatingBadgeId) {
        if (!container || !targetCanvases) return null;
        
        const targets = Array.isArray(targetCanvases) ? targetCanvases : [targetCanvases];
        
        let scale = 1;
        let panX = 0;
        let panY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        
        const badge = document.getElementById(floatingBadgeId);

        // Configurar estilos CSS dinámicos en los targets
        targets.forEach(canvas => {
            canvas.style.transformOrigin = 'center center';
            canvas.style.transition = 'transform 0.05s ease-out';
        });
        
        container.style.overflow = 'hidden';
        container.style.cursor = 'grab';

        function updateTransform() {
            targets.forEach(canvas => {
                canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
            });
            
            // Actualizar etiqueta flotante si existe
            if (badge) {
                badge.textContent = `Zoom: ${Math.round(scale * 100)}%`;
                if (scale > 1) {
                    badge.classList.add('activo');
                } else {
                    badge.classList.remove('activo');
                }
            }
        }

        // Evento de rueda de ratón (zoom)
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = 1.15;
            
            if (e.deltaY < 0) {
                // Acercar (máximo 30x para ver píxeles con claridad académica)
                scale = Math.min(scale * zoomFactor, 30);
            } else {
                // Alejar
                scale = Math.max(scale / zoomFactor, 0.8);
            }

            // Si vuelve a tamaño normal o menor, resetear
            if (scale <= 1.05) {
                scale = 1;
                panX = 0;
                panY = 0;
            }
            
            updateTransform();
        }, { passive: false });

        // Eventos de arrastre (pan)
        container.addEventListener('mousedown', (e) => {
            // Solo permitir paneo si se ha aplicado zoom
            if (scale <= 1) return;
            
            isDragging = true;
            container.style.cursor = 'grabbing';
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            updateTransform();
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                container.style.cursor = 'grab';
            }
        });

        // Doble click para restaurar
        container.addEventListener('dblclick', () => {
            reset();
        });

        // Configurar botón de restauración si la etiqueta flotante se clickea
        if (badge) {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                reset();
            });
        }

        function reset() {
            scale = 1;
            panX = 0;
            panY = 0;
            updateTransform();
        }

        reset();

        return { reset };
    }

    exports.initSplitSlider = initSplitSlider;
    exports.initZoomPan = initZoomPan;
})(window.ImageDigitalizador);
