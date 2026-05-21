// src/components/Personajes/PersonajesApp.jsx
import { useState, useMemo } from 'react';
import Buscador from './Buscador.jsx';
import Lista from './Lista.jsx';
import ModalInfo from './Modal.jsx';

export default function LightConesApp({ conosIniciales, statsConos, versionActual }) {
    // 1. AHORA LOS FILTROS SON ARRAYS. Un array vacío [] significa "Todos"
    const [busqueda, setBusqueda] = useState('');
    const [filtroRareza, setFiltroRareza] = useState([]);
    const [filtroVia, setFiltroVia] = useState([]);

    const [itemSeleccionado, setItemSeleccionado] = useState(null);

    // 2. Lógica Multi-Filtro
    const conosMostrados = useMemo(() => {
        let filtrados = conosIniciales.filter(p => {
            const vPersonaje = parseFloat(p.version);
            
            // Filtros que eliminan (Return false)
            if (vPersonaje >= (versionActual + 0.31)) return false;
            if (busqueda && !p.name.toLowerCase().includes(busqueda.toLowerCase())) return false;
            
            // Si el array tiene elementos (es decir, NO está en "Todos") 
            // Y el valor del personaje NO está incluido en el array de seleccionados -> fuera.
            if (filtroRareza.length > 0 && !filtroRareza.includes(String(p.rarity))) return false;
            if (filtroVia.length > 0 && !filtroVia.includes(p.path)) return false;

            return true;
        });

        return filtrados.sort((a, b) => a.name.localeCompare(b.name));
    }, [conosIniciales, versionActual, busqueda, filtroRareza, filtroVia]);

    return (
        <>
            <Buscador 
                busqueda={busqueda} setBusqueda={setBusqueda}
                filtroRareza={filtroRareza} setFiltroRareza={setFiltroRareza}
                filtroVia={filtroVia} setFiltroVia={setFiltroVia}
            />
            <Lista lightcones={conosMostrados} versionActual={versionActual} onItemClick={setItemSeleccionado} />

            {itemSeleccionado && (
                <ModalInfo 
                    item={itemSeleccionado} 
                    statsConos={statsConos}
                    onClose={() => setItemSeleccionado(null)} 
                />
            )}
        </>
    );
}