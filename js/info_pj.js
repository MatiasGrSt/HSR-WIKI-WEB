import { colores } from './colores.js';
import { cargarEidolones, updateEidolonesMode } from './eidolones.js';
//import { cargarMinorTraces, cargarMajorTraces } from './habilidades.js';
import { cargarInfo, cargarHabilidades } from './utils/cargasPj.js';

function cambiarPestana(idBoton) {
    const secciones = {
        'info': document.querySelector('.info'),
        'habilidades': document.querySelector('.habilidades'),
        'eidolones': document.getElementById('eidolones-container'),
        'guide': document.querySelector('.guide')
    };

    Object.values(secciones).forEach(seccion => {
        if (seccion) seccion.style.display = 'none';
    });

    const seccionActiva = secciones[idBoton];
    if (seccionActiva) {
        seccionActiva.style.display = 'flex';
        const styleSheet = document.getElementById('estilo');
        styleSheet.href = `../css/${idBoton}.css`;
        seccionActiva.style.animation = 'none';
        seccionActiva.offsetHeight;
        seccionActiva.style.animation = 'fadeInRight 0.5s ease-out';
    }
}

function manejoBotones() {
    const botonesImg = document.querySelectorAll('.botones img');
    botonesImg.forEach(boton => {
        boton.addEventListener('click', function () {
            botonesImg.forEach(img => img.classList.remove('activo'));
            this.classList.add('activo');
            cambiarPestana(this.id);
        });
    });
}

// Variable global para el switch
let globalSwitch = null;

async function main() {
    // 1. Preparamos el terreno visual
    manejoBotones();
    cambiarPestana('info');
    document.getElementById('info').classList.add('activo');

    // 2. Leemos la URL
    const urlParams = new URLSearchParams(window.location.search);
    const personaje = urlParams.get('personaje');
    document.title = personaje ? `${personaje} - HSR Wiki` : 'Personaje - HSR Wiki';

    try {
        // 3. HACEMOS EL FETCH AQUÍ ADENTRO (Esperamos los datos)
        // OJO: Asegúrate de pasar &tipo=all si tu PHP lo requiere para devolver todo el paquete
        const res = await fetch(`../php/obtener_info_pj.php?nombre=${personaje}`);
        const data = await res.json();

        // 4. Desempaquetamos los datos
        const info = data.info;
        const habilidades = data.skills;
        const traces_ma = data.major_traces;
        const eidolones = data.eidolons;
        const tracen_mi = data.minor_traces;
        const skill_levels = data.skill_levels;

        const pack_skills = [habilidades, skill_levels];

        const via = info.path.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const rareza = Number(info.rarity);

        // 5. Aplicamos los datos al HTML
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `../css/Vias/${via}.css`;
        document.head.appendChild(link);

        document.querySelector('.splash_art').src = `../imagenes/personajes/${info.name}/Splash_Art.webp`;
        
        // Llamamos a cargarInfo pasándole los datos que necesita
        await cargarInfo(info, rareza);

        const isNovaflareChar = Number(info.novaflare) === 1;

        // Cargar el resto de módulos
        await cargarHabilidades(pack_skills, info.name, info.element);
        //await cargarMajorTraces(info.name, isNovaflareChar);
        //await cargarMinorTraces(info.name, info.element);
        await cargarEidolones(info.name, isNovaflareChar);

        // Si hay Novaflare, agregar listener al switch para actualizar eidolones
        if (isNovaflareChar) {
            const switchContainer = document.getElementById('novaflare-switch-container');
            if (switchContainer) {
                const checkbox = switchContainer.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        const mode = checkbox.checked ? 'novaflare' : 'normal';
                        updateEidolonesMode(mode);
                    });
                }
            }
        }

    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

// Ahora sí, el event listener funciona porque nada ha bloqueado el archivo
document.addEventListener('DOMContentLoaded', () => main());