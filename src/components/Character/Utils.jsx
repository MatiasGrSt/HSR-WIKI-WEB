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
        'CRIT D': 'Crit Damage', 'CRIT R': 'Crit Rate',
        'EFFECT RES': 'Effect Resistance', 'EFFECT RATE': 'Effect Hit Rate',
        'BREAK': 'Break', 'SPD': 'Speed', 'ELATION': 'Elation',
        'DMG': `${element} Damage`
    };

    const tipoLimpio = traducciones[texto] || texto;
    const valorLimpio = (texto !== 'SPD' && texto !== 'ELATION') ? `+${valor}%` : `+${valor}`;

    return { tipoLimpio, valorLimpio };
}