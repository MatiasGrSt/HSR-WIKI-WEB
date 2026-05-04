// ====================================================================
// ESTADO GLOBAL Y CONFIGURACIÓN
// ====================================================================
let modalState = {
    group: [],
    index: 0,
    charName: '',
    element: '',
    levels: {}
};

// ====================================================================
// 1. UTILIDADES
// ====================================================================

function aplicarStatsTexto(desc, niveles, lvl) {
    let texto = desc;
    Object.keys(niveles).forEach(idx => {
        const valores = niveles[idx];
        const val = valores[lvl - 1] || valores[valores.length - 1];
        texto = texto.replace(new RegExp(`\\{stat_${idx}\\}`, 'g'), `<span class="stat-value">${val}</span>`);
    });
    return texto;
}

// ====================================================================
// 2. GESTIÓN DEL DOM (MODAL)
// ====================================================================

function asegurarModalIniciado() {
    let modal = document.getElementById('modal-info-habilidad');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'modal-info-habilidad';
    modal.className = 'modal-overlay-skill';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="modal-content-skill">
            <span class="modal-close-skill">&times;</span>
            <div class="modal-header-container">
                <button id="modal-prev-skill" class="modal-arrow" style="display:none;">&#10094;</button>
                <div class="modal-header-skill">
                    <div class="modal-img-wrapper"><img id="modal-img-skill" src="" alt="Icono"></div>
                    <div class="modal-title-box">
                        <div class="modal-name-row">
                            <h2 id="modal-name-skill">Nombre</h2>
                            <span id="novaflare-tag" class="novaflare-badge" style="display:none;">Novaflare</span>
                        </div>
                        <p id="modal-type-target-skill" class="type"></p>
                    </div>
                </div>
                <button id="modal-next-skill" class="modal-arrow" style="display:none;">&#10095;</button>
            </div>
            <div id="modal-tabs-container" class="modal-tabs-container" style="display:none;"></div>
            <div class="level-selector-cont" id="level-selector-box">
                <label>Nivel: <span id="lvl-display">1</span></label>
                <input type="range" id="skill-lvl-range" min="1" max="15" value="1">
            </div>
            <div class="modal-stats-skill" id="modal-stats-skill"></div>
            <hr class="modal-divider">
            <div class="modal-description-skill" id="modal-desc-skill"></div>
        </div>`;
    
    document.body.appendChild(modal);

    modal.querySelector('.modal-close-skill').onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    document.getElementById('modal-prev-skill').onclick = () => {
        modalState.index = (modalState.index === 0) ? modalState.group.length - 1 : modalState.index - 1;
        refrescarModalUI();
    };
    document.getElementById('modal-next-skill').onclick = () => {
        modalState.index = (modalState.index === modalState.group.length - 1) ? 0 : modalState.index + 1;
        refrescarModalUI();
    };

    return modal;
}

async function refrescarModalUI() {
    const habilidad = modalState.group[modalState.index];
    const modal = document.getElementById('modal-info-habilidad');
    const content = modal.querySelector('.modal-content-skill');
    const imgIcono = document.getElementById('modal-img-skill');
    const tag = document.getElementById('novaflare-tag');

    const isNovaflare = habilidad.enchanced == 1;
    tag.style.display = isNovaflare ? 'inline-block' : 'none';
    imgIcono.classList.toggle('novaflare-icon', isNovaflare);
    content.classList.toggle('is-novaflare', isNovaflare);
    content.style.backgroundImage = `url('../imagenes/fondos/${modalState.element}.webp')`;

    const uNames = [...new Set(modalState.group.map(h => h.name))];
    const uIdx = uNames.indexOf(habilidad.name);
    const tipoF = habilidad.type.replaceAll(' ', '_');
    
    // --- NUEVA LÓGICA PARA CYRENE ---
    const isCyreneExclusive = modalState.charName.toLowerCase() === 'cyrene' && tipoF === 'Habilidad_Exclusiva';
    const nombreImg = isCyreneExclusive 
        ? `${tipoF}_${uIdx + 2}` 
        : `${tipoF}${uIdx === 0 ? '' : `_${uIdx + 1}`}`;
    // --------------------------------
    
    imgIcono.src = `../imagenes/personajes/${modalState.charName}/${nombreImg}.webp`;
    imgIcono.onerror = () => { if(uIdx > 0) { imgIcono.onerror = null; imgIcono.src = `../imagenes/personajes/${modalState.charName}/${tipoF}.webp`; } };

    const res = await fetch(`http://localhost/php/obtener_info_pj.php?skill_id=${habilidad.id}&tipo=skill_levels`);
    const data = await res.json();
    modalState.levels = {};
    (Array.isArray(data) ? data : [data]).forEach(n => { if(n?.params) modalState.levels[n.indice] = JSON.parse(n.params); });

    const range = document.getElementById('skill-lvl-range');
    const keys = Object.keys(modalState.levels);
    const maxLvl = keys.length > 0 ? modalState.levels[keys[0]].length : 1;
    
    document.getElementById('level-selector-box').style.display = maxLvl > 1 ? 'flex' : 'none';
    range.max = maxLvl;
    if (parseInt(range.value) > maxLvl) range.value = maxLvl;

    const updateText = () => {
        document.getElementById('lvl-display').textContent = range.value;
        document.getElementById('modal-desc-skill').innerHTML = aplicarStatsTexto(habilidad.description, modalState.levels, range.value);
    };
    range.oninput = updateText;

    document.getElementById('modal-name-skill').textContent = habilidad.name;
    document.getElementById('modal-type-target-skill').textContent = `${habilidad.type} | ${habilidad.target}`;
    document.getElementById('modal-stats-skill').innerHTML = `
        ${habilidad.energy ? `<div><b>Coste:</b> ${habilidad.energy}</div>` : ''}
        ${habilidad.energy_gain ? `<div><b>Energía:</b> ${habilidad.energy_gain}</div>` : ''}
        ${habilidad.break ? `<div><b>Ruptura:</b> ${habilidad.break}</div>` : ''}
    `;

    renderTabs();
    updateText();
}

function renderTabs() {
    const container = document.getElementById('modal-tabs-container');
    const hasMultiple = modalState.group.length > 1;
    container.style.display = hasMultiple ? 'flex' : 'none';
    document.getElementById('modal-prev-skill').style.display = hasMultiple ? 'block' : 'none';
    document.getElementById('modal-next-skill').style.display = hasMultiple ? 'block' : 'none';

    if (hasMultiple) {
        container.innerHTML = '';
        modalState.group.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `skill-tab ${i === modalState.index ? 'active' : ''}`;
            dot.onclick = () => { modalState.index = i; refrescarModalUI(); };
            container.appendChild(dot);
        });
    }
}

const abrirModal = (grupo, index, char, elem) => {
    const modal = asegurarModalIniciado();
    modalState = { group: grupo, index: index, charName: char, element: elem, levels: {} };
    
    const parent = document.getElementById('hab_cont');
    if (parent) {
        const color = getComputedStyle(parent).getPropertyValue('--color-rareza').trim();
        modal.style.setProperty('--color-rareza', color);
    }
    
    modal.style.display = 'flex';
    refrescarModalUI();
};

// ====================================================================
// 3. FUNCIONES EXPORTADAS
// ====================================================================

export async function cargarHabilidades(name, element) {
    asegurarModalIniciado();
    const container = document.getElementById('hab_cont');
    try {
        const res = await fetch(`http://localhost/php/obtener_info_pj.php?personaje=${name}&tipo=skills`);
        const data = await res.json();
        
        const grupos = data.reduce((acc, h) => {
            if (!acc[h.type]) acc[h.type] = [];
            acc[h.type].push(h);
            return acc;
        }, {});

        Object.keys(grupos).forEach(tipo => {
            const grupo = grupos[tipo];
            const tipoF = tipo.replaceAll(' ', '_');
            
            const item = document.createElement('div');
            item.className = 'skill-item-container';
            item.id = tipoF; 
            
            item.onmouseenter = () => item.style.zIndex = "100";
            item.onmouseleave = () => item.style.zIndex = "1";

            const mainImg = document.createElement('img');
            // El icono principal se queda igual (Habilidad_Exclusiva.webp)
            mainImg.src = `../imagenes/personajes/${name}/${tipoF}.webp`;
            mainImg.onclick = () => abrirModal(grupo, 0, name, element);
            mainImg.onerror = () => mainImg.style.display = 'none';

            const popup = document.createElement('div');
            popup.className = 'popup';
            popup.innerHTML = `<h3 class='type'>${tipo}</h3><div class='icons'></div>`;
            
            const uNames = [...new Set(grupo.map(x => x.name))];

            // --- NUEVA LÓGICA PARA CYRENE (POP-UP) ---
            const isCyreneExclusive = name.toLowerCase() === 'cyrene' && tipoF === 'Habilidad_Exclusiva';
            // -----------------------------------------

            uNames.forEach((uName, uIdx) => {
                const originalIdx = grupo.findIndex(h => h.name === uName);
                
                // --- APLICACIÓN AL NOMBRE DE LA IMAGEN ---
                const imgN = isCyreneExclusive 
                    ? `${tipoF}_${uIdx + 2}` 
                    : `${tipoF}${uIdx === 0 ? '' : `_${uIdx + 1}`}`;
                // -----------------------------------------
                
                const pImg = document.createElement('img');
                pImg.src = `../imagenes/personajes/${name}/${imgN}.webp`;
                pImg.onclick = (e) => { e.stopPropagation(); abrirModal(grupo, originalIdx, name, element); };
                pImg.onerror = () => pImg.remove();
                popup.querySelector('.icons').appendChild(pImg);
            });

            item.append(mainImg, popup);
            container.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

export async function cargarMajorTraces(char) { renderTraces(char, 'major_traces', 'trace_ma', 'Pasiva'); }
export async function cargarMinorTraces(name, element) { renderTraces(name, 'minor_traces', 'trace_mi', null, element); }

async function renderTraces(char, tipo, className, imgPrefix, element = null) {
    const container = document.getElementById('hab_cont');
    const res = await fetch(`http://localhost/php/obtener_info_pj.php?personaje=${char}&tipo=${tipo}`);
    const data = await res.json();
    data.forEach((t, i) => {
        const item = document.createElement('div');
        item.className = className;
        
        // Asignar ID basado en el índice o tipo para posicionamiento
        item.id = imgPrefix ? `${imgPrefix}_${i+1}` : `min${i+1}`;
        
        item.onmouseenter = () => item.style.zIndex = "100";
        item.onmouseleave = () => item.style.zIndex = "1";
        const img = document.createElement('img');
        img.src = imgPrefix ? `../imagenes/personajes/${char}/${imgPrefix}_${i+1}.webp` : (t.type !== 'DMG' ? `../imagenes/Stats/${t.type}.webp` : `../imagenes/Stats/${element}_${t.type}.webp`);
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `<h3 class='type'>${t.name || t.type}</h3><p class='description'>${t.description || `+ ${t.value}${t.type === 'SPD' ? '' : '%'}`}</p>`;
        item.append(img, popup);
        container.appendChild(item);
    });
}