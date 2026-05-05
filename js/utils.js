// ====================================================================
// UTILIDADES COMPARTIDAS - SIMPLE Y DIRECTO
// ====================================================================

/**
 * Crea el switch Novaflare en un contenedor dado
 * @param {HTMLElement} container - Contenedor donde insertar el switch
 * @param {Function} callback - Función que se llama al cambiar (recibe 'normal' o 'novaflare')
 * @returns {HTMLElement} El elemento del switch
 */
export function createNovaflareSwitch(container, callback) {
    const wrapper = document.createElement('div');
    wrapper.className = 'novaflare-switch-wrapper';
    wrapper.innerHTML = `
        <span class="switch-label">Novaflare</span>
        <label class="switch">
            <input type="checkbox" id="novaflare-toggle">
            <span class="slider round"></span>
        </label>
    `;

    const checkbox = wrapper.querySelector('input[type="checkbox"]');

    checkbox.addEventListener('change', function() {
        console.log('Switch clicked, checked:', this.checked);
        const mode = this.checked ? 'novaflare' : 'normal';
        console.log('Calling callback with mode:', mode);
        callback(mode);
    });

    container.appendChild(wrapper);
    console.log('Switch created and appended to container');
    return wrapper;
}

/**
 * Muestra u oculta el switch
 */
export function toggleSwitchVisibility(switchElement, show = true) {
    if (switchElement) {
        switchElement.style.display = show ? 'flex' : 'none';
        console.log('Switch visibility toggled to:', show ? 'visible' : 'hidden');
    }
}

/**
 * Resetea el checkbox del switch
 */
export function resetSwitch(switchElement) {
    if (switchElement) {
        const checkbox = switchElement.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
    }
}

