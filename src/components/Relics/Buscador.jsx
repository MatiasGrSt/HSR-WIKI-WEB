// src/components/Personajes/Buscador.jsx
import '../Personajes/styles/Buscador.css';
import { colores } from '../Utils/colores.js';

export default function Buscador(props) {
    const { 
        busqueda, setBusqueda, 
        filtroTipo, setFiltroTipo, 
    } = props;

    // --- LA MAGIA DEL TOGGLE MULTI-SELECCIÓN ---
    const manejarToggle = (estadoActual, setEstado, valor) => {
        if (valor === 'todos') {
            setEstado([]); // Limpiamos todo, lo que activa "Todos"
            return;
        }

        if (estadoActual.includes(valor)) {
            // Si ya estaba seleccionado, lo quitamos de la lista
            setEstado(estadoActual.filter(item => item !== valor));
        } else {
            // Si no estaba, lo añadimos conservando los demás
            setEstado([...estadoActual, valor]);
        }
    };

    return (
        <section className="panel-filters glass-dark">
            <div className="buscador-rarezas">
                <input 
                    type="text" 
                    className="nombre" 
                    placeholder="Search relic..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="rareza">
                    <FilterButton 
                        label="Todos" value="todos" currentArray={filtroTipo} 
                        toggle={() => manejarToggle(filtroTipo, setFiltroTipo, 'todos')} 
                        icon="/imagenes/Utils/Todos.svg" color="#fff" 
                    />
                    <FilterButton 
                        label="5 Estrellas" value="5" currentArray={filtroTipo} 
                        toggle={() => manejarToggle(filtroTipo, setFiltroTipo, 'Cavern Relic')} 
                        icon="/imagenes/Utils/5.webp" color={colores.rarezas[5]} 
                    />
                    <FilterButton 
                        label="4 Estrellas" value="4" currentArray={filtroTipo} 
                        toggle={() => manejarToggle(filtroTipo, setFiltroTipo, 'Planar Ornament')} 
                        icon="/imagenes/Utils/4.webp" color={colores.rarezas[4]} 
                    />
                </div>
            </div>
        </section>
    );
}

// Subcomponente adaptado a múltiples selecciones
function FilterButton({ value, currentArray, toggle, icon, color }) {
    // Es "Todos" y se enciende si el array está vacío. O es un filtro normal y se enciende si está en el array.
    const isChecked = value === 'todos' ? currentArray.length === 0 : currentArray.includes(value);

    return (
        <label style={{ '--c': color }} className={`filter-btn ${isChecked ? 'active' : ''}`}>
            {/* Ahora usamos checkbox semánticamente, aunque esté oculto por CSS */}
            <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={toggle} 
                style={{ display: 'none' }} 
            />
            <div className="filter-icon" style={{ backgroundImage: `url(${icon})` }}></div>
        </label>
    );
}