// src/components/Personajes/PersonajesApp.jsx
import { useState, useMemo } from 'react';
import Buscador from './Buscador.jsx';
import Lista from './Lista.jsx';

export default function RelicsApp({ relicsIniciales, versionActual }) {
    // 1. AHORA LOS FILTROS SON ARRAYS. Un array vacío [] significa "Todos"
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState([]);
    console.log(relicsIniciales)

    // 2. Lógica Multi-Filtro
    const relicsMostrados = useMemo(() => {
        let filtrados = relicsIniciales.filter(r => {
            if (busqueda && !p.name.toLowerCase().includes(busqueda.toLowerCase())) return false;
            if (filtroTipo.length > 0 && !filtroTipo.includes(r.type)) return false;

            return true;
        });

        return filtrados.sort((a, b) => a.name.localeCompare(b.name));
    }, [relicsIniciales, versionActual, busqueda]);

    return (
        <>
            <Buscador 
                busqueda={busqueda} setBusqueda={setBusqueda}
                filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo}
            />
            <Lista lightcones={relicsMostrados} versionActual={versionActual} />
        </>
    );
}