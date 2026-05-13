// src/components/Home/VersionCountdown.jsx
import { useState, useEffect } from 'react';
import './styles/VersionCountdown.css'; // Importamos su propio CSS limpio

export default function VersionCountdown({ version, endDate }) {
    const [timeLeft, setTimeLeft] = useState("Calculando...");

    useEffect(() => {
        if (!endDate) {
            setTimeLeft("Datos de servidor no encontrados");
            return;
        }

        const updateTimer = () => {
            const ahora = new Date();
            // Los mantenimientos de versión en HSR son globales, todos a la misma hora exacta.
            // Asumimos que tu endDate en la base de datos ya es esa hora exacta (UTC o la que uses).
            const fechaObjetivo = new Date(endDate); 
            const diff = fechaObjetivo - ahora;

            if (diff <= 0) {
                setTimeLeft("¡Mantenimiento iniciado!");
                return;
            }

            const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutos = Math.floor((diff / 1000 / 60) % 60);
            const segundos = Math.floor((diff / 1000) % 60);

            // Formateo para que siempre tenga dos cifras
            const hStr = horas.toString().padStart(2, '0');
            const mStr = minutos.toString().padStart(2, '0');
            const sStr = segundos.toString().padStart(2, '0');

            setTimeLeft(`${dias}d : ${hStr}h : ${mStr}m : ${sStr}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return (
        <div className="version-banner glass-dark">
            <div className="version-info">
                <span className="version-label">SYSTEM STATUS</span>
                <h2 className="version-title">VERSION {version}</h2>
            </div>
            
            <div className="version-timer-container">
                <span className="version-timer-label">SERVER SHUTDOWNS IN:</span>
                <div className="version-timer">
                    {timeLeft}
                </div>
            </div>
        </div>
    );
}