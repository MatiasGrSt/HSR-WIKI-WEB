import {colores} from './colores.js';
import {cargarEidolones} from './eidolones.js';
import {cargarHabilidades,cargarMinorTraces,cargarMajorTraces} from './habilidades.js';

function cambiarPestana(idBoton) {
    // 1. Lista de todas las secciones que quieres controlar
    const secciones = {
        'principal': document.querySelector('.info'),
        'hab': document.querySelector('.habilidades'),
        'eido': document.querySelector('.eidolones')
    };

    // 2. Iteramos por el diccionario para ocultar todo primero
    Object.values(secciones).forEach(seccion => {
        if (seccion) {
            seccion.style.display = 'none'; 
        }
    });

    // 3. Mostramos solo la sección que coincide con el ID del botón
    const seccionActiva = secciones[idBoton];
    if (seccionActiva) {
        
        // --- CAMBIO AQUÍ ---
        // Si es la pestaña de habilidades, usamos flex. Si no, block.
        if (idBoton === 'hab') {
            seccionActiva.style.display = 'flex';
        } else {
            seccionActiva.style.display = 'flex';
        }
        // -------------------

        const styleSheet = document.getElementById('estilo');

        if (idBoton === 'hab') {
            styleSheet.href = `../css/habilidades.css`;
        } else if (idBoton === 'eido') {
            styleSheet.href = `../css/eidolones.css`;
        } else {
            styleSheet.href = `../css/info.css`;
        }
        
        // Añadimos una pequeña animación de entrada
        seccionActiva.style.animation = 'none'; // Reseteamos la animación
        seccionActiva.offsetHeight; // Forzamos reflow para que reinicie
        seccionActiva.style.animation = 'fadeInRight 0.5s ease-out';
    }
}

function mostrarHabilidadesEspeciales(path) {
    // 1. Seleccionamos las listas de elementos
    const elementosRem = document.querySelectorAll('.rem');
    const elementosElat = document.querySelectorAll('.elat_hab');

    // 2. Ocultamos todos primero usando un bucle forEach
    elementosRem.forEach(el => el.style.visibility = 'hidden');
    elementosElat.forEach(el => el.style.visibility = 'hidden');

    // 3. Convertimos a string y comparamos (ojo con las tildes)
    const pathString = path ? path.toString() : "";

    if (pathString === 'Reminiscencia') {
        elementosRem.forEach(el => el.style.visibility = 'visible');
    } else if (pathString === 'Exultación') {
        elementosElat.forEach(el => el.style.visibility = 'visible');
    }
}

async function info() {
    cambiarPestana('principal');
    document.getElementById('principal').classList.add('activo');
    const urlParams = new URLSearchParams(window.location.search);
    const personaje = urlParams.get('personaje');
    document.title = personaje ? `${personaje} - HSR Wiki` : 'Personaje - HSR Wiki';
    try {
        const res = await fetch(`http://localhost/php/obtener_info_pj.php?nombre=${personaje}&tipo=info`);
        const data = await res.json();
        console.log("Datos del personaje:", personaje); // Debug: Ver qué se recibe del backend

        const via = data.path.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const rareza = Number(data.rarity);

        const colorRareza = colores.rarezas[data.rarity];
        const colorElemento = colores.elementos[data.element];
        const colorVia = colores.vias[data.path];

        document.documentElement.style.setProperty('--color-rareza', colorRareza);
        document.documentElement.style.setProperty('--color-via', colorVia);
        document.documentElement.style.setProperty('--color-elemento', colorElemento);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `../css/Vias/${via}.css`;
        document.head.appendChild(link);

        document.querySelector('.splash_art').src = `../imagenes/personajes/${data.name}/Splash_Art.webp`;

        const nombre_cont = document.getElementById('name')
        nombre_cont.innerText = data.name;

        document.getElementById('element_icon').src = `../imagenes/personajes/Tipos/${data.element}.webp`
        document.getElementById('element_name').innerText = data.element.toUpperCase();
        document.getElementById('path_icon').src = `../imagenes/personajes/Vias/${via}.webp`
        document.getElementById('path_name').innerText = data.path.toUpperCase();

        const rareza_cont = document.getElementById('rarity');
        rareza_cont.innerHTML = ''; 
        for (let i = 0; i < rareza; i++) {
            const img = document.createElement("img");
            img.src = `../imagenes/Utilities/${rareza}.webp`;
            
            // Aplicamos lógica especial solo si la rareza es 5
            if (rareza === 5) {
                if (i === 1 || i === 3) { 
                    // 2ª y 4ª estrella
                    img.style.width = "30px";
                } else if (i === 2) { 
                    // 3ª estrella
                    img.style.width = "25px";
                }
            } else {
            }

            rareza_cont.appendChild(img);
        }
        document.getElementById('introduction').innerHTML = data.description;
        document.getElementById('eng').innerHTML = data.eng_va || '-';
        document.getElementById('jpn').innerHTML = data.jpn_va || '-';
        document.getElementById('chn').innerHTML = data.cn_va || '-';
        document.getElementById('kor').innerHTML = data.kr_va || '-';

        const botonesImg = document.querySelectorAll('.botones img');

        botonesImg.forEach(boton => {
            boton.addEventListener('click', function() {
                // 1. Quitamos la clase 'selected' de todos los botones para limpiar
                botonesImg.forEach(img => img.classList.remove('activo'));
                
                // 2. Añadimos la clase 'selected' solo al que hemos clicado
                this.classList.add('activo');
                
                cambiarPestana(this.id);
            });
        });

        mostrarHabilidadesEspeciales(data.path);

        cargarHabilidades(data.name, data.element);
        cargarMajorTraces(data.name);
        cargarMinorTraces(data.name, data.element);

        cargarEidolones(data.name);
        



    } catch (error) {
        console.error("Error al cargar desde la BD:", error);
    }
};

document.addEventListener('DOMContentLoaded', () => info());