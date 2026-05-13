import React, { useState, useEffect } from 'react';
import './styles/CharacterPage.css'
import { colores } from '../Utils/colores.js';
import InfoTab from './InfoTab';
import SkillsTab from './SkillsTab';

export default function CharacterPage() {
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('info'); // <-- Por defecto en 'info'
    const [isNovaflareMode, setIsNovaflareMode] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const personaje = urlParams.get('personaje');

        if (!personaje) {
            setError("No se ha especificado ningún personaje.");
            return;
        }

        document.title = `${personaje} - HSR Wiki`;

        // LLAMADA A TU NUEVA API DE ASTRO
        fetch(`/api/get-character.json?personaje=${personaje}&tipo=all`)
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener datos del personaje.");
                return res.json();
            })
            .then(json => setData(json))
            .catch(err => setError(err.toString()));
    }, []);

    if (error) return <div className="error-message">🚨 Error: {error}</div>;
    if (!data) return <div className="loading">⏳ Cargando datos astrales...</div>;

    const { info, skills, major_traces, minor_traces } = data;
    const isNovaflareChar = Number(info.novaflare) === 1;

    const cssVars = {
        '--color-rareza': colores.rarezas[Number(info.rarity)],
        '--color-via': colores.vias[info.path],
        '--color-elemento': colores.elementos[info.element]
    };

    return (
        /* ⚠️ CAMBIO CLAVE 1: Usamos la clase "general" para que tu CSS funcione */
        <div style={cssVars} className="general"> 
            
            {/* 1. SPLASH ART */}
            <img 
                className={`splash_art ${activeTab !== 'info' ? 'difuminado' : ''}`} 
                src={`../imagenes/Personajes/${info.name}/Splash_Art.webp`} 
                alt={`Splash Art ${info.name}`} 
            />

            {/* 2. NOMBRE DEL PERSONAJE */}
            <h1 id="name">{info.name}</h1>

            {/* 3. ELEMENTO, VÍA Y RAREZA + SWITCH NOVAFLARE */}
            <div className="rarity-novaflare-group">
                <div className="element_path_rarity">
                    <div className="element_path">
                        <div id="element">
                            <img id="element_icon" src={`../imagenes/Utils/Tipos/${info.element}.webp`} alt={info.element} />
                            <p id="element_name" className="element" style={{ marginRight: '5px' }}>
                                {info.element.toUpperCase()}
                            </p>
                        </div>
                        <div id="path">
                            <img id="path_icon" src={`../imagenes/Utils/Vias/${info.path}.webp`} alt={info.path} style={{ marginLeft: '5px' }} />
                            <p id="path_name" className="path">{info.path.toUpperCase().replaceAll('_', ' ')}</p>
                        </div>
                    </div>
                    <div id="rarity">
                        {Array.from({ length: Number(info.rarity) }).map((_, i) => (
                            <img key={i} src={`../imagenes/Utils/${info.rarity}.webp`} className="star-icon" alt="star" />
                        ))}
                    </div>
                </div>

                {/* SWITCH NOVAFLARE — posicionado a la izquierda del panel */}
                {isNovaflareChar && (
                    <div className="novaflare-switch-container">
                        <div className="novaflare-switch-wrapper">
                            <span className="switch-label">Novaflare</span>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    className="novaflare-toggle-input"
                                    checked={isNovaflareMode} 
                                    onChange={(e) => setIsNovaflareMode(e.target.checked)} 
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. BOTONES DE NAVEGACIÓN */}
            <div className="botones">
                <img src="../imagenes/Utils/Info.webp" className={activeTab === 'info' ? 'activo' : ''} onClick={() => setActiveTab('info')} alt="Info" />
                <img src="../imagenes/Utils/Abilities.webp" className={activeTab === 'habilidades' ? 'activo' : ''} onClick={() => setActiveTab('habilidades')} alt="Habilidades" />
                <img src="../imagenes/Utils/Eidolons.webp" className={activeTab === 'eidolones' ? 'activo' : ''} onClick={() => setActiveTab('eidolones')} alt="Eidolones" />
                <img src="../imagenes/Utils/Guide.webp" className={activeTab === 'guide' ? 'activo' : ''} onClick={() => setActiveTab('guide')} alt="Guía" />
            </div>

            {/* 6. CONTENEDOR DE LAS PESTAÑAS */}
            {/* ⚠️ CAMBIO CLAVE 2: Le damos flex-grow y position relative para que los 'absolute' de dentro (InfoTab) sepan dónde colocarse */}
            
            {activeTab === 'info' && <InfoTab info={info} />}
            {activeTab === 'habilidades' && (
                <SkillsTab info={info} skills={skills} majorTraces={major_traces} minorTraces={minor_traces} isNovaflareMode={isNovaflareMode} />
            )}
            {activeTab === 'eidolones' && <div style={{color:'white', textAlign:'center'}}>Sección de Eidolones en construcción...</div>}
            {activeTab === 'guide' && <div style={{color:'white', textAlign:'center'}}>Sección de Guía en construcción...</div>}
            
        </div>
    );
}