import { initRegionButtons, setRegion, getCurrentRegion } from './utils/regionManager.js';
import { updateCountdowns, updateDailyReset, startCountdownUpdates } from './utils/countdownUpdater.js';
import { renderAllEvents, toggleEventExpand } from './utils/eventRenderer.js';
import { setCurrentRegion } from './utils/dateUtils.js';
import { DOM_SELECTORS } from './utils/constants.js';

const codesList = document.getElementById(DOM_SELECTORS.codesList.slice(1));
const charactersList = document.getElementById('characters-list');

let globalEvents = [];
let finVersionDate = null;

async function loadEvents() {
    try {
        const res = await fetch('../php/home2.php?accion=eventos');
        const data = await res.json();

        finVersionDate = data.fin_version;
        globalEvents = data.eventos || [];

        renderAllEvents(globalEvents, finVersionDate);
        updateCountdowns();
    } catch (error) {
        console.error('Error cargando eventos:', error);
    }
}

async function loadCodes() {
    try {
        const res = await fetch('../php/home2.php?accion=codes');
        const codigos = await res.json();

        if (!codesList) return;

        let codesHTML = '';
        codigos.forEach(codigo => {
            codesHTML += `
                <a href="https://hsr.hoyoverse.com/gift?code=${codigo.values}" class="code-item" target="_blank">
                    <span class="code-value">${codigo.values}</span>
                </a>
            `;
        });

        codesList.innerHTML = codesHTML;
    } catch (error) {
        console.error('Error cargando códigos:', error);
    }
}

async function loadFeaturedCharacters() {
    try {
        const res = await fetch('../php/home2.php?accion=featured_characters');
        const personajes = await res.json();

        if (!charactersList) return;

        if (personajes.length === 0) {
            charactersList.innerHTML = '<p style="color: #b0b0b0;">No hay personajes destacados en este momento.</p>';
            return;
        }

        let charactersHTML = '';
        personajes.forEach(personaje => {
            const charName = personaje;
            // Link to the character page (from root to html/)
            const charLink = `html/personaje.html?personaje=${encodeURIComponent(charName)}`;
            // We use Portrait.webp for the circular icon, falling back to Presentation.webp if not found by the browser
            const imgPath = `imagenes/personajes/${charName}/Icon.webp`;
            
            charactersHTML += `
                <a href="${charLink}" class="char-card">
                    <img src="${imgPath}" alt="${charName}">
                    <h3 class="char-name">${charName}</h3>
                </a>
            `;
        });

        charactersList.innerHTML = charactersHTML;
    } catch (error) {
        console.error('Error cargando personajes destacados:', error);
    }
}

async function main() {
    try {
        const region = getCurrentRegion();
        setCurrentRegion(region);

        initRegionButtons(() => {
            renderAllEvents(globalEvents, finVersionDate);
            updateCountdowns();
            updateDailyReset();
        });

        await loadEvents();
        await loadCodes();
        await loadFeaturedCharacters();

        startCountdownUpdates();
    } catch (error) {
        console.error('Error en inicialización:', error);
    }
}

window.toggleEvent = function (btn) {
    toggleEventExpand(btn);
};

document.addEventListener('DOMContentLoaded', () => {
    main();
});
