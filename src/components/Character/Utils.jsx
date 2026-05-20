// src/utils/characterUtils.js
export function organizarHabilidades(habilidades) {
    const normal = habilidades.filter(h => h.enhanced === null || h.enhanced === 0);
    const novaflare = habilidades.filter(h => Number(h.enhanced) === 1);
    return { normal, novaflare };
}

export function juntarHabilidades(lista) {
    let grupos = {};
    lista.forEach(habilidad => {
        if (!grupos[habilidad.type]) grupos[habilidad.type] = [];
        grupos[habilidad.type].push(habilidad);
    });
    return grupos;
}

export function transformarTrace(texto, valor, element) {
    const traducciones = {
        'ATK': 'Attack', 'DEF': 'Defense', 'HP': 'HP',
        'CRIT DMG': 'Crit Damage', 'CRIT Rate': 'Crit Rate',
        'Effect RES': 'Effect Resistance', 'Effect Hit Rate': 'Effect Hit Rate',
        'Break': 'Break', 'SPD': 'Speed', 'Elation': 'Elation'
    };

    let tipoLimpio = traducciones[texto] || texto;
    if (tipoLimpio.includes('DMG')){tipoLimpio = `${element} Damage`}
    const valorLimpio = (texto !== 'SPD') ? `+${valor}%` : `+${valor}`;

    return { tipoLimpio, valorLimpio };
}