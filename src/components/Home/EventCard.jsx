// src/components/Home/EventCard.jsx
import { useState, useEffect } from 'react';
import './styles/EventCard.css';

export default function EventCard({ evento, region }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [timeLeft, setTimeLeft] = useState("Calculating...");

    const isGlobal = evento.is_global == 1 || evento.is_global === true;
    const badgeClass = isGlobal ? "badge-global" : "badge-regional";
    const labelText = isGlobal ? "🌍 Global" : "📍 Regional";
    
    const timePrefix = evento.status === 'activo' ? 'Ends in:' : 'Starts in:';

    useEffect(() => {
        const updateTimer = () => {
            const ahora = new Date();
            const fechaObjetivo = new Date(evento.status === 'activo' ? evento.end_time : evento.start_time);
            
            let horasOffset = 0;
            if (!isGlobal) {
                if (region === 'eu') horasOffset = -1;
                if (region === 'am') horasOffset = 6;
                if (region === 'as') horasOffset = -7;
            }
            
            fechaObjetivo.setHours(fechaObjetivo.getHours() + horasOffset);
            const diff = fechaObjetivo - ahora;

            if (diff <= 0) {
                setTimeLeft(evento.status === 'activo' ? "Ended" : "¡Started!");
                return;
            }

            const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutos = Math.floor((diff / (1000 * 60)) % 60);

            if (dias > 0) {
                setTimeLeft(`${dias}d ${horas}h`);
            } else {
                setTimeLeft(`${horas}h ${minutos}m`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [evento, region, isGlobal]);

    return (
        <div className={`event-card ${isExpanded ? 'expanded' : ''}`} style={{ backgroundImage: `url('${evento.icon_url || ''}')` }}>
            <div className="event-overlay">
                <div className="event-info">
                    <h3 className="event-title">{evento.title}</h3>
                    
                    <div className="event-badges-container">
                        <span className={`event-badge ${badgeClass}`}>
                            {labelText}
                        </span>
                    </div>
                </div>
                
                <p className="time-countdown">
                    {timePrefix} <span className="time-highlight">{timeLeft}</span>
                </p>
                
                <button className="expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? '▲' : '▼'}
                </button>
            </div>

            {isExpanded && (
                <div className="event-details-content">
                    <div className="time-info">
                        <span>Start: {evento.start_time}</span>
                        <span className="separator">|</span>
                        <span>End: {evento.end_time}</span>
                    </div>
                    <p className="event-desc">
                        {evento.description || 'There are no additional details.'}
                    </p>
                </div>
            )}
        </div>
    );
}