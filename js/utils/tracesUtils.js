export function crearIconosMajorTraces(traces) {
    let htmlFinal = '';
    let idx = 1;

    for (const [nombreGrupo, listaRastros] of Object.entries(traces)) {
        
        // 2. AHORA SÍ filtramos el array que está dentro de cada grupo
        const TraceNormales = listaRastros.filter(t => t.enhanced === null);
        const TraceNovaflare = listaRastros.filter(t => t.enhanced === 1);

        htmlFinal += `<div class="trace_ma" id="Pasiva_${idx}">`;

        // ---------------------------------------------------------
        // PARTE NORMAL
        // ---------------------------------------------------------
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

        // ---------------------------------------------------------
        // 2. CREAMOS LA PARTE NOVAFLARE (Oculta por defecto)
        // ---------------------------------------------------------
        if (TraceNovaflare.length > 0) {
            // CAMBIO: Cambiamos a rastroNF para no confundir
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

        htmlFinal += `</div>`; // Cerramos el contenedor principal
        idx++;
    }
    
    document.getElementById('hab_cont').insertAdjacentHTML('beforeend', htmlFinal);
}

export function crearIconosMinorTraces(traces) {
    let htmlFinal = '';
    let idx = 1;

    for (const [nombreGrupo, listaRastros] of Object.entries(traces)) {

        // ---------------------------------------------------------
        // PARTE NORMAL
        // ---------------------------------------------------------
        if (TraceNormales.length > 0) {
            const rastroN = TraceNormales[0];
            htmlFinal += `
                <div class="trace_mi" id="min${idx}">
                    <img src="../imagenes/Stats/${rastroN.type}.webp">
                    <div class="popup Matrace-popup">
                        <h3 class="type">${nombreGrupo}</h3>
                        <p>${rastroN.description}</p>
                    </div>
                </div>
            `;
        }

        htmlFinal += `</div>`; // Cerramos el contenedor principal
        idx++;
    }
    
    document.getElementById('hab_cont').insertAdjacentHTML('beforeend', htmlFinal);
}

export function crearIconosMajorTraces(traces) {
    let htmlFinal = '';
    let idx = 1;

    for (const [nombreGrupo, listaRastros] of Object.entries(traces)) {
        
        // 2. AHORA SÍ filtramos el array que está dentro de cada grupo
        const TraceNormales = listaRastros.filter(t => t.enhanced === null);
        const TraceNovaflare = listaRastros.filter(t => t.enhanced === 1);

        htmlFinal += `<div class="trace_ma" id="Pasiva_${idx}">`;

        // ---------------------------------------------------------
        // PARTE NORMAL
        // ---------------------------------------------------------
        if (TraceNormales.length > 0) {
            const rastroN = TraceNormales[0];
            htmlFinal += `
                <div class="Matrace-version Matrace-normal-version" data-tipo="${nombreGrupo}" data-isnf="false">
                    <img src="../imagenes/personajes/${rastroN.character_id}/Pasiva_${idx}.webp">
                    <div class="popup Matrace-popup">
                        <h3 class="type">${nombreGrupo}</h3>
                        <p>${rastroN.description}</p>
                    </div>
                </div>
            `;
        }

        // ---------------------------------------------------------
        // 2. CREAMOS LA PARTE NOVAFLARE (Oculta por defecto)
        // ---------------------------------------------------------
        if (TraceNovaflare.length > 0) {
            // CAMBIO: Cambiamos a rastroNF para no confundir
            const rastroNF = TraceNovaflare[0]; 
            htmlFinal += `
                <div class="Matrace-version Matrace-novaflare-version" style="display: none;" data-tipo="${nombreGrupo}" data-isnf="true">
                    <img src="../imagenes/personajes/${rastroNF.character_id}/Pasiva_${idx}.webp">
                    <span class="skill-novaflare-badge novaflare-badge-global">Novaflare</span>
                    <div class="popup Matrace-popup">
                        <h3 class="type">${nombreGrupo}</h3>
                        <p>${rastroNF.description}</p>
                    </div>
                </div>
            `;
        }

        htmlFinal += `</div>`; // Cerramos el contenedor principal
        idx++;
    }
    
    document.getElementById('hab_cont').insertAdjacentHTML('beforeend', htmlFinal);
}