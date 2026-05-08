export function inicializarModal() {
    const modal = document.getElementById('modal-info-habilidad');
    if (!modal) return;

    // Botón de cerrar
    modal.querySelector('.modal-close-skill').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => { 
        if (e.target === modal) modal.style.display = 'none'; 
    });

    // Flechas
    modal.querySelector('#modal-prev-skill').addEventListener('click', () => navigateModal(-1));
    modal.querySelector('#modal-next-skill').addEventListener('click', () => navigateModal(1));

    // Barra de nivel
    modal.querySelector('#skill-lvl-range').addEventListener('input', () => updateModalDescription());
}