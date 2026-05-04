import { initRegionButtons, setRegion, getCurrentRegion } from './utils/regionManager.js';
import { updateCountdowns, updateDailyReset, startCountdownUpdates } from './utils/countdownUpdater.js';
import { renderAllEvents, toggleEventExpand } from './utils/eventRenderer.js';
import { setCurrentRegion } from './utils/dateUtils.js';
import { DOM_SELECTORS } from './utils/constants.js';

const codesList = document.getElementById(DOM_SELECTORS.codesList.slice(1));

let globalEvents = [];
let finVersionDate = null;

async function loadEvents() {
    try {
        const res = await fetch('../backend/php/home.php?accion=eventos');
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
        const res = await fetch('../backend/php/home.php?accion=codes');
        const codigos = await res.json();

        if (!codesList) return;

        let codesHTML = '';
        codigos.forEach(codigo => {
            codesHTML += `
                <div class="code-item">
                    <code>${codigo.values}</code>
                </div>
            `;
        });

        codesList.innerHTML = codesHTML;
    } catch (error) {
        console.error('Error cargando códigos:', error);
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
