import './styles/Lista.css';
import { colores } from '../Utils/colores.js';

export default function Lista({ personajes, versionActual }) {
    if (personajes.length === 0) {
        return <div className="no-results">No characters were found.</div>;
    }

    return (
        <ul className="lista-personajes">
            {personajes.map(p => {
                const rarezaNum = Number(p.rarity);
                const vPersonaje = parseFloat(p.version);
                const esNovaflare = Number(p.novaflare) === 1;

                const cssVars = {
                    '--color-rareza': colores.rarezas[Number(p.rarity)],
                    '--color-via': colores.vias[p.path],
                    '--color-elemento': colores.elementos[p.element]
                };
            
                return (
                    <li 
                        key={p.name} 
                        id={p.name}
                        className="char-card"
                        style={cssVars}
                    >
                        <a href={`personaje?personaje=${p.name}`}>
                            <img src={`../imagenes/Utils/Tipos/${p.element}.webp`} alt={p.element} className="char-element-icon" />
                            
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
                            
                            <p className="char-name">{p.name}</p>
                            <img src={`../imagenes/Personajes/${p.name}/Presentation.webp`} alt={p.name} className="char-portrait" />
                        </a>

                        {vPersonaje === versionActual && <p className='version' id='nuevo'>NEW!</p>}
                        {vPersonaje > versionActual && <p className='version'>{p.version}</p>}
                        {esNovaflare && <p className='novaflare'>Novaflare</p>}
                    </li>
                );
            })}
        </ul>
    );
}