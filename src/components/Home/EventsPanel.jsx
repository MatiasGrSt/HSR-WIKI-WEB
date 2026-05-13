// src/components/Home/EventsPanel.jsx
import { useState } from 'react';
import EventCard from './EventCard.jsx';
import './styles/EventsPanel.css';

export default function EventsPanel({ initialEvents }) {
    const [region, setRegion] = useState('eu');
    const eventos = initialEvents || [];

    const activos = eventos.filter(ev => ev.status === 'activo');
    const proximos = eventos.filter(ev => ev.status === 'proximamente' || ev.status === 'anunciado');

    const handleRegionClick = (nuevaRegion) => {
        setRegion(nuevaRegion); // 1. Actualiza los eventos
        
        // 2. Avisa al resto de la web (al Reloj)
        window.dispatchEvent(new CustomEvent('cambioDeRegion', { detail: nuevaRegion }));
    };

    return (
        <section className="section-events">
            <h2 className="section-title">EVENTS</h2>

            {/* BOTONES DE REGIÓN */}
            <div className="region-selector">
                {['eu', 'am', 'as'].map((r) => {
                    const nombres = { eu: 'Europe', am: 'America', as: 'Asia / TW' };
                    return (
                        <button 
                            key={r}
                            onClick={() => handleRegionClick(r)}
                            className={`region-btn ${region === r ? 'activo' : ''}`}
                        >
                            {nombres[r]}
                        </button>
                    );
                })}
            </div>

            {/* COLUMNAS */}
            <div className="events-columns">
                <div className="events-column">
                    <h3 className="column-subtitle">Actives</h3>
                    <div className="events-column-list">
                        {activos.length === 0 ? <p className="empty-events-msg">There are no active events.</p> : null}
                        {activos.map(ev => <EventCard key={ev.id} evento={ev} region={region} />)}
                    </div>
                </div>
                
                <div className="events-column">
                    <h3 className="column-subtitle">Upcoming</h3>
                    <div className="events-column-list">
                        {proximos.length === 0 ? <p className="empty-events-msg">There are no upcoming events.</p> : null}
                        {proximos.map(ev => <EventCard key={ev.id} evento={ev} region={region} />)}
                    </div>
                </div>
            </div>
        </section>
    );
}