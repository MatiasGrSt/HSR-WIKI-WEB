// src/components/Personajes/PersonajesApp.jsx
import { useState, useMemo } from 'react';
import Buscador from './Buscador.jsx';
import Lista from './Lista.jsx';

export default function PersonajesApp({ personajesIniciales, versionActual }) {
    // 1. AHORA LOS FILTROS SON ARRAYS. Un array vacío [] significa "Todos"
    const [busqueda, setBusqueda] = useState('');
    const [filtroRareza, setFiltroRareza] = useState([]);
    const [filtroElemento, setFiltroElemento] = useState([]);
    const [filtroVia, setFiltroVia] = useState([]);

    // 2. Lógica Multi-Filtro
    const personajesMostrados = useMemo(() => {
        let filtrados = personajesIniciales.filter(p => {
            const vPersonaje = parseFloat(p.version);
            
            // Filtros que eliminan (Return false)
            if (vPersonaje >= (versionActual + 0.31)) return false;
            if (busqueda && !p.name.toLowerCase().includes(busqueda.toLowerCase())) return false;
            
            // Si el array tiene elementos (es decir, NO está en "Todos") 
            // Y el valor del personaje NO está incluido en el array de seleccionados -> fuera.
            if (filtroRareza.length > 0 && !filtroRareza.includes(String(p.rarity))) return false;
            if (filtroElemento.length > 0 && !filtroElemento.includes(p.element)) return false;
            if (filtroVia.length > 0 && !filtroVia.includes(p.path)) return false;

            return true;
        });

        return filtrados.sort((a, b) => a.name.localeCompare(b.name));
    }, [personajesIniciales, versionActual, busqueda, filtroRareza, filtroElemento, filtroVia]);

    return (
        <>
            <Buscador 
                busqueda={busqueda} setBusqueda={setBusqueda}
                filtroRareza={filtroRareza} setFiltroRareza={setFiltroRareza}
                filtroElemento={filtroElemento} setFiltroElemento={setFiltroElemento}
                filtroVia={filtroVia} setFiltroVia={setFiltroVia}
            />
            <Lista personajes={personajesMostrados} versionActual={versionActual} />
        </>
    );
}