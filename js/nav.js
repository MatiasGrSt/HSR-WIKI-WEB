document.addEventListener("DOMContentLoaded", () => {
    // 1. Detectar si estamos en la carpeta 'html' o en la raíz analizando la URL
    const pathArray = window.location.pathname.split('/');
    const enCarpetaHtml = pathArray[pathArray.length - 2] === 'html';

    // 2. Definir las rutas relativas en base a la ubicación actual
    const rutaRaiz = enCarpetaHtml ? '../' : './';
    const rutaHtml = enCarpetaHtml ? './' : './html/';

    // 3. Obtener el nombre del archivo actual para saber en qué página estamos
    let archivoActual = pathArray[pathArray.length - 1];
    if (archivoActual === '') archivoActual = 'home.html'; // Por defecto si carga la raíz

    // Función auxiliar para añadir una clase 'activo' al enlace correspondiente
    const esActivo = (nombre) => archivoActual === nombre ? 'class="activo"' : '';

    const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `../css/basico.css`;
        document.head.appendChild(link);

    // 4. Crear el elemento nav
    const navegador = document.createElement('nav');
    navegador.innerHTML = `
        <div class='nav-header'>
            <a href="${rutaRaiz}home.html">
                <img src="${rutaRaiz}imagenes/Utilities/Logo.webp" class="logo" alt="Logo">
            </a>
            <img src="${rutaRaiz}imagenes/Utilities/Profile_Card_Default.webp" class="fondo-logo" alt="Profile">
        </div>
        <hr>
        `;

    const ul = document.createElement('ul');
    ul.id = 'fondo';
    ul.innerHTML = `
        <li><a href="${rutaRaiz}home.html" ${esActivo('home.html')}>Home</a></li>
        <li><a href="${rutaHtml}personajes.html" ${esActivo('personajes.html')}>Personajes</a></li>
        <li><a href="${rutaHtml}tier-list.html" ${esActivo('tier-list.html')}>Tier List</a></li>
        <li><a href="${rutaHtml}light_cones.html" ${esActivo('light_cones.html')}>Conos de Luz</a></li>
        <li><a href="${rutaHtml}guias.html" ${esActivo('guias.html')}>Guías</a></li>
        
        <hr class="bottom-divider"> 
        
        <li><a href="${rutaRaiz}home.html#opiniones">Opiniones</a></li>
        <li><a href="${rutaRaiz}home.html#creditos">Créditos</a></li>
    `;
    const urlParams = new URLSearchParams(window.location.search);
    const personaje = urlParams.get('personaje');
    
    // Si no hay personaje, puedes poner un fondo por defecto o dejarlo vacío
    if(personaje) {
        // Envolvemos la ruta en comillas simples y codificamos el nombre
        const personajeUrl = encodeURIComponent(personaje);
        ul.style.backgroundImage = `url('../imagenes/personajes/${personajeUrl}/Phone.webp')`;
    }
    
    navegador.appendChild(ul);

    // 5. Inyectar el nav al inicio del body
    document.body.prepend(navegador);
});