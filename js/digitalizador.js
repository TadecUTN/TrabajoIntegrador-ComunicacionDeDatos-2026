// Digitalizador Core Math and Signal Processing Algorithms
window.ImageDigitalizador = window.ImageDigitalizador || {};

(function(exports) {
    /**
     * Calcula el valor de luminancia o aísla un canal de color según la fórmula especificada.
     */
    function calculateLuma(r, g, b, formula) {
        switch (formula) {
            case 'average':
                return (r + g + b) / 3;
            case 'bt709':
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            case 'red':
                return r;
            case 'green':
                return g;
            case 'blue':
                return b;
            case 'bt601':
            default:
                return 0.299 * r + 0.587 * g + 0.114 * b;
        }
    }

    /**
     * Cuantiza un píxel individual dada la profundidad de bits y la fórmula de luminancia/canal.
     */
    function quantizePixel(r, g, b, bitDepth, formula) {
        const isChannelIsolation = ['red', 'green', 'blue'].includes(formula);
        
        switch (bitDepth) {
            case '24': // Color Real (24 bits)
                if (isChannelIsolation) {
                    return {
                        r: formula === 'red' ? r : 0,
                        g: formula === 'green' ? g : 0,
                        b: formula === 'blue' ? b : 0
                    };
                }
                return { r, g, b };
                
            case '8-color': // 8 bits Color (256 colores: 3 bits R, 3 bits G, 2 bits B)
                // Si hay aislamiento de canal en color de 8 bits:
                // Aplicamos cuantización de 3 bits para R/G y 2 bits para B en el canal aislado.
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
                
            case '8-gray': // 8 bits Escala de Grises / Canal Aislado
                const luma = Math.round(calculateLuma(r, g, b, formula));
                if (isChannelIsolation) {
                    return {
                        r: formula === 'red' ? luma : 0,
                        g: formula === 'green' ? luma : 0,
                        b: formula === 'blue' ? luma : 0
                    };
                }
                return { r: luma, g: luma, b: luma };
                
            case '1': // 1 bit Monocromático
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

    /**
     * Aplica el procesamiento de muestreo espacial y cuantización a una imagen completa.
     * Diseñada para poder ejecutarse tanto en el hilo principal como dentro de un Web Worker.
     */
    function processImage(pixels, width, height, bitDepth, formula) {
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
            output[i+3] = a; // Preservar canal alfa original
        }
        
        return output;
    }

    /**
     * Reescala una matriz de píxeles utilizando la interpolación por el vecino más cercano (Nearest-Neighbor).
     */
    function resizeNearestNeighbor(sourceData, srcW, srcH, destW, destH) {
        const output = new Uint8ClampedArray(destW * destH * 4);
        const xRatio = srcW / destW;
        const yRatio = srcH / destH;
        
        for (let y = 0; y < destH; y++) {
            const srcY = Math.floor(y * yRatio);
            const srcYOffset = srcY * srcW * 4;
            const destYOffset = y * destW * 4;
            
            for (let x = 0; x < destW; x++) {
                const srcX = Math.floor(x * xRatio);
                const srcIndex = srcYOffset + srcX * 4;
                const destIndex = destYOffset + x * 4;
                
                output[destIndex]     = sourceData[srcIndex];     // R
                output[destIndex + 1] = sourceData[srcIndex + 1]; // G
                output[destIndex + 2] = sourceData[srcIndex + 2]; // B
                output[destIndex + 3] = sourceData[srcIndex + 3]; // A
            }
        }
        
        return output;
    }

    // Exportar funciones
    exports.calculateLuma = calculateLuma;
    exports.quantizePixel = quantizePixel;
    exports.processImage = processImage;
    exports.resizeNearestNeighbor = resizeNearestNeighbor;

})(window.ImageDigitalizador);
