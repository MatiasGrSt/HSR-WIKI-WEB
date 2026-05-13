// src/components/Home/EndgameTracker.jsx
import { useState, useEffect } from 'react';
import './styles/EndgameTracker_D.css';

export default function EndgameTracker({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <section className="endgame-section">
            {/* 1. TÍTULO CENTRADO CON ESTILO GLOBAL */}
            <h2 className="section-title">END GAMES</h2>

            {/* 2. LA LISTA AHORA USARÁ UN GRID */}
            <div className="endgame-grid">
                {data.map(item => (
                    <EndgameCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}

function EndgameCard({ item }) {
    const [daysLeft, setDaysLeft] = useState("");

    useEffect(() => {
        const target = new Date(item.end_time);
        const diff = target - new Date();
        if (diff <= 0) { setDaysLeft("Finalizado"); return; }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

        if (days > 0) {
            setDaysLeft(`${days}d ${hours}h`);
        } else {
            setDaysLeft(`${hours}h restantes`);
        }
    }, [item.end_time]);

    const typeNames = { moc: 'Memory of Chaos', pf: 'Pure Fiction', as: 'Apocalyptic Shadow', aa: 'Anomaly Arbitration' };

    return (
        <div className={`eg-panel eg-${item.type}`}>
            {/* Efecto de brillo de fondo al hacer hover */}
            <div className="eg-glow"></div>

            <div className="eg-panel-content">
                {/* Cabecera centradacon icono y tipo */}
                <div className="eg-panel-header">
                    <div className="eg-icon-wrap">
                        {/* Como en Directus pusiste texto "moc", uso ese texto si no hay imagen */}
                        {item.icon_url ? (
                            <img src={item.icon_url} 
                            alt={item.type} 
                            className="eg-icon" />
                        ) : (
                            <span className="eg-icon-placeholder">{item.type}</span>
                        )}
                    </div>
                    <span className="eg-type">{typeNames[item.type]}</span>
                </div>

                {/* Título principal centrado */}
                <h3 className="eg-title">{item.title}</h3>

                {/* Sección de bufo con diseño jerarquizado */}
                <div className="eg-buff-box">
                    <span className="buff-label">TURBULENCIA / EFFECTS</span>
                    <span className="buff-name-display">{item.buff_name}</span>
                    <p className="buff-desc">{item.buff_description}</p>
                </div>

                {/* Temporizador abajo a la derecha */}
                <div className="eg-footer">
                    <span className="eg-timer">⏳ {daysLeft}</span>
                </div>
            </div>
        </div>
    );
}