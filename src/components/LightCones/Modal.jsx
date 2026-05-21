// src/components/LightCones/Modal.jsx
import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { colores } from '../Utils/colores.js';
import './styles/Modal.css';

export default function ModalInfo({ item, statsConos, onClose }) {
    if (!item) return null;

    const [level, setLevel] = useState(1);
    const [statLevel, setStatLevel] = useState(1);

    // Find stats for this light cone from pre-fetched data
    const stats = (statsConos || []).find(s => s.id === item.id) || null;

    // Parse params: list of lists (each sub-list = one superimposition level)
    let params = [];
    try {
        if (item.params) {
            params = typeof item.params === 'string' ? JSON.parse(item.params) : item.params;
        }
    } catch { /* ignore malformed */ }

    const maxLevel = params.length || 1;

    // Lock page scroll while modal is open
    useEffect(() => {
        const main = document.getElementById('main-scroll');
        if (main) main.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        return () => {
            if (main) main.style.overflow = '';
            document.body.style.overflow = '';
        };
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);


    // Calculate stat at current level: base + step * (level - 1)
    const calcStat = (base, step) => {
        return Math.floor(base + step * (statLevel - 1));
    };

    // Format a param value: if float, multiply by 100 and append %
    const formatValue = (val) => {
        const num = Number(val);
        if (!isNaN(num) && num !== Math.floor(num)) {
            return `${(num * 100).toFixed(2).replace(/\.00$/, '')}`;
        }
        return val;
    };

    // Interpolate #N[i] and #N[fX] in the description
    const getDescription = useCallback(() => {
        let text = item?.description || '';

        if (params.length > 0) {
            const currentLevelParams = params[level - 1] || params[params.length - 1] || [];

            // #N[i] and #N[fX] → same behavior: multiply floats ×100 and append %
            text = text.replace(/#(\d+)\[(?:i|f\d+)\]/g, (match, num) => {
                const idx = parseInt(num) - 1;
                const val = currentLevelParams[idx];
                if (val !== undefined && val !== null) {
                    return `<span class="lc-stat-value">${formatValue(val)}</span>`;
                }
                return match;
            });
        }

        return text;
    }, [item?.description, params, level]);

    const rarezaNum = Number(item.rarity);
    const via = item?.path?.replaceAll(' ', '_') || '';

    const portalVars = {
        '--lc-color-rarity': colores.rarezas[rarezaNum] || '#f5a623',
        '--lc-color-path': colores.vias[item.path] || '#00f0ff',
    };

    return createPortal(
        <div className="lc-modal-overlay" style={portalVars} onClick={onClose}>
            <div className="lc-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Close button */}
                <span className="lc-modal-close" onClick={onClose}>&times;</span>

                {/* Header */}
                <div className="lc-modal-header">
                    <div className="lc-modal-img-wrapper">
                        <img
                            src={`../imagenes/LightCones/Preview/${item.id}.webp`}
                            alt={item.name}
                        />
                    </div>
                    <div className="lc-modal-title-box">
                        <h2>{item.name}</h2>
                        <div className="lc-modal-meta">
                            <img
                                src={`../imagenes/Utils/Vias/${via}.webp`}
                                alt={item.path}
                                className="lc-path-icon"
                            />
                            <span className="lc-path-name">{item.path?.replaceAll('_', ' ')}</span>
                            <span className="lc-meta-sep">|</span>
                            <div className="lc-rarity-stars">
                                {Array.from({ length: rarezaNum }).map((_, i) => (
                                    <img
                                        key={i}
                                        src={`../imagenes/Utils/${rarezaNum}.webp`}
                                        className="lc-star-icon"
                                        alt="star"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="lc-modal-divider" />

                {/* Stats section */}
                {stats && (
                    <div className="lc-stats-section">
                        <div className="lc-level-selector">
                            <label>
                                Level: <span className="lc-lvl-display">{statLevel}</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="80"
                                value={statLevel}
                                onChange={(e) => setStatLevel(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="lc-stats-grid">
                            <div className="lc-stat-box">
                                <span className="lc-stat-label">HP</span>
                                <span className="lc-stat-num">{calcStat(stats.hp_base, stats.hp_step)}</span>
                            </div>
                            <div className="lc-stat-box">
                                <span className="lc-stat-label">ATK</span>
                                <span className="lc-stat-num">{calcStat(stats.atk_base, stats.atk_step)}</span>
                            </div>
                            <div className="lc-stat-box">
                                <span className="lc-stat-label">DEF</span>
                                <span className="lc-stat-num">{calcStat(stats.def_base, stats.def_step)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <hr className="lc-modal-divider" />

                {/* Superimposition slider */}
                {maxLevel > 1 && (
                    <div className="lc-level-selector">
                        <label>
                            Superimposition: <span className="lc-lvl-display">S{level}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max={maxLevel}
                            value={level}
                            onChange={(e) => setLevel(parseInt(e.target.value))}
                        />
                    </div>
                )}

                {/* Description with interpolated values */}
                <div
                    className="lc-modal-description"
                    dangerouslySetInnerHTML={{ __html: getDescription() }}
                />
            </div>
        </div>,
        document.body
    );
}