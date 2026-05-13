import React, { useState, useMemo } from 'react';
import { EV_LEVELS, EV_META } from './evMeta.js';
import './styles/OfficialTierList.css';

const MODOS = [
    { key: 'forg_hall',  label: 'Memory of Chaos' },
    { key: 'pure_fiction', label: 'Pure Fiction' },
    { key: 'apoc_shadow', label: 'Apoc. Shadow' },
    { key: 'arb_atipic', label: 'Anom. Arbitration' },
];

const ROLES = ['DPS', 'Sub DPS', 'Amplifier', 'Support'];

export default function OfficialTierList({ personajes, tierListData, seccion, onSeccionChange }) {
    const [modoJuego, setModoJuego] = useState('forg_hall');

    const tablaData = useMemo(() => {
        const tabla = {};
        EV_LEVELS.forEach(ev => {
            tabla[ev] = {};
            ROLES.forEach(role => { tabla[ev][role] = []; });
        });

        if (!tierListData?.length || !personajes?.length) return tabla;

        tierListData.forEach(fila => {
            const charInfo = personajes.find(p => p.name === fila.character_id);
            if (!charInfo) return;

            const rawEv = fila[modoJuego];
            if (rawEv === null || rawEv === undefined) return;

            const ev  = Number(rawEv);
            const rol = fila.role;
            if (tabla[ev]?.[rol]) tabla[ev][rol].push(charInfo);
        });

        return tabla;
    }, [tierListData, personajes, modoJuego]);

    return (
        <div className="otl-wrapper">

            {/* ── Nav sección (Oficial / Creador) ── */}
            <div className="tla-nav" role="tablist">
                <button role="tab" aria-selected={seccion === 'oficial'}
                    className={`tla-nav-btn${seccion === 'oficial' ? ' active' : ''}`}
                    onClick={() => onSeccionChange('oficial')}>Oficial Tier List</button>
                <button role="tab" aria-selected={seccion === 'creador'}
                    className={`tla-nav-btn${seccion === 'creador' ? ' active' : ''}`}
                    onClick={() => onSeccionChange('creador')}>Custom Tier List</button>
            </div>

            {/* ── Selector de modo ── */}
            <div className="otl-modes" role="tablist">
                {MODOS.map(({ key, label }) => (
                    <button
                        key={key}
                        role="tab"
                        aria-selected={modoJuego === key}
                        className={`otl-mode-btn${modoJuego === key ? ' active' : ''}`}
                        onClick={() => setModoJuego(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Tabla 2D ── */}
            <div className="otl-table">

                {/* Cabecera: esquina + 4 roles */}
                <div className="otl-corner" aria-hidden="true" />
                {ROLES.map(role => (
                    <div key={role} className="otl-role-header">{role}</div>
                ))}

                {/* Filas por EV */}
                {EV_LEVELS.map(ev => {
                    const meta = EV_META[ev];
                    return (
                        <React.Fragment key={ev}>
                            <div
                                className="otl-ev-label"
                                style={{ background: meta.bg, boxShadow: `inset -4px 0 16px rgba(0,0,0,0.3), 3px 0 10px ${meta.shadow}` }}
                            >
                                <span className="otl-ev-num">{ev}</span>
                            </div>

                            {ROLES.map(role => (
                                <div key={role} className="otl-cell">
                                    {tablaData[ev][role].map(char => (
                                        <a
                                            key={char.name}
                                            href={`/personaje.html?personaje=${encodeURIComponent(char.name)}`}
                                            className={`otl-char rarity-${char.rarity}`}
                                            title={char.name}
                                        >
                                            <div className="cc-char-circle-wrap">
                                                <div className="cc-char-circle">
                                                    <img
                                                        src={`/imagenes/Personajes/${char.name}/Icon.webp`}
                                                        alt={char.name}
                                                        loading="lazy"
                                                        onError={e => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = '/imagenes/Utils/Error.webp';
                                                        }}
                                                    />
                                                    {Number(char.novaflare) === 1 && (
                                                        <span className="otl-badge otl-badge--nova">NF</span>
                                                    )}
                                                </div>
                                                {char.element && (
                                                    <img
                                                        className="cc-char-badge cc-char-badge--element"
                                                        src={`/imagenes/Utils/Tipos/${char.element}.webp`}
                                                        alt={char.element}
                                                        title={char.element}
                                                    />
                                                )}
                                                {char.path && (
                                                    <img
                                                        className="cc-char-badge cc-char-badge--path"
                                                        src={`/imagenes/Utils/Vias/${char.path}.webp`}
                                                        alt={char.path}
                                                        title={char.path}
                                                    />
                                                )}
                                            </div>
                                            <span className="cc-char-name">{char.name}</span>
                                        </a>
                                    ))}
                                </div>
                            ))}
                        </React.Fragment>
                    );
                })}
            </div>

            <p className="otl-disclaimer">
                EV values serve as a reference and may vary depending on the team and account.
            </p>
        </div>
    );
}
