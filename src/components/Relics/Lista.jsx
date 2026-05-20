import './styles/Lista.css';
import { colores } from '../Utils/colores.js';

export default function Lista({ relics, versionActual }) {
    if (relics.length === 0) {
        return <div className="no-results">No relics were found.</div>;
    }

    return (
        <ul className="lista-conos">
            {relics.map(r => {
                const name = r.name;
                const type = r.type;
                const tpc_desc = r['2pc_desc']; 
                const fpc_desc = r['4pc_desc']
                
                return (
                    <li 
                        key={name} 
                        id={r.id}
                        className="relic-card"
                    >
                        <div>
                            <img src={`../imagenes/Utils/LightCones/${r.id}.webp`} alt={r.name} className="relic-portrait" />
                            <div className='relic-info'>
                                <p className="relic-name">{name}</p>
                                <p className='relic-type'>{type}</p>
                                <p className='relic-desc'>{tpc_desc}</p>
                                {fpc_desc && <p className='relic-desc'>{tpc_desc}</p>}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}