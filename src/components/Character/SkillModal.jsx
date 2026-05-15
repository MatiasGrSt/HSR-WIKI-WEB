// src/components/Character/SkillModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { colores } from '../Utils/colores.js';
import './styles/SkillModal.css';

export default function SkillModal({ skills, element, path, characterName, onClose }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [level, setLevel] = useState(1);
    const [skillLevels, setSkillLevels] = useState({});
    const [maxLevel, setMaxLevel] = useState(1);

    const skill = skills[activeIndex];
    const isNF = !!skill?.enhanced;
    const hasMultiple = skills.length > 1;

    // ── Fetch de niveles cada vez que cambia el skill activo ──
    useEffect(() => {
        if (!skill?.id) return;

        setSkillLevels({});
        setLevel(1);
        setMaxLevel(1);

        fetch(`/api/get-character.json?skill_id=${skill.id}&tipo=skill_levels`)
            .then(res => res.json())
            .then(data => {
                const levelsArray = Array.isArray(data) ? data : [data];
                const parsed = {};

                levelsArray.forEach(n => {
                    if (n?.params) {
                        try {
                            parsed[n.indice] = JSON.parse(n.params);
                        } catch { /* ignore malformed */ }
                    }
                });

                setSkillLevels(parsed);

                // Calcular max level del primer índice
                const keys = Object.keys(parsed);
                if (keys.length > 0) {
                    setMaxLevel(parsed[keys[0]].length);
                }
            })
            .catch(err => console.error('Error cargando niveles:', err));
    }, [skill?.id]);

    // ── Interpolación de {stat_x} en la descripción ──
    const getDescription = useCallback(() => {
        let text = skill?.description || '';

        Object.keys(skillLevels).forEach(idx => {
            const valores = skillLevels[idx];
            const val = valores[level - 1] || valores[valores.length - 1];
            text = text.replace(
                new RegExp(`\\{stat_${idx}\\}`, 'g'),
                `<span class="stat">${val}</span>`
            );
        });

        return text;
    }, [skill?.description, skillLevels, level]);

    // ── Navegación ──
    const navigate = (direction) => {
        setActiveIndex((prev) => (prev + direction + skills.length) % skills.length);
    };

    // ── Cerrar al hacer click en overlay ──
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // ── Cerrar con Escape ──
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && hasMultiple) navigate(-1);
            if (e.key === 'ArrowRight' && hasMultiple) navigate(1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [hasMultiple, onClose]);

    if (!skill) return null;

    const tipoLimpio = skill.type?.replaceAll(' ', '_') || '';

    // Inyectamos las CSS vars que se pierden al salir del .general via portal
    const portalVars = {
        '--color-elemento': colores.elementos[element] || '#00f0ff',
        '--color-via': colores.vias[path] || '#00f0ff',
    };

    return createPortal(
        <div className="modal-overlay-skill" style={portalVars} onClick={handleOverlayClick}>
            <div
                className={`modal-content-skill ${isNF ? 'is-novaflare' : ''}`}
                style={{ backgroundImage: `url('../imagenes/Utils/Fondos/${element}.webp')` }}
            >
                {/* ── Botón cerrar ── */}
                <span className="modal-close-skill" onClick={onClose}>&times;</span>

                {/* ── Header: Flechas + Imagen + Título ── */}
                <div className="modal-header-container">
                    {hasMultiple && (
                        <button className="modal-arrow" onClick={() => navigate(-1)}>&#10094;</button>
                    )}

                    <div className="modal-header-skill">
                        <div className="modal-img-wrapper">
                            <img
                                src={`../imagenes/Personajes/${characterName}/${skill.icon || tipoLimpio}.webp`}
                                alt={skill.name}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = `../imagenes/Personajes/${characterName}/${tipoLimpio}.webp`;
                                }}
                            />
                        </div>
                        <div className="modal-title-box">
                            <div className="modal-name-row">
                                <h2>{skill.name}</h2>
                                {isNF && <span className="novaflare-badge">Novaflare</span>}
                            </div>
                            <p>{skill.type} | {skill.target || 'N/A'}</p>
                        </div>
                    </div>

                    {hasMultiple && (
                        <button className="modal-arrow" onClick={() => navigate(1)}>&#10095;</button>
                    )}
                </div>

                {/* ── Tabs (dots) ── */}
                {hasMultiple && (
                    <div className="modal-tabs-container">
                        {skills.map((_, i) => (
                            <div
                                key={i}
                                className={`skill-tab ${i === activeIndex ? 'active' : ''}`}
                                onClick={() => setActiveIndex(i)}
                            />
                        ))}
                    </div>
                )}

                {/* ── Selector de nivel ── */}
                {maxLevel > 1 && (
                    <div className="level-selector-cont">
                        <label>Level: <span className="lvl-display">{level}</span></label>
                        <input
                            type="range"
                            min="1"
                            max={maxLevel}
                            value={level}
                            onChange={(e) => setLevel(parseInt(e.target.value))}
                        />
                    </div>
                )}

                {/* ── Stats básicas ── */}
                <div className="modal-stats-skill">
                    {skill.energy && <div><b>Cost:</b> {skill.energy}</div>}
                    {<div><b>Energy Gain:</b> {skill.energy_gain}</div>}
                    {<div><b>Break:</b> {skill.break}</div>}
                </div>

                {/* ── Divider ── */}
                <hr className="modal-divider" />

                {/* ── Descripción con valores interpolados ── */}
                <div
                    className="modal-description-skill"
                    dangerouslySetInnerHTML={{ __html: getDescription() }}
                />
            </div>
        </div>,
        document.body
    );
}
