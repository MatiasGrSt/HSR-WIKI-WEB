import './styles/Lista.css';
import { colores } from '../Utils/colores.js';

// 1. AÑADIDO: Recibir 'onItemClick' en los props
export default function Lista({ lightcones, versionActual, onItemClick }) {
    if (lightcones.length === 0) {
        return <div className="no-results">No Lightcones were found.</div>;
    }

    return (
        <ul className="lista-conos">
            {lightcones.map(p => {
                const rarezaNum = Number(p.rarity);
                const via = p?.path?.replaceAll(' ', '_') || "";

                const cssVars = {
                    '--color-rareza': colores.rarezas[rarezaNum],
                    '--color-via': colores.vias[p.path],
                    // Nota: Normalmente los conos de luz no tienen elemento en HSR, 
                    // pero si lo tienes en tu BD, déjalo.
                    '--color-elemento': colores.elementos[p.element] 
                };
                
                return (
                    <li 
                        key={p.name} 
                        id={p.id}
                        className="cone-card"
                        // 2. AÑADIDO: Combinar cssVars con el cursor y añadir el onClick
                        style={{ ...cssVars, cursor: 'pointer' }}
                        onClick={() => onItemClick(p)}
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
                            <img src={`../imagenes/LightCones/${p.id}.webp`} alt={p.name} className="cone-portrait" />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}