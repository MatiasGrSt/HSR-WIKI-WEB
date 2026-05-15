// src/components/SkillsTab.jsx - ACTUALIZADO
import React, { useState, useMemo } from 'react';
import './styles/EidolonsTab.css';

export default function EidolonsTab({ info, eidolons, isNovaflareMode }) {
    const groupedEiodolons = useMemo(() => {
        let grupos = { normal: {}, novaflare: {} };
        eidolons.forEach(t => {
            const esNf = Number(t.enhanced) === 1;
            const categoria = esNf ? 'novaflare' : 'normal';
            if (!grupos[categoria][t.lvl]) grupos[categoria][t.lvl] = [];
            grupos[categoria][t.lvl].push(t);
        });
        return grupos;
    }, [eidolons]);

    return (
        <div className="eidolones">       
            {Object.keys(groupedEiodolons.normal).map((tipo, idx) => {
                const hasNf = groupedEiodolons.novaflare?.[tipo]?.length > 0;
                const isCurrentlyNF = isNovaflareMode && hasNf;
                const currentEidolon = isCurrentlyNF ? groupedEiodolons.novaflare[tipo] : groupedEiodolons.normal[tipo];

                if (!currentEidolon || currentEidolon.length === 0) return null;
                const EidolonInfo = currentEidolon[0];

                return (
                    // CAMBIO 1: El contenedor externo es invisible y posiciona todo.
                    // Usamos una combinación de ID único para posición y clase para estilos.
                    <div 
                        key={tipo} 
                        id={`eidolonContainer_${idx+1}`} 
                        className="shard-container"
                    >
                        {/* CAMBIO 2: El elemento shard ahora solo contiene el cristal y el número */}
                        <div 
                            id={`eidolon_${idx+1}`} 
                            className="shard" 
                            style={{ backgroundImage: `url('/imagenes/Personajes/${info.name}/Eidolon_${idx + 1}.webp')` }}
                        >
                            <div className="shard-number">{idx+1}</div>
                            {isCurrentlyNF && <span className="skill-novaflare-badge">Novaflare</span>}
                        </div>

                        {/* CAMBIO 3: El popup ahora es hermano de .shard, no hijo. */}
                        <div className="popup eidolon-popup">
                            <span className="lvl-tag">Eidolon {idx+1}</span>
                            <h3 className="type">{EidolonInfo.name}</h3>
                            <p 
                                className='description' 
                                dangerouslySetInnerHTML={{ __html: EidolonInfo.description }} 
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}