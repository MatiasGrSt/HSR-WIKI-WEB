import { createNovaflareSwitch, toggleSwitchVisibility } from './utils.js';

let currentCharName = '';
let currentElement = '';
let allSkills = [];  // Todas las habilidades de la BD
let switchElement = null;
let hasNovaflareFeature = false;

// Modal
let modalState = {
    skillGroup: [],
    index: 0
};
let modalLevels = {};

// ====================================================================
// MODAL
// ====================================================================

function ensureModalExists() {
    let modal = document.getElementById('modal-info-habilidad');
    if (!modal) {
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
        modal.querySelector('#modal-prev-skill').onclick = () => {
            modalState.index = (modalState.index === 0) ? modalState.skillGroup.length - 1 : modalState.index - 1;
            updateModalContent();
        };
        modal.querySelector('#modal-next-skill').onclick = () => {
            modalState.index = (modalState.index === modalState.skillGroup.length - 1) ? 0 : modalState.index + 1;
            updateModalContent();
        };
        modal.querySelector('#skill-lvl-range').oninput = () => updateModalDescription();
    }
    return modal;
}

function showModal(skillGroup, index) {
    const modal = document.getElementById('modal-info-habilidad');
    modalState = { skillGroup, index };
    modal.style.display = 'flex';
    updateModalContent();
}

async function updateModalContent() {
    const modal = document.getElementById('modal-info-habilidad');
    const skill = modalState.skillGroup[modalState.index];

    const isNovaflare = Boolean(skill.enchanced);
    modal.querySelector('#novaflare-tag').style.display = isNovaflare ? 'inline-block' : 'none';
    modal.querySelector('#modal-img-skill').classList.toggle('novaflare-icon', isNovaflare);
    modal.querySelector('.modal-content-skill').classList.toggle('is-novaflare', isNovaflare);
    modal.querySelector('.modal-content-skill').style.backgroundImage = `url('../imagenes/fondos/${currentElement}.webp')`;

    const tipoF = skill.type.replaceAll(' ', '_');
    const uNames = [...new Set(modalState.skillGroup.map(h => h.name))];
    const uIdx = uNames.indexOf(skill.name);
    const imgName = uIdx === 0 ? tipoF : `${tipoF}_${uIdx + 1}`;

    const img = modal.querySelector('#modal-img-skill');
    img.src = `../imagenes/personajes/${currentCharName}/${imgName}.webp`;
    img.onerror = () => {
        if (uIdx > 0) {
            img.onerror = null;
            img.src = `../imagenes/personajes/${currentCharName}/${tipoF}.webp`;
        }
    };

    modalLevels = {};
    try {
        const res = await fetch(`../backend/php/obtener_info_pj.php?skill_id=${skill.id}&tipo=skill_levels`);
        if (res.ok) {
            const data = await res.json();
            (Array.isArray(data) ? data : [data]).forEach(n => {
                if (n?.params) modalLevels[n.indice] = JSON.parse(n.params);
            });
        }
    } catch (e) {
        console.error('Error:', e);
    }

    const keys = Object.keys(modalLevels);
    const maxLvl = keys.length > 0 ? modalLevels[keys[0]].length : 1;
    const levelBox = modal.querySelector('#level-selector-box');
    levelBox.style.display = maxLvl > 1 ? 'flex' : 'none';

    const range = modal.querySelector('#skill-lvl-range');
    range.max = maxLvl;
    range.value = 1;

    updateTabs();

    modal.querySelector('#modal-name-skill').textContent = skill.name;
    modal.querySelector('#modal-type-target-skill').textContent = `${skill.type} | ${skill.target}`;
    modal.querySelector('#modal-stats-skill').innerHTML = `
        ${skill.energy ? `<div><b>Coste:</b> ${skill.energy}</div>` : ''}
        ${skill.energy_gain ? `<div><b>Energía:</b> ${skill.energy_gain}</div>` : ''}
        ${skill.break ? `<div><b>Ruptura:</b> ${skill.break}</div>` : ''}
    `;

    updateModalDescription();
}

function updateTabs() {
    const modal = document.getElementById('modal-info-habilidad');
    const container = modal.querySelector('#modal-tabs-container');
    const hasMultiple = modalState.skillGroup.length > 1;

    container.style.display = hasMultiple ? 'flex' : 'none';
    modal.querySelector('#modal-prev-skill').style.display = hasMultiple ? 'block' : 'none';
    modal.querySelector('#modal-next-skill').style.display = hasMultiple ? 'block' : 'none';

    if (hasMultiple) {
        container.innerHTML = '';
        modalState.skillGroup.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `skill-tab ${i === modalState.index ? 'active' : ''}`;
            dot.onclick = () => {
                modalState.index = i;
                updateModalContent();
            };
            container.appendChild(dot);
        });
    }
}

function updateModalDescription() {
    const modal = document.getElementById('modal-info-habilidad');
    const skill = modalState.skillGroup[modalState.index];
    const lvl = parseInt(modal.querySelector('#skill-lvl-range').value);

    modal.querySelector('#lvl-display').textContent = lvl;

    let text = skill.description;
    Object.keys(modalLevels).forEach(idx => {
        const valores = modalLevels[idx];
        const val = valores[lvl - 1] || valores[valores.length - 1];
        text = text.replace(new RegExp(`\\{stat_${idx}\\}`, 'g'), `<span class="stat-value">${val}</span>`);
    });
    modal.querySelector('#modal-desc-skill').innerHTML = text;
}

// ====================================================================
// RENDERIZAR HABILIDADES
// ====================================================================

function renderSkills(mode = 'normal') {
    const container = document.getElementById('hab_cont');
    if (!container) return;

    // Limpiar solo skill items
    container.querySelectorAll('.skill-item-container').forEach(el => el.remove());

    // Agrupar: por tipo → por nombre (para identificar si es normal o enhanced)
    const groupByTypeAndName = {};

    allSkills.forEach(skill => {
        const type = skill.type;
        const name = skill.name;

        if (!groupByTypeAndName[type]) {
            groupByTypeAndName[type] = {};
        }
        if (!groupByTypeAndName[type][name]) {
            groupByTypeAndName[type][name] = { normal: null, enhanced: null };
        }

        if (skill.enchanced) {
            groupByTypeAndName[type][name].enhanced = skill;
        } else {
            groupByTypeAndName[type][name].normal = skill;
        }
    });

    const primerTrace = container.querySelector('.trace_ma, .trace_mi');

    // Renderizar: un item por tipo de habilidad, mostrando UNA SOLA versión
    Object.entries(groupByTypeAndName).forEach(([tipo, skillsByName]) => {
        // Decidir qué versiones mostrar según el modo
        const skillsToShow = [];

        Object.entries(skillsByName).forEach(([name, versions]) => {
            const { normal, enhanced } = versions;
            const hasEnhanced = enhanced !== null;

            if (mode === 'novaflare') {
                // Si hay enhanced, mostrar enhanced; si no, mostrar normal
                skillsToShow.push(hasEnhanced ? enhanced : normal);
            } else {
                // Modo normal: mostrar normal; si no existe, mostrar enhanced
                skillsToShow.push(normal || enhanced);
            }
        });

        if (skillsToShow.length === 0) return;

        const tipoF = tipo.replaceAll(' ', '_');
        const isEnhancedMode = mode === 'novaflare' && skillsToShow.some(s => s.enchanced);

        const item = document.createElement('div');
        item.className = 'skill-item-container';
        if (isEnhancedMode) item.classList.add('novaflare-active');
        item.id = tipoF;

        item.onmouseenter = () => item.style.zIndex = '100';
        item.onmouseleave = () => item.style.zIndex = '1';

        const mainImg = document.createElement('img');
        mainImg.src = `../imagenes/personajes/${currentCharName}/${tipoF}.webp`;
        mainImg.onclick = () => showModal(skillsToShow, 0);
        mainImg.onerror = () => mainImg.style.display = 'none';

        if (isEnhancedMode) {
            const badge = document.createElement('span');
            badge.className = 'skill-novaflare-badge novaflare-badge-global';
            badge.textContent = 'Novaflare';
            item.appendChild(badge);
        }

        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `<h3 class='type'>${tipo}</h3><div class='icons'></div>`;

        skillsToShow.forEach((skill, idx) => {
            const imgN = idx === 0 ? tipoF : `${tipoF}_${idx + 1}`;
            const pImg = document.createElement('img');
            pImg.src = `../imagenes/personajes/${currentCharName}/${imgN}.webp`;
            pImg.onclick = (e) => {
                e.stopPropagation();
                showModal(skillsToShow, idx);
            };
            pImg.onerror = () => pImg.remove();
            popup.querySelector('.icons').appendChild(pImg);
        });

        item.append(mainImg, popup);

        if (primerTrace) {
            container.insertBefore(item, primerTrace);
        } else {
            container.appendChild(item);
        }
    });
}

// ====================================================================
// EXPORTAR FUNCIONES
// ====================================================================

export async function cargarHabilidades(name, element, isNovaflareChar = false) {
    ensureModalExists();
    currentCharName = name;
    currentElement = element;
    hasNovaflareFeature = isNovaflareChar;

    try {
        const res = await fetch(`../backend/php/obtener_info_pj.php?personaje=${name}&tipo=skills`);
        allSkills = await res.json();
        if (!Array.isArray(allSkills)) allSkills = [allSkills];

        renderSkills('normal');

        // Crear switch si hay Novaflare
        if (isNovaflareChar) {
            const container = document.getElementById('novaflare-switch-container');
            if (container && !switchElement) {
                switchElement = createNovaflareSwitch(container, (mode) => {
                    renderSkills(mode);
                    const modal = document.getElementById('modal-info-habilidad');
                    if (modal) modal.style.display = 'none';
                });
            }
            toggleSwitchVisibility(switchElement, true);
        } else {
            if (switchElement) toggleSwitchVisibility(switchElement, false);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

export async function cargarMajorTraces(char) {
    renderTraces(char, 'major_traces', 'trace_ma', 'Pasiva');
}

export async function cargarMinorTraces(name, element) {
    renderTraces(name, 'minor_traces', 'trace_mi', null, element);
}

async function renderTraces(char, tipo, className, imgPrefix, element = null) {
    const container = document.getElementById('hab_cont');
    try {
        const res = await fetch(`../backend/php/obtener_info_pj.php?personaje=${char}&tipo=${tipo}`);
        const data = await res.json();

        data.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = className;
            item.id = imgPrefix ? `${imgPrefix}_${i+1}` : `min${i+1}`;

            item.onmouseenter = () => item.style.zIndex = '100';
            item.onmouseleave = () => item.style.zIndex = '1';

            const img = document.createElement('img');
            img.src = imgPrefix
                ? `../imagenes/personajes/${char}/${imgPrefix}_${i+1}.webp`
                : (t.type !== 'DMG'
                    ? `../imagenes/Stats/${t.type}.webp`
                    : `../imagenes/Stats/${element}_${t.type}.webp`);

            const popup = document.createElement('div');
            popup.className = 'popup';
            popup.innerHTML = `<h3 class='type'>${t.name || t.type}</h3><p class='description'>${t.description || `+ ${t.value}${t.type === 'SPD' ? '' : '%'}`}</p>`;

            item.append(img, popup);
            container.appendChild(item);
        });
    } catch (e) {
        console.error('Error:', e);
    }
}
