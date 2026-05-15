// src/components/SkillsTab.jsx
import React, { useState, useMemo } from 'react';
import './styles/SkillsTab.css';
import './styles/SkillsPositionsByPath.css';
import { organizarHabilidades, juntarHabilidades, transformarTrace } from './Utils.jsx';
//import SkillModal from './SkillModal'; // Lo crearemos en el siguiente paso

export default function SkillsTab({ info, skills, majorTraces, minorTraces, isNovaflareMode }) {
    const [modalData, setModalData] = useState({ isOpen: false, skillsArray: [], type: '' });

    // 1. Procesar Habilidades (Equivalente a skillsUtils.js)
    const processedSkills = useMemo(() => {
        const { normal, novaflare } = organizarHabilidades(skills);
        return {
            normal: juntarHabilidades(normal),
            novaflare: juntarHabilidades(novaflare)
        };
    }, [skills]);

    // 2. Procesar Major Traces
    const groupedMajorTraces = useMemo(() => {
        let grupos = {
            normal: {},
            novaflare: {}
        };

        majorTraces.forEach(t => {
            const esNf = Number(t.enhanced) === 1;
            const categoria = esNf ? 'novaflare' : 'normal';

            // Agrupamos por nombre. 
            if (!grupos[categoria][t.name]) {
                grupos[categoria][t.name] = [];
            }
            grupos[categoria][t.name].push(t);
        });

        return grupos;
    }, [majorTraces]);

    const handleOpenModal = (tipo, isNF) => {
        const skillsArray = isNF ? processedSkills.novaflare[tipo] : processedSkills.normal[tipo];
        if (skillsArray && skillsArray.length > 0) {
            setModalData({ isOpen: true, skillsArray, type: tipo });
        }
    };

    // Limpiamos la vía para usarla en todo el componente
    const viaLimpia = info.path.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return (
        <div className="habilidades">
            <div 
                id="hab_cont" 
                style={{ backgroundImage: `url('../imagenes/Utils/ViasBg/Path_${info.path}.webp')` }}
            >
                
                {/* RENDERIZAR HABILIDADES */}
                {Object.keys(processedSkills.normal).map(tipo => {
                    const tipoLimpio = tipo.replaceAll(' ', '_');
                    const hasNf = processedSkills.novaflare[tipo]?.length > 0;
                    const isCurrentlyNF = isNovaflareMode && hasNf;
                    
                    // Determinamos qué versión mostrar según el switch
                    const currentSkills = isCurrentlyNF ? processedSkills.novaflare[tipo] : processedSkills.normal[tipo];

                    if (!currentSkills) return null;

                    return (
                        <div key={tipo} className={`skill skill-trigger via-${viaLimpia}`} id={tipoLimpio} onClick={() => handleOpenModal(tipo, isCurrentlyNF)}>
                            <img src={`../imagenes/Personajes/${info.name}/${tipoLimpio}.webp`} alt={tipo} />
                            {isCurrentlyNF && <span className="skill-novaflare-badge">Novaflare</span>}
                            <div className="popup skill-popup">
                                <h3 className="type">{tipo}</h3>
                                {/* Mini iconos dentro del popup */}
                                <div className="icons">
                                    {currentSkills.map((s, i) => (
                                        <img 
                                            key={i} 
                                            src={`../imagenes/Personajes/${info.name}/${i === 0 ? tipoLimpio : `${tipoLimpio}_${i + 1}`}.webp`} 
                                            onError={e => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = `/imagenes/Personajes/${info.name}/${tipoLimpio}.webp`;
                                            }}
                                            alt="icon" 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* RENDERIZAR MAJOR TRACES */}
                {Object.keys(groupedMajorTraces.normal).map((tipo, idx) => {
                    const hasNf = groupedMajorTraces.novaflare?.[tipo]?.length > 0;
                    const isCurrentlyNF = isNovaflareMode && hasNf;
                    

                    const currentTraces = isCurrentlyNF ? groupedMajorTraces.novaflare[tipo] : groupedMajorTraces.normal[tipo];

                    if (!currentTraces || currentTraces.length === 0) return null;

                    const traceInfo = currentTraces[0];

                    return (
                        // Añadimos las clases limpias y un ID único basado en el idx
                        <div key={tipo} className={`trace_ma via-${viaLimpia}`} id={`trace_ma_${idx+1}`}>
                            
                            <img src={`../imagenes/Personajes/${info.name}/Pasiva_${idx + 1}.webp`} alt={tipo} />
                            
                            {isCurrentlyNF && <span className="skill-novaflare-badge">Novaflare</span>}
                            
                            <div className="popup MAtrace-popup">

                                <h3 className="type">{traceInfo.name}</h3>

                                <p 
                                    className='description' 
                                    dangerouslySetInnerHTML={{ __html: traceInfo.description }} 
                                />
                            </div>
                        </div>
                    );
                })}

                {/* RENDERIZAR MINOR TRACES */}
                {minorTraces.map((rastro, idx) => {
                    const { tipoLimpio, valorLimpio } = transformarTrace(rastro.type, rastro.value, info.element);
                    return (

                        <div key={`min${idx}`} className={`trace_mi via-${viaLimpia}`} id={`trace_mi_${idx+1}`}>
                            <img src={`../imagenes/Utils/Stats/${tipoLimpio.replaceAll(' ', '_')}.webp`} alt={tipoLimpio} />
                            <div className="popup MItrace-popup">
                                <h3 className="type">{tipoLimpio}</h3>
                                <p className="value-text">{valorLimpio}</p>
                            </div>
                        </div>
                    );
                })}

                {/* MODAL */}
                {modalData.isOpen && (
                    <SkillModal 
                        skills={modalData.skillsArray} 
                        element={info.element} 
                        onClose={() => setModalData({ ...modalData, isOpen: false })} 
                    />
                )}
            </div>
        </div>
    );
}