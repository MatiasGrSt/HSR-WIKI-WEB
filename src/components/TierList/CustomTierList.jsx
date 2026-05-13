import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { EV_META, EV_LEVELS } from './evMeta.js';
import './styles/CustomTierList.css';

const ROLES_COLS = ['DPS', 'Sub DPS', 'Amplifier', 'Support'];

let uid = 100;

const emptyRoleChars = () =>
    Object.fromEntries(ROLES_COLS.map(r => [r, []]));

function CharIcon({ char, from, onDragStart, onDragEnd }) {
    return (
        <div
            className={`ctl-char rarity-${char.rarity}`}
            draggable
            onDragStart={() => onDragStart(char, from)}
            onDragEnd={onDragEnd}
            title={char.name}
        >
            <div className="cc-char-circle-wrap">
                <div className="cc-char-circle">
                    <img
                        src={`/imagenes/Personajes/${char.name}/Icon.webp`}
                        alt={char.name}
                        loading="lazy"
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/imagenes/Utils/Error.webp'; }}
                    />
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
        </div>
    );
}

export default function CustomTierList({ personajes = [], seccion, onSeccionChange }) {
    const [rows, setRows] = useState(
        EV_LEVELS.map(ev => ({
            id:        `ev-${ev}`,
            label:     String(ev),
            bg:        EV_META[ev].bg,
            shadow:    EV_META[ev].shadow,
            chars:     [],
            roleChars: emptyRoleChars(),
        }))
    );
    const [pool, setPool]         = useState([...personajes]);
    const [editingId, setEditingId]   = useState(null);
    const [dragOver, setDragOver]     = useState(null);
    const [splitByRoles, setSplitByRoles] = useState(false);
    const drag     = useRef({ char: null, from: null });
    const boardRef = useRef(null);

    /* ── Toggle split ── */
    const toggleSplit = useCallback(() => {
        setRows(rs => {
            const allChars = [];
            rs.forEach(r => {
                allChars.push(...r.chars);
                ROLES_COLS.forEach(rol => allChars.push(...r.roleChars[rol]));
            });
            setPool(p => {
                const combined = [...p];
                allChars.forEach(c => { if (!combined.some(x => x.name === c.name)) combined.push(c); });
                return combined;
            });
            return rs.map(r => ({ ...r, chars: [], roleChars: emptyRoleChars() }));
        });
        setSplitByRoles(v => !v);
    }, []);

    /* ── Move character ──
       `from` / `to`: 'pool' | rowId | `${rowId}::${role}` (modo split)
    */
    const moveChar = useCallback((char, from, to) => {
        if (from === to) return;

        const removeFrom = (rs) => {
            if (from === 'pool') {
                setPool(p => p.filter(c => c.name !== char.name));
                return rs;
            }
            if (from.includes('::')) {
                const [rowId, rol] = from.split('::');
                return rs.map(r => r.id === rowId
                    ? { ...r, roleChars: { ...r.roleChars, [rol]: r.roleChars[rol].filter(c => c.name !== char.name) } }
                    : r);
            }
            return rs.map(r => r.id === from
                ? { ...r, chars: r.chars.filter(c => c.name !== char.name) }
                : r);
        };

        const addTo = (rs) => {
            if (to === 'pool') {
                setPool(p => p.some(c => c.name === char.name) ? p : [...p, char]);
                return rs;
            }
            if (to.includes('::')) {
                const [rowId, rol] = to.split('::');
                return rs.map(r => r.id === rowId && !r.roleChars[rol].some(c => c.name === char.name)
                    ? { ...r, roleChars: { ...r.roleChars, [rol]: [...r.roleChars[rol], char] } }
                    : r);
            }
            return rs.map(r => r.id === to && !r.chars.some(c => c.name === char.name)
                ? { ...r, chars: [...r.chars, char] }
                : r);
        };

        setRows(rs => addTo(removeFrom(rs)));
    }, []);

    const handleDragStart = useCallback((char, from) => { drag.current = { char, from }; }, []);
    const handleDragEnd   = useCallback(() => { drag.current = { char: null, from: null }; setDragOver(null); }, []);
    const handleDrop      = useCallback((to) => {
        const { char, from } = drag.current;
        if (char) moveChar(char, from, to);
        drag.current = { char: null, from: null };
        setDragOver(null);
    }, [moveChar]);

    /* ── Row management ── */
    const addRow = useCallback(() =>
        setRows(rs => [...rs, {
            id: `row-${uid++}`, label: 'Nueva',
            bg: '#4b5563', shadow: 'rgba(0,0,0,0.2)',
            chars: [], roleChars: emptyRoleChars(),
        }]), []);

    const removeRow = useCallback((id) => {
        const row = rows.find(r => r.id === id);
        if (row) {
            const all = [...row.chars, ...ROLES_COLS.flatMap(rol => row.roleChars[rol])];
            setPool(p => [...p, ...all.filter(c => !p.some(x => x.name === c.name))]);
        }
        setRows(rs => rs.filter(r => r.id !== id));
    }, [rows]);

    const updateLabel = useCallback((id, label) =>
        setRows(rs => rs.map(r => r.id === id ? { ...r, label } : r)), []);

    const updateBg = useCallback((id, bg) =>
        setRows(rs => rs.map(r => r.id === id ? { ...r, bg } : r)), []);

    /* ── Download ── */
    const download = async () => {
        if (!boardRef.current) return;
        const canvas = await html2canvas(boardRef.current, { backgroundColor: '#0a0a0e', useCORS: true, scale: 2 });
        const a = document.createElement('a');
        a.download = 'mi-tierlist.png';
        a.href = canvas.toDataURL();
        a.click();
    };

    return (
        <div className="ctl-wrapper">

            {/* ── Nav sección ── */}
            <div className="tla-nav" role="tablist">
                <button role="tab" aria-selected={seccion === 'oficial'}
                    className={`tla-nav-btn${seccion === 'oficial' ? ' active' : ''}`}
                    onClick={() => onSeccionChange('oficial')}>Oficial Tier List</button>
                <button role="tab" aria-selected={seccion === 'creador'}
                    className={`tla-nav-btn${seccion === 'creador' ? ' active' : ''}`}
                    onClick={() => onSeccionChange('creador')}>Custom Tier List</button>
            </div>

            {/* ── Opciones ── */}
            <div className="ctl-options">
                <label className="ctl-toggle">
                    <input
                        type="checkbox"
                        checked={splitByRoles}
                        onChange={toggleSplit}
                    />
                    <span className="ctl-toggle-track" />
                    Group by role
                </label>
            </div>

            {/* ── Board (capturado) ── */}
            <div className="ctl-board" ref={boardRef}>

                {/* Cabecera de roles (solo en modo split) */}
                {splitByRoles && (
                    <div className="ctl-roles-header">
                        <div className="ctl-roles-corner" />
                        {ROLES_COLS.map(r => (
                            <div key={r} className="ctl-roles-col-header">{r}</div>
                        ))}
                    </div>
                )}

                {rows.map(row => (
                    <div
                        key={row.id}
                        className={`ctl-row${!splitByRoles && dragOver === row.id ? ' drag-over' : ''}`}
                        onDragOver={!splitByRoles ? e => { e.preventDefault(); setDragOver(row.id); } : undefined}
                        onDragLeave={!splitByRoles ? () => setDragOver(null) : undefined}
                        onDrop={!splitByRoles ? () => handleDrop(row.id) : undefined}
                    >
                        {/* Etiqueta editable */}
                        <div
                            className="ctl-label"
                            style={{
                                background: row.bg,
                                boxShadow: `inset -4px 0 16px rgba(0,0,0,0.3), 3px 0 10px ${row.shadow}`,
                            }}
                        >
                            {editingId === row.id ? (
                                <input
                                    className="ctl-label-input"
                                    value={row.label}
                                    maxLength={6}
                                    autoFocus
                                    onChange={e => updateLabel(row.id, e.target.value)}
                                    onBlur={() => setEditingId(null)}
                                    onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                                />
                            ) : (
                                <span className="ctl-label-text" onClick={() => setEditingId(row.id)}>
                                    {row.label}
                                </span>
                            )}
                            {!row.bg.startsWith('linear') && (
                                <input
                                    type="color"
                                    className="ctl-color-pick"
                                    value={row.bg}
                                    onChange={e => updateBg(row.id, e.target.value)}
                                    title="Cambiar color"
                                />
                            )}
                        </div>

                        {/* Modo normal */}
                        {!splitByRoles && (
                            <div className="ctl-row-chars">
                                {row.chars.map(char => (
                                    <CharIcon key={char.name} char={char} from={row.id}
                                        onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
                                ))}
                            </div>
                        )}

                        {/* Modo split: 4 columnas por rol */}
                        {splitByRoles && ROLES_COLS.map(rol => {
                            const zoneId = `${row.id}::${rol}`;
                            return (
                                <div
                                    key={rol}
                                    className={`ctl-role-cell${dragOver === zoneId ? ' drag-over' : ''}`}
                                    onDragOver={e => { e.preventDefault(); setDragOver(zoneId); }}
                                    onDragLeave={() => setDragOver(null)}
                                    onDrop={() => handleDrop(zoneId)}
                                >
                                    {row.roleChars[rol].map(char => (
                                        <CharIcon key={char.name} char={char} from={zoneId}
                                            onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
                                    ))}
                                </div>
                            );
                        })}

                        {/* Quitar fila */}
                        <button className="ctl-remove-row" onClick={() => removeRow(row.id)} title="Eliminar fila">×</button>
                    </div>
                ))}
            </div>

            {/* ── Controles ── */}
            <div className="ctl-controls">
                <button className="ctl-btn ctl-btn--add" onClick={addRow}>+ Add row</button>
                <button className="ctl-btn ctl-btn--download" onClick={download}>↓ Download</button>
            </div>

            {/* ── Pool de personajes ── */}
            <div className="ctl-pool-section">
                <p className="ctl-pool-label">AVAILABLE CHARACTERS</p>
                <div
                    className={`ctl-pool${dragOver === 'pool' ? ' drag-over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver('pool'); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={() => handleDrop('pool')}
                >
                    {pool.length > 0
                        ? pool.map(char => (
                            <CharIcon key={char.name} char={char} from="pool"
                                onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
                        ))
                        : <span className="ctl-pool-empty">¡All characters have been placed!</span>
                    }
                </div>
            </div>
        </div>
    );
}
