import { toggleSwitchVisibility } from './utils.js';

let allEidolones = [];
let currentCharName = '';

export async function cargarEidolones(personaje, isNovaflareChar = false) {
    currentCharName = personaje;

    try {
        const res = await fetch(`../php/obtener_info_pj.php?personaje=${personaje}&tipo=eidolons`);
        allEidolones = await res.json();

        if (!allEidolones || allEidolones.length === 0) {
            const container = document.getElementById('eidolones-container');
            if (container) container.innerHTML = "<p>No hay datos de eidolones.</p>";
            return;
        }

        renderEidolones('normal');
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderEidolones(mode = 'normal') {
    const container = document.getElementById('eidolones-container');
    if (!container) return;

    // Agrupar por nivel y nombre para separar normal vs enhanced
    const byLevel = {};

    allEidolones.forEach(e => {
        const lvl = e.lvl;
        const name = e.name;

        if (!byLevel[lvl]) {
            byLevel[lvl] = {};
        }
        if (!byLevel[lvl][name]) {
            byLevel[lvl][name] = { normal: null, enhanced: null };
        }

        if (e.enchanced) {
            byLevel[lvl][name].enhanced = e;
        } else {
            byLevel[lvl][name].normal = e;
        }
    });

    // Renderizar: solo UNA versión por nivel
    const html = Object.keys(byLevel)
        .sort((a, b) => a - b)
        .map(lvl => {
            const versionsAtLevel = Object.values(byLevel[lvl]);

            // Decidir qué versión mostrar
            let eidolon;
            if (mode === 'novaflare') {
                const enhanced = versionsAtLevel.find(v => v.enhanced);
                eidolon = enhanced?.enhanced || versionsAtLevel[0]?.normal;
            } else {
                const normal = versionsAtLevel.find(v => v.normal);
                eidolon = normal?.normal || versionsAtLevel[0]?.enhanced;
            }

            if (!eidolon) return '';

            const isEnhancedActive = Boolean(eidolon.enchanced);
            const novaflareClass = isEnhancedActive ? ' novaflare-active' : '';
            const badgeHTML = isEnhancedActive
                ? `<span class="eido-novaflare-badge novaflare-badge-global">Novaflare</span>`
                : '';

            return `
                <div class="shard shard-${lvl}${novaflareClass}"
                    style="--bg: url('../imagenes/personajes/${currentCharName}/Eidolon_${lvl}.webp');">
                    <div class="shard-number">${lvl}</div>
                    ${badgeHTML}
                    <div class="eidolon-popup">
                        <span class="lvl-tag">Eidolon ${lvl}</span>
                        ${isEnhancedActive ? '<span class="eido-novaflare-tag novaflare-badge-global">Novaflare</span>' : ''}
                        <h3>${eidolon.name}</h3>
                        <p>${eidolon.description}</p>
                    </div>
                </div>
            `;
        })
        .join('');

    container.innerHTML = html;
}

export function updateEidolonesMode(mode) {
    renderEidolones(mode);
}
