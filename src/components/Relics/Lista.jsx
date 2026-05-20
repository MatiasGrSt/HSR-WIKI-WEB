import './styles/Lista.css';
import { colores } from '../Utils/colores.js';

export default function Lista({ relics, versionActual }) {
    const listaSegura = relics || [];
    
    // CORRECCIÓN 1: Si la lista es igual a 0, entonces sí muestra el mensaje.
    if (listaSegura.length === 0) {
        return <div className="no-results">No relics were found.</div>;
    }

    return (
        <ul className="lista-relics">
            {listaSegura.map(r => {
                const name = r.name;
                const type = r.type;
                const tpc_desc = r['2pc_desc']; 
                const fpc_desc = r['4pc_desc'];

                const cssVars = {
                    '--color-relic': colores.relics[type],
                };
                
                return (
                    <li key={name} id={r.id} className="relic-card" style={cssVars}>
                        <div className='relic-basic'>
                            <img src={`../imagenes/Relics/${r.id}.webp`} alt={r.name} className="relic-portrait" />
                            <div className='relic-name-type'>
                                <p className="relic-name">{name}</p>
                                <p className='relic-type'>{type}</p>
                            </div>
                        </div>
                        <div className='relic-info'>
                            <p className='relic-desc'><span className="relic-set-bonus">2 Pc:</span> {tpc_desc}</p>
                            {fpc_desc && <p className='relic-desc'><span className="relic-set-bonus">4 Pc:</span> {fpc_desc}</p>}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}