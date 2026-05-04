// Contenedores donde se inyectará la información
const eventsList = document.getElementById('events-list');
const codesList = document.getElementById('codes-list');

/**
 * Procesa e inyecta un único evento al contenedor
 * @param {Object} data - Objeto con la información del evento
 */
function renderEvent(data) {
    // Mapeo de estados a las clases CSS definidas en home.css
    const statusClass = data.status === 'activo' ? 'status-active' : 'status-upcoming';
    const statusText = data.status === 'activo' ? 'Current' : 'Upcoming';

    const html = `
        <div class="event-card" style="background-image: url('${data.icon_url}');">
            <div class="event-overlay">
                <div class="event-info">
                    <h3>${data.title}</h3>
                    <span class="status-label ${statusClass}">${statusText}</span>
                </div>
                <p class="time-display">Ends in: ${data.end_time}</p>
                <button class="expand-btn" onclick="toggleEvent(this)">▼</button>
            </div>
            <!-- Contenido extra para la expansión -->
            <div class="event-details" style="padding: 20px; display: none;">
                <p>${data.description || 'No hay detalles adicionales.'}</p>
            </div>
        </div>
    `;
    eventsList.innerHTML += html;
}

/**
 * Función principal asíncrona para cargar datos[cite: 15]
 */
async function main() {
    try {
        // Petición al backend
        const res = await fetch('../backend/php/home.php?accion=eventos');
        const data = await res.json();

        // Limpiar contenedor antes de inyectar
        eventsList.innerHTML = '';
        console.log("Datos recibidos:", data); // Debug: Ver qué se recibe del backend

        // Si el PHP devuelve un array, iteramos sobre él
        if (Array.isArray(data)) {
            data.forEach(evento => renderEvent(evento));
        } else {
            renderEvent(data);
        }
    } catch (error) {
        console.error("Error cargando eventos:", error);
    }
}

// Función de expansión[cite: 6, 16]
window.toggleEvent = function(btn) {
    const card = btn.closest('.event-card');
    const details = card.querySelector('.event-details');
    
    card.classList.toggle('expanded');
    
    if (card.classList.contains('expanded')) {
        btn.innerText = '▲';
        if (details) details.style.display = 'block';
    } else {
        btn.innerText = '▼';
        if (details) details.style.display = 'none';
    }
};

// Iniciar carga cuando el DOM esté listo[cite: 15]
document.addEventListener('DOMContentLoaded', () => main());