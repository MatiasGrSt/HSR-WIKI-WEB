import { lista } from './personajes.js';

async function inicializarBuscador() {
    const formulario = document.querySelector('form');
    const inputBuscador = document.querySelector('.nombre');

    if (!formulario || !inputBuscador) return;

    const obtenerYFiltrar = () => {
        const rarezas = Array.from(formulario.querySelectorAll('.rareza input:checked:not([name*="all"])')).map(cb => cb.name);
        const elementos = Array.from(formulario.querySelectorAll('.elemento input:checked:not([name*="all"])')).map(cb => cb.name);
        const vias = Array.from(formulario.querySelectorAll('.via input:checked:not([name*="all"])')).map(cb => cb.name);

        lista({
            nombre: inputBuscador.value,
            rarezas: rarezas.join(','),
            elementos: elementos.join(','),
            vias: vias.join(',')
        });
    };

    const manejarSeleccionarTodos = (claseCategoria, nombreCheckboxTodos) => {
        const checkboxTodos = formulario.querySelector(`.${claseCategoria} input[name="${nombreCheckboxTodos}"]`);
        const otros = formulario.querySelectorAll(`.${claseCategoria} input[type="checkbox"]:not([name="${nombreCheckboxTodos}"])`);
    
        checkboxTodos.addEventListener('change', () => {
            if (checkboxTodos.checked) {
                otros.forEach(cb => cb.checked = false);
            }
            obtenerYFiltrar();
        });
    
        otros.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    checkboxTodos.checked = false;
                } else {
                    const ninguno = Array.from(otros).every(c => !c.checked);
                    if (ninguno) checkboxTodos.checked = true;
                }
                obtenerYFiltrar();
            });
        });
    };

    manejarSeleccionarTodos('rareza', 'all-rarity');
    manejarSeleccionarTodos('elemento', 'all-elements');
    manejarSeleccionarTodos('via', 'all-paths');

    inputBuscador.addEventListener('input', obtenerYFiltrar);
}

document.addEventListener('DOMContentLoaded', inicializarBuscador);