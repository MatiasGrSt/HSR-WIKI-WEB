import { colores } from './colores.js';
import { cargarEidolones, updateEidolonesMode } from './eidolones.js';
import { cargarHabilidades, cargarMinorTraces, cargarMajorTraces } from './habilidades.js';

const res = await fetch(`../php/obtener_info_pj.php?nombre=${personaje}`);
const data = await res.json();

const info = data.info;
const habilidades = data.skills;
const traces_ma = data.traces;
const eidolones = data.eidolons;
const tracen_mi = data.traces_mi;

const via = info.path.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const rareza = Number(info.rarity);

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

function cargarInfo() {
    document.getElementById('name').innerText = info.name;

    const estrellasHTML = Array(rareza).fill(`<img src="../imagenes/Utilities/${rareza}.webp" class="star-icon">`).join('');
    const div_element_path_rarity = document.querySelector('.element_path_rarity');

    div_element_path_rarity.innerHTML = `
        <div class="element_path">
            <div id="element">
                <img id="element_icon" src = '../imagenes/personajes/Tipos/${info.element}.webp'>
                <p id="element_name" class="element" style="margin-right: 5px;">${info.element.toUpperCase()}</p>
            </div>
            <div id="path">
                <img id="path_icon" src = '../imagenes/personajes/Vias/${info.path}.webp' style="margin-left: 5px;">
                <p id="path_name" class="path">${info.path.toUpperCase()}</p>
            </div>
        </div>
        <div id="rarity">${estrellasHTML}</div>
    `;

    document.getElementById('introduction').innerHTML = info.description;
    document.getElementById('eng').innerHTML = info.eng_va || '-';
    document.getElementById('jpn').innerHTML = info.jpn_va || '-';
    document.getElementById('chn').innerHTML = info.cn_va || '-';
    document.getElementById('kor').innerHTML = info.kr_va || '-';

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
    cambiarPestana('info');
    document.getElementById('info').classList.add('activo');

    const urlParams = new URLSearchParams(window.location.search);
    const personaje = urlParams.get('personaje');
    document.title = personaje ? `${personaje} - HSR Wiki` : 'Personaje - HSR Wiki';

    try {

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `../css/Vias/${via}.css`;
        document.head.appendChild(link);

        document.querySelector('.splash_art').src = `../imagenes/personajes/${info.name}/Splash_Art.webp`;
        cargarInfo();

        const isNovaflareChar = Number(info.novaflare) === 1;

        // Cargar habilidades (que crearán el switch si es necesario)
        await cargarHabilidades(info.name, info.element, isNovaflareChar);

        // Cargar traces
        await cargarMajorTraces(info.name, isNovaflareChar);
        await cargarMinorTraces(info.name, info.element);

        // Cargar eidolones
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
        console.error("Error:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => main());
