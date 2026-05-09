let modalState = { skills: [], activeIndex: 0 };
let modalLevels = {}; // Para el fondo del modal, se actualizará al abrirlo
let elemento = null; // Valor por defecto, se actualizará al cargar el personaje

/**
 * Inicializa los eventos fijos del modal (Cerrar, Flechas, Slider).
 * Se llama una sola vez desde el main().
 */
export function inicializarModal() {
    // CAMBIO 1: Buscamos el fondo oscuro (overlay) en lugar del contenido
    const modal = document.querySelector('.modal-overlay-skill');
    if (!modal) return;

    // Botón cerrar
    modal.querySelector('.modal-close-skill').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar al hacer clic fuera (ahora sí detectará el fondo)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Navegación (Flechas)
    modal.querySelector('#modal-prev-skill').addEventListener('click', () => navigateModal(-1));
    modal.querySelector('#modal-next-skill').addEventListener('click', () => navigateModal(1));

    // Slider de nivel
    modal.querySelector('#skill-lvl-range').addEventListener('input', () => updateModalDescription());
}

/**
 * Función principal para abrir el modal desde fuera (skills.js).
 */
export async function openSkillModal(type, skills, element) {
    console.log('Abriendo modal para:', type, skills, element);
    
    // Guardamos las habilidades en el estado del modal
    modalState.skills = skills.map(s => ({
        skill: s
    }));
    modalState.activeIndex = 0;
    elemento = element;
    
    // Mostramos el overlay principal
    document.querySelector('.modal-overlay-skill').style.display = 'flex';
    
    // Cargamos el contenido inicial
    await updateModalContent();
}

/**
 * Actualiza el contenido visual (Imagen, Título, Stats y Niveles).
 */
async function updateModalContent() {
    // Ya usamos correctamente el overlay aquí
    const modal = document.querySelector('.modal-overlay-skill');
    const entry = modalState.skills[modalState.activeIndex];
    const skill = entry.skill;
    const isNF = skill.enhanced;

    // 1. Estética y Fondo según el elemento
    const content = modal.querySelector('.modal-content-skill');
    content.classList.toggle('is-novaflare', isNF);
    content.style.backgroundImage = `url('../imagenes/fondos/${elemento}.webp')`;

    // 2. Imagen e Iconos
    const tipoF = skill.type.replaceAll(' ', '_');
    const img = modal.querySelector('#modal-img-skill');
    img.src = `../imagenes/personajes/${skill.character_id}/${tipoF}.webp`;
    img.onerror = () => { img.src = `../imagenes/personajes/${skill.character_id}/${tipoF}.webp`; };

    // 3. Títulos y Badges
    modal.querySelector('#modal-name-skill').textContent = skill.name;
    modal.querySelector('#modal-type-target-skill').textContent = `${skill.type} | ${skill.target || 'N/A'}`;
    modal.querySelector('#novaflare-tag').style.display = isNF ? 'inline-block' : 'none';

    // 4. Stats básicas (Energía, Ruptura, etc.)
    modal.querySelector('#modal-stats-skill').innerHTML = `
        ${skill.energy ? `<div><b>Coste:</b> ${skill.energy}</div>` : ''}
        ${skill.energy_gain ? `<div><b>Energía:</b> ${skill.energy_gain}</div>` : ''}
        ${skill.break ? `<div><b>Ruptura:</b> ${skill.break}</div>` : ''}
    `;

    // 5. CARGAR NIVELES DESDE PHP
    modalLevels = {};
    try {
        const res = await fetch(`../php/obtener_info_pj.php?skill_id=${skill.id}&tipo=skill_levels`);
        const data = await res.json();
        const levelsArray = Array.isArray(data) ? data : [data];
        
        levelsArray.forEach(n => {
            if (n?.params) modalLevels[n.indice] = JSON.parse(n.params);
        });
    } catch (e) {
        console.error('Error cargando niveles:', e);
    }

    // Configurar el Slider
    const keys = Object.keys(modalLevels);
    const maxLvl = keys.length > 0 ? modalLevels[keys[0]].length : 1;
    const range = modal.querySelector('#skill-lvl-range');
    range.max = maxLvl;
    range.value = 1;
    modal.querySelector('#level-selector-box').style.display = maxLvl > 1 ? 'flex' : 'none';

    updateTabs();
    updateModalDescription();
}

/**
 * Procesa el texto de la descripción reemplazando {stat_x} por los valores del nivel.
 */
function updateModalDescription() {
    const modal = document.querySelector('.modal-overlay-skill');
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

/**
 * Maneja la navegación si hay varias habilidades en el mismo grupo.
 */
function navigateModal(direction) {
    const total = modalState.skills.length;
    modalState.activeIndex = (modalState.activeIndex + direction + total) % total;
    updateModalContent();
}

/**
 * Dibuja los puntitos (tabs) si hay más de una habilidad.
 */
function updateTabs() {
    // CAMBIO 2: Cambiamos la búsqueda por ID por la búsqueda por clase del overlay
    const modal = document.querySelector('.modal-overlay-skill');
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