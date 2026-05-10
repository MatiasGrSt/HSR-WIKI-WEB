// ====================================================================
// UTILIDADES COMPARTIDAS - SIMPLE Y DIRECTO
// ====================================================================
/**
 * Crea el switch Novaflare en un contenedor dado
 * @param {Function} callback - Función que se llama al cambiar (recibe 'normal' o 'novaflare')
 * @returns {HTMLElement} El elemento del switch
 */
export function initNovaflareSwitches(callback) {
    const inputs = document.querySelectorAll('.novaflare-toggle-input');

    inputs.forEach(input => {
        input.addEventListener('change', function() {
            const isChecked = this.checked;
            const mode = isChecked ? 'novaflare' : 'normal';

            // Sincronizamos todos los otros switches de la página
            inputs.forEach(otherInput => {
                if (otherInput !== this) otherInput.checked = isChecked;
            });

            callback(mode);
        });
    });
}

export function toggleSwitchVisibility(show = true) {
    document.querySelectorAll('.novaflare-switch-container').forEach(cont => {
        cont.style.display = show ? 'flex' : 'none';
    });
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

