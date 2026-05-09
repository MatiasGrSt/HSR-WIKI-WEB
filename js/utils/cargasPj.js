import { organizarHabilidades, juntarHabilidades, crearIconosHabilidades } from "./skillsUtils.js"


// Le pasamos info y rareza como parámetros para no depender de variables globales
export function cargarInfo(info, rareza) {
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
}

export async function cargarHabilidades(habilidades, charName, element) {
    const { normal, novaflare } = organizarHabilidades(habilidades[0]);
    
    const gruposNormal = juntarHabilidades(normal);
    const gruposNovaflare = juntarHabilidades(novaflare);

    const groups = { normal: gruposNormal, novaflare: gruposNovaflare };

    crearIconosHabilidades(groups, charName, element);
}