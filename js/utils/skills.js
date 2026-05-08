import { openSkillModal } from "./modal.js";

export function organizarHabilidades(habilidades) {
    const normal = habilidades.filter(h => h.enhanced === null);
    const novaflare = habilidades.filter(h => h.enhanced === 1);
    return { normal, novaflare };
}

export function juntarHabilidades(lista) {
    let grupos = {};
    lista.forEach(habilidad => {
        if (!grupos[habilidad.type]) {
            grupos[habilidad.type] = [];
        }
        grupos[habilidad.type].push(habilidad);
    });
    return grupos;
}

function activarClicsModal(groups, charName) {
    const triggers = document.querySelectorAll('.skill-trigger');

    triggers.forEach(img => {
        img.addEventListener('click', (evento) => {
            evento.stopPropagation(); // Evita que el clic dispare cosas del fondo

            // Leemos los atributos que pusimos en el HTML
            const tipo = img.dataset.tipo; 
            const isNovaflare = img.dataset.isnf === "true"; 

            // Decidimos qué datos pasarle al modal
            const skillsArray = isNovaflare ? groups.novaflare[tipo] : groups.normal[tipo];
            const modeString = isNovaflare ? 'novaflare' : 'normal';
            
            // Llamamos a tu modal (asegúrate de que modal.js reciba estos parámetros)
            openSkillModal(tipo, skillsArray, modeString, charName); 
        });
    });
}

export function crearIconosHabilidades(habilidades, charName) {
    const todosLosTipos = new Set([
        ...Object.keys(habilidades.normal || {}), 
        ...Object.keys(habilidades.novaflare || {})
    ]);

    let htmlFinal = '';

    for (const tipo of todosLosTipos) {
        const skillsNormales = habilidades.normal[tipo] || [];
        const skillsNovaflare = habilidades.novaflare[tipo] || [];
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
                const imgName = index === 0 ? tipoLimpio : `${tipoLimpio}_${index + 1}`;
                return `<img src="../imagenes/personajes/${charName}/${imgName}.webp" 
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

    activarClicsModal(habilidades, charName);
}