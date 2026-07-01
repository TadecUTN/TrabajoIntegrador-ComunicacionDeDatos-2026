// Digitalizador Web Worker Helper with Main Thread Fallback
window.ImageDigitalizador = window.ImageDigitalizador || {};

(function(exports) {
    let worker = null;
    let workerUrl = null;

    // Código fuente del worker serializado.
    // Esto evita tener que cargar archivos externos, resolviendo el problema de CORS en file://
    const workerSource = `
        function calculateLuma(r, g, b, formula) {
            switch (formula) {
                case 'average': return (r + g + b) / 3;
                case 'bt709': return 0.2126 * r + 0.7152 * g + 0.0722 * b;
                case 'red': return r;
                case 'green': return g;
                case 'blue': return b;
                case 'bt601':
                default: return 0.299 * r + 0.587 * g + 0.114 * b;
            }
        }

        function quantizePixel(r, g, b, bitDepth, formula) {
            const isChannelIsolation = ['red', 'green', 'blue'].includes(formula);
            switch (bitDepth) {
                case '24':
                    if (isChannelIsolation) {
                        return {
                            r: formula === 'red' ? r : 0,
                            g: formula === 'green' ? g : 0,
                            b: formula === 'blue' ? b : 0
                        };
                    }
                    return { r, g, b };
                case '8-color':
                    let qr = Math.round(r / 255 * 7) * 255 / 7;
                    let qg = Math.round(g / 255 * 7) * 255 / 7;
                    let qb = Math.round(b / 255 * 3) * 255 / 3;
                    if (isChannelIsolation) {
                        return {
                            r: formula === 'red' ? qr : 0,
                            g: formula === 'green' ? qg : 0,
                            b: formula === 'blue' ? qb : 0
                        };
                    }
                    return { r: qr, g: qg, b: qb };
                case '8-gray':
                    const luma = Math.round(calculateLuma(r, g, b, formula));
                    if (isChannelIsolation) {
                        return {
                            r: formula === 'red' ? luma : 0,
                            g: formula === 'green' ? luma : 0,
                            b: formula === 'blue' ? luma : 0
                        };
                    }
                    return { r: luma, g: luma, b: luma };
                case '1':
                    const lumaVal = calculateLuma(r, g, b, formula);
                    const mono = lumaVal < 128 ? 0 : 255;
                    if (isChannelIsolation) {
                        return {
                            r: formula === 'red' ? mono : 0,
                            g: formula === 'green' ? mono : 0,
                            b: formula === 'blue' ? mono : 0
                        };
                    }
                    return { r: mono, g: mono, b: mono };
                default:
                    return { r, g, b };
            }
        }

        self.onmessage = function(e) {
            const { pixels, width, height, bitDepth, formula } = e.data;
            const totalPixels = pixels.length;
            const output = new Uint8ClampedArray(totalPixels);
            
            for (let i = 0; i < totalPixels; i += 4) {
                const r = pixels[i];
                const g = pixels[i+1];
                const b = pixels[i+2];
                const a = pixels[i+3];
                
                const quantized = quantizePixel(r, g, b, bitDepth, formula);
                
                output[i] = quantized.r;
                output[i+1] = quantized.g;
                output[i+2] = quantized.b;
                output[i+3] = a;
            }
            
            // Responder transfiriendo el buffer para máximo rendimiento
            self.postMessage({ pixels: output }, [output.buffer]);
        };
    `;

    function initWorker() {
        if (worker) return true;
        try {
            const blob = new Blob([workerSource], { type: 'application/javascript' });
            workerUrl = URL.createObjectURL(blob);
            worker = new Worker(workerUrl);
            return true;
        } catch (err) {
            console.warn("No se pudo iniciar el Web Worker. Se usará el procesamiento en el hilo principal como fallback.", err);
            worker = null;
            return false;
        }
    }

    /**
     * Procesa la imagen de forma asíncrona usando Web Workers.
     * Si falla o no está soportado, cae automáticamente a procesamiento síncrono en el hilo principal.
     */
    function processImageAsync(pixels, width, height, bitDepth, formula) {
        return new Promise((resolve) => {
            const hasWorker = initWorker();
            
            if (hasWorker && worker) {
                // Crear una copia de los datos para no transferir el array original
                // y mantenerlo disponible en el hilo principal
                const dataCopy = new Uint8ClampedArray(pixels);
                const buffer = dataCopy.buffer;
                
                // Definir manejador temporal para esta llamada
                const onMessage = function(e) {
                    worker.removeEventListener('message', onMessage);
                    resolve(e.data.pixels);
                };
                
                worker.addEventListener('message', onMessage);
                worker.postMessage({
                    pixels: dataCopy,
                    width,
                    height,
                    bitDepth,
                    formula
                }, [buffer]);
            } else {
                // Fallback: procesar en hilo principal de forma síncrona
                console.log("Procesando en hilo principal...");
                const result = exports.processImage(pixels, width, height, bitDepth, formula);
                resolve(result);
            }
        });
    }

    exports.processImageAsync = processImageAsync;

})(window.ImageDigitalizador);
