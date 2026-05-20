import './styles/Lista.css';
import { colores } from '../Utils/colores.js';

export default function Lista({ lightcones, versionActual }) {
    if (lightcones.length === 0) {
        return <div className="no-results">No Lightcones were found.</div>;
    }

    return (
        <ul className="lista-conos">
            {lightcones.map(p => {
                const rarezaNum = Number(p.rarity);
                const via = p?.path?.replaceAll(' ', '_') || "";

                const cssVars = {
                    '--color-rareza': colores.rarezas[Number(p.rarity)],
                    '--color-via': colores.vias[p.path],
                    '--color-elemento': colores.elementos[p.element]
                };
                
                return (
                    <li 
                        key={p.name} 
                        id={p.id}
                        className="cone-card"
                        style={cssVars}
                    >
                        <div>
                            <img src={`../imagenes/Utils/Vias/${via}.webp`} alt={p.path} className="cone-path-icon" />
                            
                            <div className="rarity-stars">
                                {Array.from({ length: rarezaNum }).map((_, i) => (
                                    <img 
                                        key={i} 
                                        src={`../imagenes/Utils/${rarezaNum}.webp`} 
                                        className="star-icon" 
                                        alt="star" 
                                    />
                                ))}
                            </div>
                            
                            <p className="cone-name">{p.name}</p>
                            <img src={`../imagenes/Utils/LightCones/${p.id}.webp`} alt={p.name} className="cone-portrait" />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}