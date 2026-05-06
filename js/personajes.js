import { ordenarLista } from './ordenar.js';
import { colores } from './colores.js';

export async function lista(filtros = {}) {
    try {
        const queryParams = new URLSearchParams(filtros).toString();
        const res = await fetch(`../php/datos.php?${queryParams}`);
        const data = await res.json();

        const response = await fetch('../php/home.php?accion=version');
        const general = await response.json();
        const vActual = parseFloat(general.version);

        const contenedor = document.querySelector('.lista-personajes');
        if (!contenedor) return;

        contenedor.innerHTML = "";

        data.forEach(p => {
            // Convertimos a números para evitar errores de comparación
            const vPersonaje = parseFloat(p.version);
            const esNovaflare = Number(p.novaflare) === 1;
            const rareza = Number(p.rarity)

            const colorRareza = colores.rarezas[rareza];
            const colorElemento = colores.elementos[p.element];
            const colorVia = colores.vias[p.path];

            document.documentElement.style.setProperty('--color-rareza', colorRareza);
            document.documentElement.style.setProperty('--color-via', colorVia);
            document.documentElement.style.setProperty('--color-elemento', colorElemento);

            const estrellasHTML = Array(rareza).fill(`<img src="../imagenes/Utilities/${rareza}.webp" class="star-icon">`).join('');

            const li = document.createElement("li");
            li.id = p.name;

            // Estructura base
            li.innerHTML = ` 
                <a href="personaje.html?personaje=${p.name}">
                    <img src="../imagenes/personajes/Tipos/${p.element}.webp">
                    <div class="rarity-stars">
                        ${estrellasHTML}
                    </div>
                    <p>${p.name}</p>
                    <img src='../imagenes/personajes/${p.name}/Presentation.webp'>
                </a>
            `;

            // Asignar el fondo de manera específica sin romper otras reglas CSS
            li.style.backgroundImage = `url('../imagenes/fondos/${p.element}.webp')`;
            li.style.backgroundSize = 'cover';
            li.style.backgroundPosition = 'center';
            li.style.backgroundRepeat = 'no-repeat';

            // 1. Lógica de Versiones (Corregida con parseFloat)
            if (vPersonaje === vActual) {
                li.innerHTML += `<p class='version' id='nuevo'>NEW!</p>`;
            }
            else if (vPersonaje > vActual && vPersonaje < (vActual + 0.31)) { // +0.31 para evitar errores de coma flotante
                li.innerHTML += `<p class='version'>${p.version}</p>`;
            }
            else if (vPersonaje >= (vActual + 0.31)) {
                li.style.display = 'none';
            }

            // 2. Lógica de Novaflare (Corregida)
            if (esNovaflare) {
                li.innerHTML += `<p class='novaflare'>Novaflare</p>`;
            }

            contenedor.appendChild(li);
        });

        // Ordenamos la lista después de que se haya llenado
        ordenarLista();

    } catch (error) {
        console.error("Error al cargar desde la BD:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => lista());