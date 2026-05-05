import { createNovaflareSwitch, toggleSwitchVisibility } from './utils.js';

let currentCharName = '';
let currentElement = '';
let switchElement = null;
let normalSkills = [];
let novaflareSkills = [];
let currentMode = 'normal';

let modalState = { skills: [], activeIndex: 0 };
let modalLevels = {};

// ====================================================================
// UTILIDADES
// ====================================================================

function isSkillNF(skill) {
    if (!skill) return false;
    const keys = ['enhanced', 'enchanced', 'is_novaflare'];
    for (const k of keys) {
        if (skill[k] == 1 || skill[k] === 'true' || skill[k] === true) return true;
    }
    return false;
}

function separateSkills(skills) {
    const normals = [];
    const novaflares = [];
    skills.forEach(s => {
        if (isSkillNF(s)) novaflares.push(s);
        else normals.push(s);
    });
    return { normals, novaflares };
}

function buildTypeGroups(baseArray, nfArray) {
    const groups = {};

    baseArray.forEach((skill, idx) => {
        const type = skill.type;
        if (!groups[type]) groups[type] = { normal: [], novaflare: [] };
        const match = nfArray.find(nf => nf.name === skill.name && nf.type === skill.type);
        groups[type].normal.push({ slotIndex: idx, skill, nfCounterpart: match || null });
        if (match) groups[type].novaflare.push({ slotIndex: idx, skill: match, hasNormal: true });
    });

    nfArray.forEach((skill, idx) => {
        const type = skill.type;
        if (!groups[type]) groups[type] = { normal: [], novaflare: [] };
        const hasNormal = baseArray.some(n => n.name === skill.name && n.type === skill.type);
        if (!hasNormal) {
            groups[type].novaflare.push({ slotIndex: idx, skill, hasNormal: false });
        }
    });

    return groups;
}

// ====================================================================
// RENDER — Crea TODOS los iconos, oculta los NF por defecto
// ====================================================================

export async function cargarHabilidades(name, element, isNovaflareChar = false) {
    ensureModalExists();
    currentCharName = name;
    currentElement = element;
    currentMode = 'normal';

    try {
        const res = await fetch(`../backend/php/obtener_info_pj.php?personaje=${name}&tipo=skills`);
        const data = await res.json();
        const allSkills = Array.isArray(data) ? data : [data];

        const separated = separateSkills(allSkills);
        normalSkills = separated.normals;
        novaflareSkills = separated.novaflares;

        const groups = buildTypeGroups(normalSkills, novaflareSkills);
        renderAllSkillTypes(groups, 'normal');

        if (isNovaflareChar) {
            const container = document.getElementById('novaflare-switch-container');
            if (container && !switchElement) {
                switchElement = createNovaflareSwitch(container, (mode) => {
                    currentMode = mode;
                    toggleSkillVisibility(mode);
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

export async function cargarMajorTraces(char, isNovaflareChar = false) { renderMajorTraces(char, isNovaflareChar); }
export async function cargarMinorTraces(name, element) { renderTraces(name, 'minor_traces', 'trace_mi', null, element); }

let majorTraces = { normal: [], novaflare: [] };

function pairMajorTracesByName(traces) {
    const normals = traces.filter(t => !isSkillNF(t));
    const enhanceds = traces.filter(t => isSkillNF(t));
    const usedNames = new Set();
    const pairs = [];

    for (const n of normals) {
        const nNameNorm = n.name.trim().toLowerCase();
        const enh = enhanceds.find(e => {
            const eNameNorm = e.name.trim().toLowerCase();
            return eNameNorm === nNameNorm && !usedNames.has(eNameNorm);
        });
        
        if (enh) {
            usedNames.add(enh.name.trim().toLowerCase());
            pairs.push({ normal: n, enhanced: enh });
        } else {
            pairs.push({ normal: n, enhanced: null });
        }
    }

    for (const e of enhanceds) {
        const eNameNorm = e.name.trim().toLowerCase();
        if (!usedNames.has(eNameNorm)) {
            pairs.push({ normal: null, enhanced: e });
        }
    }
    
    return pairs;
}

async function renderMajorTraces(char, isNovaflareChar) {
    const container = document.getElementById('hab_cont');
    try {
        const res = await fetch(`../backend/php/obtener_info_pj.php?personaje=${char}&tipo=major_traces`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;

        const pairs = pairMajorTracesByName(data);

        // Limpiar traces existentes
        container.querySelectorAll('.trace_ma').forEach(el => el.remove());

        pairs.forEach((pair, idx) => {
            const active = pair.normal || pair.enhanced;
            if (!active) return;

            const item = document.createElement('div');
            item.className = 'trace_ma';
            item.id = `Pasiva_${idx + 1}`;
            item.style.zIndex = '1';
            item.onmouseenter = () => item.style.zIndex = '100';
            item.onmouseleave = () => item.style.zIndex = '1';

            // Versión NORMAL (visible por defecto)
            const normalWrapper = document.createElement('div');
            normalWrapper.className = 'skill-version skill-normal-version';
            if (pair.normal) {
                const normalImg = document.createElement('img');
                normalImg.src = `../imagenes/personajes/${char}/Pasiva_${idx + 1}.webp`;
                normalWrapper.appendChild(normalImg);

                const normalPopup = document.createElement('div');
                normalPopup.className = 'popup';
                normalPopup.innerHTML = `<h3 class='type'>${pair.normal.name}</h3><p class='description'>${pair.normal.description || ''}</p>`;
                normalWrapper.appendChild(normalPopup);
            }

            // Versión NOVAFALRE (oculta por defecto)
            const nfWrapper = document.createElement('div');
            nfWrapper.className = 'skill-version skill-nf-version';
            nfWrapper.style.display = 'none';

            if (pair.enhanced) {
                const nfImg = document.createElement('img');
                nfImg.src = `../imagenes/personajes/${char}/Pasiva_${idx + 1}.webp`;
                nfWrapper.appendChild(nfImg);

                const nfPopup = document.createElement('div');
                nfPopup.className = 'popup';
                nfPopup.innerHTML = `<h3 class='type'>${pair.enhanced.name}</h3><p class='description'>${pair.enhanced.description || ''}</p>`;
                nfWrapper.appendChild(nfPopup);
            }

            item.appendChild(normalWrapper);
            item.appendChild(nfWrapper);
            container.appendChild(item);
        });
    } catch (e) { console.error('Error renderizando major traces:', e); }
}

function renderAllSkillTypes(groups, mode) {
    const container = document.getElementById('hab_cont');
    if (!container) return;

    container.querySelectorAll('.skill-item-container').forEach(el => el.remove());
    const primerTrace = container.querySelector('.trace_ma, .trace_mi');

    for (const [type, group] of Object.entries(groups)) {
        const tipoF = type.replaceAll(' ', '_');

        const item = document.createElement('div');
        item.className = 'skill-item-container';
        item.id = tipoF;
        item.style.zIndex = '1';
        item.onmouseenter = () => item.style.zIndex = '100';
        item.onmouseleave = () => item.style.zIndex = '1';

        // Versión NORMAL (visible por defecto)
        const normalWrapper = document.createElement('div');
        normalWrapper.className = 'skill-version skill-normal-version';
        const normalImg = document.createElement('img');
        normalImg.src = `../imagenes/personajes/${currentCharName}/${tipoF}.webp`;
        normalImg.onerror = () => { normalImg.src = `../imagenes/personajes/${currentCharName}/${tipoF}.webp`; };
        normalWrapper.appendChild(normalImg);

        const normalPopup = document.createElement('div');
        normalPopup.className = 'popup skill-popup';
        normalPopup.innerHTML = `<h3 class='type'>${type}</h3><div class='icons'></div>`;
        const normalIconsDiv = normalPopup.querySelector('.icons');
        group.normal.forEach((entry, i) => {
            const pImg = document.createElement('img');
            pImg.src = `../imagenes/personajes/${currentCharName}/${i === 0 ? tipoF : `${tipoF}_${i + 1}`}.webp`;
            pImg.onerror = () => { pImg.src = `../imagenes/personajes/${currentCharName}/${tipoF}.webp`; };
            pImg.onclick = (e) => { e.stopPropagation(); openSkillModal(type, group.normal.map(e => e.skill), 'normal'); };
            normalIconsDiv.appendChild(pImg);
        });
        normalWrapper.appendChild(normalPopup);
        normalWrapper.onclick = () => openSkillModal(type, group.normal.map(e => e.skill), 'normal');

        // Versión NOVAFALRE (oculta por defecto)
        const nfWrapper = document.createElement('div');
        nfWrapper.className = 'skill-version skill-nf-version';
        nfWrapper.style.display = 'none';

        if (group.novaflare.length > 0) {
            const nfImg = document.createElement('img');
            nfImg.src = `../imagenes/personajes/${currentCharName}/${tipoF}_2.webp`;
            nfImg.onerror = () => { nfImg.src = `../imagenes/personajes/${currentCharName}/${tipoF}.webp`; };
            nfWrapper.appendChild(nfImg);

            const nfBadge = document.createElement('span');
            nfBadge.className = 'skill-novaflare-badge novaflare-badge-global';
            nfBadge.textContent = 'Novaflare';
            nfWrapper.appendChild(nfBadge);

            const nfPopup = document.createElement('div');
            nfPopup.className = 'popup skill-popup';
            nfPopup.innerHTML = `<h3 class='type'>${type}</h3><div class='icons'></div>`;
            const nfIconsDiv = nfPopup.querySelector('.icons');
            group.novaflare.forEach((entry, i) => {
                const pImg = document.createElement('img');
                pImg.src = `../imagenes/personajes/${currentCharName}/${tipoF}_2.webp`;
                pImg.onerror = () => { pImg.src = `../imagenes/personajes/${currentCharName}/${tipoF}.webp`; };
                pImg.onclick = (e) => { e.stopPropagation(); openSkillModal(type, group.novaflare.map(e => e.skill), 'novaflare'); };
                nfIconsDiv.appendChild(pImg);
            });
            nfWrapper.appendChild(nfPopup);
            nfWrapper.onclick = () => openSkillModal(type, group.novaflare.map(e => e.skill), 'novaflare');
        } else {
            // Sin versión NF → copiar normal
            nfWrapper.style.display = 'none';
            nfWrapper.appendChild(normalImg.cloneNode(true));
            nfWrapper.appendChild(normalPopup.cloneNode(true));
        }

        item.appendChild(normalWrapper);
        item.appendChild(nfWrapper);

        if (primerTrace) container.insertBefore(item, primerTrace);
        else container.appendChild(item);
    }
}

function toggleSkillVisibility(mode) {
    const container = document.getElementById('hab_cont');
    if (!container) return;

    // Toggle skills
    const items = container.querySelectorAll('.skill-item-container');
    items.forEach(item => {
        const normalVer = item.querySelector('.skill-normal-version');
        const nfVer = item.querySelector('.skill-nf-version');

        if (mode === 'novaflare' && nfVer && nfVer.children.length > 0) {
            normalVer.style.display = 'none';
            nfVer.style.display = '';
            item.classList.add('novaflare-active');
        } else {
            normalVer.style.display = '';
            nfVer.style.display = 'none';
            item.classList.remove('novaflare-active');
        }
    });

    // Toggle major traces
    const traces = container.querySelectorAll('.trace_ma');
    traces.forEach(item => {
        const normalVer = item.querySelector('.skill-normal-version');
        const nfVer = item.querySelector('.skill-nf-version');
        if (!normalVer || !nfVer) return;

        if (mode === 'novaflare' && nfVer.children.length > 0) {
            normalVer.style.display = 'none';
            nfVer.style.display = '';
            item.classList.add('novaflare-active');
        } else {
            normalVer.style.display = '';
            nfVer.style.display = 'none';
            item.classList.remove('novaflare-active');
        }
    });
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
            img.src = imgPrefix ? `../imagenes/personajes/${char}/${imgPrefix}_${i+1}.webp` : (t.type !== 'DMG' ? `../imagenes/Stats/${t.type}.webp` : `../imagenes/Stats/${element}_${t.type}.webp`);
            const popup = document.createElement('div');
            popup.className = 'popup';
            popup.innerHTML = `<h3 class='type'>${t.name || t.type}</h3><p class='description'>${t.description || `+ ${t.value}${t.type === 'SPD' ? '' : '%'}`}</p>`;

            item.append(img, popup);
            container.appendChild(item);
        });
    } catch (e) { console.error('Error renderizando rastros:', e); }
}

// ====================================================================
// MODAL
// ====================================================================

function openSkillModal(type, skills, mode) {
    modalState.skills = skills.map(s => ({
        skill: s,
        isNF: mode === 'novaflare'
    }));
    modalState.activeIndex = 0;
    document.getElementById('modal-info-habilidad').style.display = 'flex';
    updateModalContent();
}

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
        modal.querySelector('#modal-prev-skill').onclick = () => navigateModal(-1);
        modal.querySelector('#modal-next-skill').onclick = () => navigateModal(1);
        modal.querySelector('#skill-lvl-range').oninput = () => updateModalDescription();
    }
}

function navigateModal(direction) {
    const total = modalState.skills.length;
    modalState.activeIndex = (modalState.activeIndex + direction + total) % total;
    updateModalContent();
}

async function updateModalContent() {
    const modal = document.getElementById('modal-info-habilidad');
    const entry = modalState.skills[modalState.activeIndex];
    const skill = entry.skill;
    const isNF = entry.isNF;
    const hasMultiple = modalState.skills.length > 1;

    modal.querySelector('#novaflare-tag').style.display = isNF ? 'inline-block' : 'none';
    modal.querySelector('#modal-img-skill').classList.toggle('novaflare-icon', isNF);
    modal.querySelector('.modal-content-skill').classList.toggle('is-novaflare', isNF);
    modal.querySelector('.modal-content-skill').style.backgroundImage = `url('../imagenes/fondos/${currentElement}.webp')`;

    const tipoF = skill.type.replaceAll(' ', '_');
    const imgName = isNF ? `${tipoF}_2` : tipoF;

    const img = modal.querySelector('#modal-img-skill');
    img.src = `../imagenes/personajes/${currentCharName}/${imgName}.webp`;
    img.onerror = () => { img.src = `../imagenes/personajes/${currentCharName}/${tipoF}.webp`; };

    modalLevels = {};
    try {
        const res = await fetch(`../backend/php/obtener_info_pj.php?skill_id=${skill.id}&tipo=skill_levels`);
        if (res.ok) {
            const data = await res.json();
            (Array.isArray(data) ? data : [data]).forEach(n => { if (n?.params) modalLevels[n.indice] = JSON.parse(n.params); });
        }
    } catch (e) { console.error('Error cargando niveles:', e); }

    const keys = Object.keys(modalLevels);
    const maxLvl = keys.length > 0 ? modalLevels[keys[0]].length : 1;
    const levelBox = modal.querySelector('#level-selector-box');
    levelBox.style.display = maxLvl > 1 ? 'flex' : 'none';
    const range = modal.querySelector('#skill-lvl-range');
    range.max = maxLvl; range.value = 1;

    modal.querySelector('#modal-name-skill').textContent = skill.name;
    modal.querySelector('#modal-type-target-skill').textContent = `${skill.type} | ${skill.target || 'N/A'}`;
    modal.querySelector('#modal-stats-skill').innerHTML = `${skill.energy ? `<div><b>Coste:</b> ${skill.energy}</div>` : ''}${skill.energy_gain ? `<div><b>Energía:</b> ${skill.energy_gain}</div>` : ''}${skill.break ? `<div><b>Ruptura:</b> ${skill.break}</div>` : ''}`;

    updateTabs();
    updateModalDescription();
}

function updateTabs() {
    const modal = document.getElementById('modal-info-habilidad');
    const container = modal.querySelector('#modal-tabs-container');
    const hasMultiple = modalState.skills.length > 1;

    container.style.display = hasMultiple ? 'flex' : 'none';
    modal.querySelector('#modal-prev-skill').style.display = hasMultiple ? 'block' : 'none';
    modal.querySelector('#modal-next-skill').style.display = hasMultiple ? 'block' : 'none';

    if (hasMultiple) {
        container.innerHTML = '';
        modalState.skills.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `skill-tab ${i === modalState.activeIndex ? 'active' : ''}`;
            dot.onclick = () => { modalState.activeIndex = i; updateModalContent(); };
            container.appendChild(dot);
        });
    }
}

function updateModalDescription() {
    const modal = document.getElementById('modal-info-habilidad');
    const entry = modalState.skills[modalState.activeIndex];
    const skill = entry.skill;
    const lvl = parseInt(modal.querySelector('#skill-lvl-range').value);
    modal.querySelector('#lvl-display').textContent = lvl;

    let text = skill.description || '';
    Object.keys(modalLevels).forEach(idx => {
        const valores = modalLevels[idx];
        const val = valores[lvl - 1] || valores[valores.length - 1];
        text = text.replace(new RegExp(`\\{stat_${idx}\\}`, 'g'), `<span class="stat-value">${val}</span>`);
    });
    modal.querySelector('#modal-desc-skill').innerHTML = text;
}
