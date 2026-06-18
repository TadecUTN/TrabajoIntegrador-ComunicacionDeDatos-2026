document.addEventListener('DOMContentLoaded', () => {
    const entradaImagen = document.getElementById('entradaImagen');
    const botonCargarImagen = document.getElementById('botonCargarImagen');
    const botonCargarMuestra = document.getElementById('botonCargarMuestra');
    const botonDigitalizar = document.getElementById('botonDigitalizar');
    
    const seleccionResolucion = document.getElementById('seleccionResolucion');
    const seleccionProfundidadBits = document.getElementById('seleccionProfundidadBits');
    
    const lienzoOriginal = document.getElementById('lienzoOriginal');
    const marcadorOriginal = document.getElementById('marcadorOriginal');
    
    const lienzoDigitalizado = document.getElementById('lienzoDigitalizado');
    const marcadorDigitalizado = document.getElementById('marcadorDigitalizado');

    // Elementos del panel de resultados
    const panelResultados = document.getElementById('panelResultados');
    const infoOrigResolucion = document.getElementById('infoOrigResolucion');
    const infoOrigTamanio = document.getElementById('infoOrigTamanio');
    const infoOrigBytesBrutos = document.getElementById('infoOrigBytesBrutos');
    const infoDigResolucion = document.getElementById('infoDigResolucion');
    const infoDigBytesBrutos = document.getElementById('infoDigBytesBrutos');
    const infoAhorroBruto = document.getElementById('infoAhorroBruto');
    
    const formatoCompresion = document.getElementById('formatoCompresion');
    const calidadJpeg = document.getElementById('calidadJpeg');
    const valorCalidadJpeg = document.getElementById('valorCalidadJpeg');
    const infoTamanioComprimido = document.getElementById('infoTamanioComprimido');
    const infoRelacionCompresion = document.getElementById('infoRelacionCompresion');
    const botonDescargar = document.getElementById('botonDescargar');

    let imagenActual = null;
    let tamanioArchivoOriginal = 0;
    let nombreArchivoOriginal = 'imagen_digitalizada';

    // Disparar la selección de archivos
    botonCargarImagen.addEventListener('click', () => {
        entradaImagen.click();
    });

    // Controlar la generación de la imagen de prueba
    botonCargarMuestra.addEventListener('click', () => {
        // Generar una imagen de prueba de alta calidad de forma puramente local
        const lienzoMuestra = document.createElement('canvas');
        lienzoMuestra.width = 800;
        lienzoMuestra.height = 600;
        const contextoLienzoMuestra = lienzoMuestra.getContext('2d');

        // 1. Degradado del fondo (cielo/atardecer)
        const degradadoCielo = contextoLienzoMuestra.createLinearGradient(0, 0, 0, 600);
        degradadoCielo.addColorStop(0, '#0f2027');
        degradadoCielo.addColorStop(0.5, '#203a43');
        degradadoCielo.addColorStop(1, '#2c5364');
        contextoLienzoMuestra.fillStyle = degradadoCielo;
        contextoLienzoMuestra.fillRect(0, 0, 800, 600);

        // 2. Un sol radiante (degradado radial) para probar gradientes circulares
        const degradadoSol = contextoLienzoMuestra.createRadialGradient(400, 250, 10, 400, 250, 150);
        degradadoSol.addColorStop(0, '#ffffff');
        degradadoSol.addColorStop(0.2, '#ffcc00');
        degradadoSol.addColorStop(0.5, '#ff6600');
        degradadoSol.addColorStop(1, 'rgba(255, 102, 0, 0)');
        contextoLienzoMuestra.fillStyle = degradadoSol;
        contextoLienzoMuestra.beginPath();
        contextoLienzoMuestra.arc(400, 250, 150, 0, Math.PI * 2);
        contextoLienzoMuestra.fill();

        // 3. Montañas (formas suaves para probar bordes y submuestreo espacial)
        const degradadoMontanas = contextoLienzoMuestra.createLinearGradient(0, 350, 0, 600);
        degradadoMontanas.addColorStop(0, '#11998e');
        degradadoMontanas.addColorStop(1, '#38ef7d');
        contextoLienzoMuestra.fillStyle = degradadoMontanas;
        contextoLienzoMuestra.beginPath();
        contextoLienzoMuestra.moveTo(0, 600);
        contextoLienzoMuestra.lineTo(0, 420);
        contextoLienzoMuestra.quadraticCurveTo(200, 360, 400, 450);
        contextoLienzoMuestra.quadraticCurveTo(600, 540, 800, 380);
        contextoLienzoMuestra.lineTo(800, 600);
        contextoLienzoMuestra.closePath();
        contextoLienzoMuestra.fill();

        // 4. Esferas tridimensionales de colores puros para testear cuantización de color
        const esferas = [
            { x: 180, y: 200, r: 55, color: '#ff0055' }, // Rojo vibrante
            { x: 300, y: 150, r: 40, color: '#00b4d8' }, // Azul cyan
            { x: 620, y: 220, r: 65, color: '#f77f00' }, // Naranja
            { x: 490, y: 130, r: 35, color: '#ffea00' }  // Amarillo puro
        ];
        esferas.forEach(esfera => {
            const degradadoRadial = contextoLienzoMuestra.createRadialGradient(esfera.x - esfera.r * 0.2, esfera.y - esfera.r * 0.2, esfera.r * 0.1, esfera.x, esfera.y, esfera.r);
            degradadoRadial.addColorStop(0, '#ffffff');
            degradadoRadial.addColorStop(0.3, esfera.color);
            degradadoRadial.addColorStop(1, '#000000');
            contextoLienzoMuestra.fillStyle = degradadoRadial;
            contextoLienzoMuestra.beginPath();
            contextoLienzoMuestra.arc(esfera.x, esfera.y, esfera.r, 0, Math.PI * 2);
            contextoLienzoMuestra.fill();
        });

        // 5. Rejilla y texto de alto contraste para verificar el aliasing y definición espacial
        contextoLienzoMuestra.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 800; i += 40) {
            contextoLienzoMuestra.fillRect(i, 0, 1, 600);
            contextoLienzoMuestra.fillRect(0, i, 800, 1);
        }

        contextoLienzoMuestra.fillStyle = '#ffffff';
        contextoLienzoMuestra.font = 'bold 26px Inter, sans-serif';
        contextoLienzoMuestra.fillText('PATRÓN DE PRUEBA UTN', 40, 540);
        contextoLienzoMuestra.strokeStyle = '#000000';
        contextoLienzoMuestra.lineWidth = 1.5;
        contextoLienzoMuestra.strokeText('PATRÓN DE PRUEBA UTN', 40, 540);

        // Convertir el lienzo temporal a imagen para el flujo de carga estándar
        const imagen = new Image();
        imagen.onload = () => {
            imagenActual = imagen;
            tamanioArchivoOriginal = 186350; // Simulación de tamaño de archivo (182 KB)
            nombreArchivoOriginal = 'patron_prueba_utn';

            // Configurar lienzo original
            marcadorOriginal.style.display = 'none';
            lienzoOriginal.style.display = 'block';
            lienzoOriginal.width = imagen.width;
            lienzoOriginal.height = imagen.height;
            const contexto = lienzoOriginal.getContext('2d');
            contexto.drawImage(imagen, 0, 0);

            // Limpiar lienzo digitalizado
            lienzoDigitalizado.style.display = 'none';
            marcadorDigitalizado.style.display = 'flex';
            const contextoLienzoDig = lienzoDigitalizado.getContext('2d');
            contextoLienzoDig.clearRect(0, 0, lienzoDigitalizado.width, lienzoDigitalizado.height);

            // Ocultar resultados hasta que se procese
            panelResultados.style.display = 'none';

            // Ejecutar procesamiento inmediato
            botonDigitalizar.click();
        };
        imagen.src = lienzoMuestra.toDataURL('image/png');
    });

    // Autoprocesamiento al cambiar opciones
    seleccionResolucion.addEventListener('change', () => {
        if (imagenActual) botonDigitalizar.click();
    });
    seleccionProfundidadBits.addEventListener('change', () => {
        if (imagenActual) botonDigitalizar.click();
    });

    // Controlar selección de archivo
    entradaImagen.addEventListener('change', (evento) => {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        tamanioArchivoOriginal = archivo.size;
        nombreArchivoOriginal = archivo.name.substring(0, archivo.name.lastIndexOf('.')) || archivo.name;

        const lector = new FileReader();
        lector.onload = (eventoLector) => {
            const imagen = new Image();
            imagen.onload = () => {
                imagenActual = imagen;
                
                // Configurar lienzo original
                marcadorOriginal.style.display = 'none';
                lienzoOriginal.style.display = 'block';
                
                lienzoOriginal.width = imagen.width;
                lienzoOriginal.height = imagen.height;
                const contexto = lienzoOriginal.getContext('2d');
                contexto.drawImage(imagen, 0, 0);

                // Limpiar panel digitalizado
                lienzoDigitalizado.style.display = 'none';
                marcadorDigitalizado.style.display = 'flex';
                const contextoLienzoDig = lienzoDigitalizado.getContext('2d');
                contextoLienzoDig.clearRect(0, 0, lienzoDigitalizado.width, lienzoDigitalizado.height);

                // Ocultar panel de resultados hasta digitalizar
                panelResultados.style.display = 'none';
            };
            imagen.src = eventoLector.target.result;
        };
        lector.readAsDataURL(archivo);
    });

    // Controlar botón de digitalizar
    botonDigitalizar.addEventListener('click', () => {
        if (!imagenActual) {
            alert('Por favor, carga una imagen primero.');
            return;
        }

        const valorResolucion = seleccionResolucion.value;
        const valorProfundidadBits = seleccionProfundidadBits.value;

        procesarImagen(imagenActual, valorResolucion, valorProfundidadBits);
    });

    // Cambios dinámicos en la calidad de compresión con debounce
    let tiempoDebounce;
    calidadJpeg.addEventListener('input', (evento) => {
        valorCalidadJpeg.textContent = evento.target.value + '%';
        if (imagenActual) {
            clearTimeout(tiempoDebounce);
            tiempoDebounce = setTimeout(() => {
                actualizarEstadisticasCompresion();
            }, 150);
        }
    });

    formatoCompresion.addEventListener('change', () => {
        if (formatoCompresion.value === 'image/png') {
            document.getElementById('grupoCalidadJpeg').style.display = 'none';
        } else {
            document.getElementById('grupoCalidadJpeg').style.display = 'flex';
        }
        if (imagenActual) {
            actualizarEstadisticasCompresion();
        }
    });

    function formatearBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const constanteK = 1024;
        const tamanios = ['Bytes', 'KB', 'MB', 'GB'];
        const indice = Math.floor(Math.log(bytes) / Math.log(constanteK));
        return parseFloat((bytes / Math.pow(constanteK, indice)).toFixed(2)) + ' ' + tamanios[indice];
    }

    function procesarImagen(imagen, resolucion, profundidadBits) {
        // 1. Submuestreo espacial
        let anchoDestino, altoDestino;
        
        if (resolucion === 'original') {
            anchoDestino = imagen.width;
            altoDestino = imagen.height;
        } else {
            const dimensionMax = parseInt(resolucion, 10);
            const proporcion = Math.min(dimensionMax / imagen.width, dimensionMax / imagen.height);
            anchoDestino = Math.max(1, Math.round(imagen.width * proporcion));
            altoDestino = Math.max(1, Math.round(imagen.height * proporcion));
        }

        const lienzoFueraPantalla = document.createElement('canvas');
        lienzoFueraPantalla.width = anchoDestino;
        lienzoFueraPantalla.height = altoDestino;
        const contextoFueraPantalla = lienzoFueraPantalla.getContext('2d');
        
        // Dibujar imagen a tamaño reducido
        contextoFueraPantalla.drawImage(imagen, 0, 0, anchoDestino, altoDestino);

        // Obtener datos de píxeles
        const datosImagen = contextoFueraPantalla.getImageData(0, 0, anchoDestino, altoDestino);
        const datos = datosImagen.data;

        // 2. Cuantización de color
        for (let i = 0; i < datos.length; i += 4) {
            const rojo = datos[i];
            const verde = datos[i+1];
            const azul = datos[i+2];
            
            if (profundidadBits === '24') {
                // Color real - conservar RGB original
            } else if (profundidadBits === '8-gray') {
                // Escala de grises de 8 bits (Luminancia)
                const gris = Math.round(0.299 * rojo + 0.587 * verde + 0.114 * azul);
                datos[i] = gris;
                datos[i+1] = gris;
                datos[i+2] = gris;
            } else if (profundidadBits === '8-color') {
                // Color de 8 bits (256 colores: 3 bits R, 3 bits G, 2 bits B)
                // R y G tienen 8 niveles, B tiene 4 niveles
                datos[i] = Math.round(rojo / 255 * 7) * 255 / 7;
                datos[i+1] = Math.round(verde / 255 * 7) * 255 / 7;
                datos[i+2] = Math.round(azul / 255 * 3) * 255 / 3;
            } else if (profundidadBits === '1') {
                // Monocromático de 1 bit (Umbral en 128)
                const gris = Math.round(0.299 * rojo + 0.587 * verde + 0.114 * azul);
                const blancoNegro = gris < 128 ? 0 : 255;
                datos[i] = blancoNegro;
                datos[i+1] = blancoNegro;
                datos[i+2] = blancoNegro;
            }
        }

        contextoFueraPantalla.putImageData(datosImagen, 0, 0);

        // 3. Renderizar en lienzo de salida
        lienzoDigitalizado.width = anchoDestino;
        lienzoDigitalizado.height = altoDestino;
        
        const contextoSalida = lienzoDigitalizado.getContext('2d');
        contextoSalida.imageSmoothingEnabled = false; 
        
        contextoSalida.drawImage(lienzoFueraPantalla, 0, 0);

        if (resolucion !== 'original') {
            lienzoDigitalizado.classList.add('pixelado');
        } else {
            lienzoDigitalizado.classList.remove('pixelado');
        }

        marcadorDigitalizado.style.display = 'none';
        lienzoDigitalizado.style.display = 'block';

        // 4. Actualizar información y estadísticas
        actualizarEstadisticasInterfaz(imagen, anchoDestino, altoDestino, profundidadBits);
    }

    function actualizarEstadisticasInterfaz(imagen, anchoDestino, altoDestino, profundidadBits) {
        // Estadísticas originales
        infoOrigResolucion.textContent = `${imagen.width} x ${imagen.height} píxeles`;
        infoOrigTamanio.textContent = formatearBytes(tamanioArchivoOriginal);
        const bytesBrutosOriginal = imagen.width * imagen.height * 3; // RGB de 24 bits
        infoOrigBytesBrutos.textContent = formatearBytes(bytesBrutosOriginal);

        // Estadísticas digitalizadas
        infoDigResolucion.textContent = `${anchoDestino} x ${altoDestino} píxeles`;
        
        let bitsPorPixel = 24;
        if (profundidadBits === '8-gray' || profundidadBits === '8-color') bitsPorPixel = 8;
        if (profundidadBits === '1') bitsPorPixel = 1;

        const bytesBrutosDigitalizado = Math.ceil((anchoDestino * altoDestino * bitsPorPixel) / 8);
        infoDigBytesBrutos.textContent = formatearBytes(bytesBrutosDigitalizado);

        const porcentajeAhorroTeorico = ((1 - (bytesBrutosDigitalizado / bytesBrutosOriginal)) * 100).toFixed(1);
        infoAhorroBruto.textContent = `${porcentajeAhorroTeorico}% de reducción teórica`;

        // Actualizar estadísticas de compresión reales del archivo
        actualizarEstadisticasCompresion();
        
        // Mostrar panel de resultados
        panelResultados.style.display = 'block';
    }

    function actualizarEstadisticasCompresion() {
        const formato = formatoCompresion.value;
        const calidad = parseInt(calidadJpeg.value, 10) / 100;

        lienzoDigitalizado.toBlob((blob) => {
            if (!blob) return;

            infoTamanioComprimido.textContent = formatearBytes(blob.size);
            
            const porcentajeAhorroReal = ((1 - (blob.size / tamanioArchivoOriginal)) * 100).toFixed(1);
            if (porcentajeAhorroReal >= 0) {
                infoRelacionCompresion.textContent = `${porcentajeAhorroReal}% menor que el original`;
                infoRelacionCompresion.className = 'resaltado-porcentaje';
            } else {
                // En caso de que la salida comprimida sea más grande
                infoRelacionCompresion.textContent = `${Math.abs(porcentajeAhorroReal)}% mayor que el original`;
                infoRelacionCompresion.className = '';
            }
        }, formato, formato === 'image/png' ? undefined : calidad);
    }

    // Manejador del botón de descarga
    botonDescargar.addEventListener('click', () => {
        if (!imagenActual) return;
        const formato = formatoCompresion.value;
        const calidad = parseInt(calidadJpeg.value, 10) / 100;
        
        lienzoDigitalizado.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const enlaceDescarga = document.createElement('a');
            
            let extension = 'jpg';
            if (formato === 'image/png') extension = 'png';
            if (formato === 'image/webp') extension = 'webp';
            
            enlaceDescarga.href = url;
            enlaceDescarga.download = `${nombreArchivoOriginal}_digitalizada.${extension}`;
            document.body.appendChild(enlaceDescarga);
            enlaceDescarga.click();
            document.body.removeChild(enlaceDescarga);
            URL.revokeObjectURL(url);
        }, formato, formato === 'image/png' ? undefined : calidad);
    });
});
