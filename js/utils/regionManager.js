import { DEFAULT_REGION, STORAGE_KEYS, DOM_SELECTORS } from './constants.js';
import { setCurrentRegion } from './dateUtils.js';

export function getCurrentRegion() {
    return localStorage.getItem(STORAGE_KEYS.region) || DEFAULT_REGION;
}

export function setRegion(region, callback = null) {
    localStorage.setItem(STORAGE_KEYS.region, region);
    setCurrentRegion(region);

    updateRegionButtons(region);

    if (callback) {
        callback(region);
    }
}

export function initRegionButtons(onRegionChange) {
    const buttons = document.querySelectorAll(DOM_SELECTORS.regionBtn);

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const region = btn.dataset.region;
            setRegion(region, onRegionChange);
        });
    });

    const currentRegion = getCurrentRegion();
    updateRegionButtons(currentRegion);
    setCurrentRegion(currentRegion);
}

function updateRegionButtons(activeRegion) {
    const buttons = document.querySelectorAll(DOM_SELECTORS.regionBtn);

    buttons.forEach(btn => {
        if (btn.dataset.region === activeRegion) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
