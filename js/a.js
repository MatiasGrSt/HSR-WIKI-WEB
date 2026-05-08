import { inicializarModal } from "./utils/modal.js";
import { organizarHabilidades,juntarHabilidades } from "./utils/skills.js";

export async function cargarHabilidades(habilidades, charName) {
    const { normal, novaflare } = organizarHabilidades(habilidades);
    
    const gruposNormal = juntarHabilidades(normal);
    const gruposNovaflare = juntarHabilidades(novaflare);

    const groups = { normal: gruposNormal, novaflare: gruposNovaflare };

    const todosLosTipos = new Set([
        ...Object.keys(groups.normal || {}), 
        ...Object.keys(groups.novaflare || {})
    ]);

    let htmlFinal = '';

    for (const tipo of todosLosTipos) {
        const skillsNormales = groups.normal[tipo] || [];
        const skillsNovaflare = groups.novaflare[tipo] || [];
        const tipoLimpio = tipo.replaceAll(' ', '_'); // Para las rutas de imágenes

        htmlFinal += `<div class="skill-item-container" id="${tipoLimpio}">`;

        // ---------------------------------------------------------
        // 1. CREAMOS LA PARTE NORMAL (Visible por defecto)
        // ---------------------------------------------------------
        if (skillsNormales.length > 0) {
            // Creamos los mini-iconos del popup
            const miniIconosNormal = skillsNormales.map((skill, index) => {
                const imgName = index === 0 ? tipoLimpio : `${tipoLimpio}_${index + 1}`;
                // AQUÍ ESTÁ LA MAGIA: Guardamos los parámetros en atributos "data-"
                return `<img src="../imagenes/personajes/${charName}/${imgName}.webp" 
                             class="skill-trigger" 
                             data-tipo="${tipo}" 
                             data-isnf="false"
                             style="display: none;"
                             onerror="this.src='../imagenes/personajes/${charName}/${tipoLimpio}.webp'">`;
            }).join('');

            htmlFinal += `
                <div class="skill-version skill-normal-version">
                    <img src="../imagenes/personajes/${charName}/${tipoLimpio}.webp" class="skill-trigger" data-tipo="${tipo}" data-isnf="false">
                    <div class="popup skill-popup">
                        <h3 class="type">${tipo}</h3>
                        <div class="icons">${miniIconosNormal}</div>
                    </div>
                </div>
            `;
        }

        // ---------------------------------------------------------
        // 2. CREAMOS LA PARTE NOVAFLARE (Oculta por defecto)
        // ---------------------------------------------------------
        if (skillsNovaflare.length > 0) {
            const miniIconosNf = skillsNovaflare.map((skill, index) => {
                return `<img src="../imagenes/personajes/${charName}/${tipoLimpio}.webp" 
                             class="skill-trigger" 
                             data-tipo="${tipo}" 
                             data-isnf="true"
                             onerror="this.src='../imagenes/personajes/${charName}/${tipoLimpio}.webp'">`;
            }).join('');

            htmlFinal += `
                <div class="skill-version skill-nf-version" style="display: none;">
                    <img src="../imagenes/personajes/${charName}/${tipoLimpio}.webp" class="skill-trigger" data-tipo="${tipo}" data-isnf="true">
                    <span class="skill-novaflare-badge novaflare-badge-global">Novaflare</span>
                    <div class="popup skill-popup">
                        <h3 class="type">${tipo}</h3>
                        <div class="icons">${miniIconosNf}</div>
                    </div>
                </div>
            `;
        }

        htmlFinal += `</div>`; // Cerramos el contenedor principal
    }
    document.getElementById('hab_cont').insertAdjacentHTML('beforeend', htmlFinal);
}