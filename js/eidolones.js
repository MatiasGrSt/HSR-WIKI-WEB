// Añadimos 'personaje' como argumento de la función
export async function cargarEidolones(personaje) {
    try {
        // Le mandamos el nombre del personaje al PHP por la URL
        const res = await fetch(`http://localhost/php/obtener_info_pj.php?personaje=${personaje}&tipo=eidolons`); 
        const eidolones = await res.json(); 
        
        const contenedorPrincipal = document.querySelector('.eidolones');

        // Si por algún motivo no hay datos, evitamos que se rompa la página
        if (!eidolones || eidolones.length === 0) {
            contenedorPrincipal.innerHTML = "<p>No hay datos de eidolones.</p>";
            return;
        }

        // Inyectamos directamente el HTML en el contenedor principal
        contenedorPrincipal.innerHTML = `
            ${eidolones.map(e => `
                <div class="shard shard-${e.lvl}" 
                    style="--bg: url('../imagenes/personajes/${personaje}/Eidolon_${e.lvl}.webp'); loading='lazy';">
                    <div class="shard-number">${e.lvl}</div>
                    
                    <div class="eidolon-popup">
                        <span class="lvl-tag">Eidolon ${e.lvl}</span>
                        <h3>${e.name}</h3>
                        <p>${e.description}</p>
                    </div>
                </div>
            `).join('')}
        `;
    } catch (error) {
        console.error("Error al cargar eidolones:", error);
    }
}