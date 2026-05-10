export function crearIconosMajorTraces(traces) {
    let htmlFinal = '';
    let idx = 1;

    for (const [nombreGrupo, listaRastros] of Object.entries(traces)) {
        
        // FLEXIBILIDAD: 
        // Normal: Si enhanced es null, 0, undefined o false
        const TraceNormales = listaRastros.filter(t => !t.enhanced || Number(t.enhanced) === 0);
        
        // Novaflare: Si enhanced es 1 o "1"
        const TraceNovaflare = listaRastros.filter(t => Number(t.enhanced) === 1);

        htmlFinal += `<div class="trace_ma" id="Pasiva_${idx}">`;

        // 1. PARTE NORMAL
        if (TraceNormales.length > 0) {
            const rastroN = TraceNormales[0];
            htmlFinal += `
                <div class="Matrace-version Matrace-normal-version">
                    <img src="../imagenes/personajes/${rastroN.character_id}/Pasiva_${idx}.webp">
                    <div class="popup Matrace-popup">
                        <h3 class="type">${nombreGrupo}</h3>
                        <p>${rastroN.description}</p>
                    </div>
                </div>
            `;
        }

        // 2. PARTE NOVAFLARE
        if (TraceNovaflare.length > 0) {
            const rastroNF = TraceNovaflare[0]; 
            htmlFinal += `
                <div class="Matrace-version Matrace-novaflare-version" style="display: none;">
                    <img src="../imagenes/personajes/${rastroNF.character_id}/Pasiva_${idx}.webp">
                    <span class="skill-novaflare-badge novaflare-badge-global">Novaflare</span>
                    <div class="popup Matrace-popup">
                        <h3 class="type">${nombreGrupo}</h3>
                        <p>${rastroNF.description}</p>
                    </div>
                </div>
            `;
        }

        htmlFinal += `</div>`; 
        idx++;
    }
    
    document.getElementById('hab_cont').insertAdjacentHTML('beforeend', htmlFinal);
}

function transformarTrace(texto, valor, element) {
    let tipoLimpio = '';
    let valorLimpio = '';

    switch (texto) {
        case 'ATK':
            tipoLimpio = 'Ataque';
            break; // IMPORTANTE: Poner break en cada uno
        case 'DEF':
            tipoLimpio = 'Defensa';
            break;
        case 'HP':
            tipoLimpio = 'Vida';
            break;
        case 'CRIT D':
            tipoLimpio = 'Daño Crítico';
            break;
        case 'CRIT R':
            tipoLimpio = 'Probabilidad Crítica';
            break;
        case 'EFFECT RES':
            tipoLimpio = 'Resistencia a Efectos';
            break;
        case 'EFFECT RATE':
            tipoLimpio = 'Acierto de Efecto';
            break;
        case 'BREAK':
            tipoLimpio = 'Ruptura';
            break;
        case 'SPD':
            tipoLimpio = 'Velocidad';
            break;
        case 'ELATION':
            tipoLimpio = 'Exultación';
            break;
        case 'DMG':
            tipoLimpio = `Daño ${element}`;
            break;
        default:
            tipoLimpio = texto; // CORREGIDO: rastro no existe aquí, es texto
            break;
    }

    if (texto !== 'SPD' && texto !== 'ELATION') {
        valorLimpio = '+' + valor + '%';
    } else {
        valorLimpio = '+' + valor;
    }

    return [tipoLimpio, valorLimpio];
}


export function crearIconosMinorTraces(traces, element) {
    let htmlFinal = '';
    let idx = 1;

    traces.forEach(rastro => {
        // Obtenemos los valores transformados
        const [tipoLimpio, valorLimpio] = transformarTrace(rastro.type, rastro.value, element);
        
        // CORREGIDO: Inyectamos el div completo cerrado correctamente
        htmlFinal += `
            <div class="trace_mi" id="min${idx}">
                <img src="../imagenes/Stats/${tipoLimpio.replaceAll(' ', '_')}.webp">
                <div class="popup Matrace-popup">
                    <h3 class="type">${tipoLimpio}</h3>
                    <p class="value-text">${valorLimpio}</p>
                </div>
            </div>
        `;
        
        idx++;
    });

    // Lo inyectamos en el DOM al final
    document.getElementById('hab_cont').insertAdjacentHTML('beforeend', htmlFinal);
}