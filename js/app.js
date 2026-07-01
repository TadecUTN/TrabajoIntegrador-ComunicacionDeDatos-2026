// Digitalizador de Imágenes - UTN - Principal Controller (Modular)
document.addEventListener('DOMContentLoaded', () => {
    // Hooks de elementos del DOM - Controles
    const entradaImagen = document.getElementById('entradaImagen');
    const botonCargarImagen = document.getElementById('botonCargarImagen');
    const botonCargarMuestra = document.getElementById('botonCargarMuestra');
    const botonDigitalizar = document.getElementById('botonDigitalizar');
    const seleccionResolucion = document.getElementById('seleccionResolucion');
    const seleccionProfundidadBits = document.getElementById('seleccionProfundidadBits');

    // Hooks - Visualizadores Lado a Lado
    const areaLadoALado = document.getElementById('areaLadoALado');
    const contenedorOriginal = document.getElementById('contenedorOriginal');
    const lienzoOriginal = document.getElementById('lienzoOriginal');
    const marcadorOriginal = document.getElementById('marcadorOriginal');

    const contenedorDigitalizado = document.getElementById('contenedorDigitalizado');
    const lienzoDigitalizado = document.getElementById('lienzoDigitalizado');
    const marcadorDigitalizado = document.getElementById('marcadorDigitalizado');

    // Hooks - Resultados e Información
    const panelResultados = document.getElementById('panelResultados');
    const infoOrigResolucion = document.getElementById('infoOrigResolucion');
    const infoOrigTamanio = document.getElementById('infoOrigTamanio');
    const infoOrigBytesBrutos = document.getElementById('infoOrigBytesBrutos');
    
    const infoDigResolucion = document.getElementById('infoDigResolucion');
    const infoDigBytesBrutos = document.getElementById('infoDigBytesBrutos');
    const infoAhorroBruto = document.getElementById('infoAhorroBruto');
    
    const botonDescargar = document.getElementById('botonDescargar');

    // Variables de Estado
    let imagenActual = null;
    let tamanioArchivoOriginal = 0;
    let nombreArchivoOriginal = 'imagen_digitalizada';

    // Controladores de Zoom y Comparador
    let zoomOriginalCtrl = null;
    let zoomDigitalizadoCtrl = null;

    // --- INICIALIZACIÓN ---
    
    // Iniciar Administrador de Temas
    ImageDigitalizador.ThemeManager.init();

    // Iniciar controladores de zoom individual
    zoomOriginalCtrl = ImageDigitalizador.initZoomPan(contenedorOriginal, lienzoOriginal, 'badgeOriginal');
    zoomDigitalizadoCtrl = ImageDigitalizador.initZoomPan(contenedorDigitalizado, lienzoDigitalizado, 'badgeDigitalizado');
    
    // Configurar descarga de la imagen digitalizada
    botonDescargar.addEventListener('click', () => {
        if (!lienzoDigitalizado || !imagenActual) return;
        const link = document.createElement('a');
        link.download = `${nombreArchivoOriginal}_digitalizada.png`;
        link.href = lienzoDigitalizado.toDataURL('image/png');
        link.click();
    });

    // Escuchar redimensionamiento para el split view
    window.addEventListener('resize', () => {
        if (seleccionModoVista.value === 'split' && imagenActual) {
            updateSplitCanvasSize();
        }
    });

    // --- CARGA DE IMÁGENES ---

    botonCargarImagen.addEventListener('click', () => {
        entradaImagen.click();
    });

    entradaImagen.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) cargarArchivoImagen(archivo);
    });

    // Drag and Drop
    contenedorOriginal.addEventListener('dragover', (e) => {
        e.preventDefault();
        contenedorOriginal.classList.add('dragover');
    });

    contenedorOriginal.addEventListener('dragleave', () => {
        contenedorOriginal.classList.remove('dragover');
    });

    contenedorOriginal.addEventListener('drop', (e) => {
        e.preventDefault();
        contenedorOriginal.classList.remove('dragover');
        const archivo = e.dataTransfer.files[0];
        if (archivo && archivo.type.startsWith('image/')) {
            cargarArchivoImagen(archivo);
        }
    });

    function cargarArchivoImagen(archivo) {
        tamanioArchivoOriginal = archivo.size;
        nombreArchivoOriginal = archivo.name.substring(0, archivo.name.lastIndexOf('.')) || archivo.name;

        const lector = new FileReader();
        lector.onload = (eLector) => {
            const img = new Image();
            img.onload = () => {
                establecerImagenActual(img);
            };
            img.src = eLector.target.result;
        };
        lector.readAsDataURL(archivo);
    }

    // Cargar patrón de muestra procedimental
    botonCargarMuestra.addEventListener('click', () => {
        ImageDigitalizador.SampleManager.cargarMuestra((img, size, name) => {
            tamanioArchivoOriginal = size;
            nombreArchivoOriginal = name;
            establecerImagenActual(img);
        });
    });

    function establecerImagenActual(img) {
        imagenActual = img;

        // Ocultar marcadores, mostrar canvases
        marcadorOriginal.style.display = 'none';
        lienzoOriginal.style.display = 'block';

        // Dibujar en canvas original (Lado a lado)
        lienzoOriginal.width = img.width;
        lienzoOriginal.height = img.height;
        const ctxOrig = lienzoOriginal.getContext('2d');
        ctxOrig.drawImage(img, 0, 0);

        // Limpiar canvas digitalizado
        lienzoDigitalizado.style.display = 'none';
        const ctx = lienzoDigitalizado.getContext('2d');
        ctx.clearRect(0, 0, lienzoDigitalizado.width, lienzoDigitalizado.height);
        marcadorDigitalizado.style.display = 'flex';

        panelResultados.style.display = 'none';
        
        if (zoomOriginalCtrl) zoomOriginalCtrl.reset();
        if (zoomDigitalizadoCtrl) zoomDigitalizadoCtrl.reset();

        digitalizarImagen();
    }

    // --- PROCESAMIENTO DIGITAL ---

    seleccionResolucion.addEventListener('change', () => {
        if (imagenActual) digitalizarImagen();
    });
    seleccionProfundidadBits.addEventListener('change', () => {
        if (imagenActual) digitalizarImagen();
    });
    botonDigitalizar.addEventListener('click', () => {
        if (imagenActual) {
            digitalizarImagen();
        } else {
            alert('Carga una imagen antes de digitalizar.');
        }
    });

    async function digitalizarImagen() {
        if (!imagenActual) return;

        botonDigitalizar.disabled = true;
        botonDigitalizar.textContent = 'Procesando...';

        const resolucionVal = seleccionResolucion.value;
        const profundidadVal = seleccionProfundidadBits.value;
        const canalVal = 'bt601';

        // 1. Submuestreo espacial (Dimensiones de destino)
        let anchoDest, altoDest;
        if (resolucionVal === 'original') {
            anchoDest = imagenActual.width;
            altoDest = imagenActual.height;
        } else {
            const limite = parseInt(resolucionVal, 10);
            const ratio = Math.min(limite / imagenActual.width, limite / imagenActual.height);
            anchoDest = Math.max(1, Math.round(imagenActual.width * ratio));
            altoDest = Math.max(1, Math.round(imagenActual.height * ratio));
        }

        // Obtener imageData reducida
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = anchoDest;
        canvasTemp.height = altoDest;
        const ctxTemp = canvasTemp.getContext('2d');
        ctxTemp.drawImage(imagenActual, 0, 0, anchoDest, altoDest);
        const imgData = ctxTemp.getImageData(0, 0, anchoDest, altoDest);

        // 2. Procesamiento de Cuantización y Luminancia/Canales (Web Worker / Fallback)
        try {
            const processedPixels = await ImageDigitalizador.processImageAsync(
                imgData.data,
                anchoDest,
                altoDest,
                profundidadVal,
                canalVal
            );

            const processedImgData = new ImageData(processedPixels, anchoDest, altoDest);

            // 3. Renderizar en canvas digitalizado
            lienzoDigitalizado.width = anchoDest;
            lienzoDigitalizado.height = altoDest;
            const ctx = lienzoDigitalizado.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.putImageData(processedImgData, 0, 0);
            
            lienzoDigitalizado.style.display = 'block';
            marcadorDigitalizado.style.display = 'none';

            if (resolucionVal !== 'original') {
                lienzoDigitalizado.classList.add('pixelado');
            } else {
                lienzoDigitalizado.classList.remove('pixelado');
            }

            // 4. Actualizar Interfaz
            actualizarEstadisticasInterfaz(anchoDest, altoDest, profundidadVal);
            
            panelResultados.style.display = 'block';

        } catch (error) {
            console.error("Error durante la digitalización:", error);
            alert("Ocurrió un error al procesar la imagen.");
        } finally {
            botonDigitalizar.disabled = false;
            botonDigitalizar.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Digitalizar
            `;
        }
    }

    function formatearBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function actualizarEstadisticasInterfaz(anchoDest, altoDest, profundidadBits) {
        infoOrigResolucion.textContent = `${imagenActual.width} x ${imagenActual.height} píxeles`;
        infoOrigTamanio.textContent = formatearBytes(tamanioArchivoOriginal);
        
        const bytesBrutosOriginal = imagenActual.width * imagenActual.height * 3;
        infoOrigBytesBrutos.textContent = formatearBytes(bytesBrutosOriginal);

        infoDigResolucion.textContent = `${anchoDest} x ${altoDest} píxeles`;
        
        let bitsPorPixel = 24;
        if (profundidadBits === '8-gray' || profundidadBits === '8-color') bitsPorPixel = 8;
        if (profundidadBits === '1') bitsPorPixel = 1;

        const bytesBrutosDigitalizado = Math.ceil((anchoDest * altoDest * bitsPorPixel) / 8);
        infoDigBytesBrutos.textContent = formatearBytes(bytesBrutosDigitalizado);

        const porcentajeAhorro = ((1 - (bytesBrutosDigitalizado / bytesBrutosOriginal)) * 100).toFixed(1);
        infoAhorroBruto.textContent = `${porcentajeAhorro}% de reducción`;
    }
});
