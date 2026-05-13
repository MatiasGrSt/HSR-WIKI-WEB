// src/components/Home/DailyReset.jsx
import { useState, useEffect } from 'react';

export default function DailyReset() {
    const [region, setRegion] = useState('eu');
    const [tiempoRestante, setTiempoRestante] = useState("00h : 00m : 00s");

    // 1. EL OYENTE: Este useEffect solo se encarga de escuchar si alguien cambia la región
    useEffect(() => {
        const actualizarRegion = (evento) => {
            setRegion(evento.detail); // evento.detail traerá 'eu', 'am' o 'as'
        };

        window.addEventListener('cambioDeRegion', actualizarRegion);
        
        // Limpiamos el evento si el componente desaparece (buena práctica)
        return () => window.removeEventListener('cambioDeRegion', actualizarRegion);
    }, []);

    // 2. EL RELOJ: El mismo código de antes, recalculando según la región actual
    useEffect(() => {
        const calcularTiempo = () => {
            const offsets = { eu: 2, am: -5, as: 6 };
            const offsetHours = offsets[region];
            const nowMs = Date.now();
            const offsetMs = offsetHours * 60 * 60 * 1000;
            
            const serverDate = new Date(nowMs + offsetMs);
            const resetTarget = new Date(serverDate);
            resetTarget.setUTCHours(4, 0, 0, 0);
            
            if (serverDate.getUTCHours() >= 4) {
                resetTarget.setUTCDate(resetTarget.getUTCDate() + 1);
            }
            
            const diff = resetTarget.getTime() - serverDate.getTime();
            
            const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutos = Math.floor((diff / 1000 / 60) % 60);
            const segundos = Math.floor((diff / 1000) % 60);
            
            setTiempoRestante(
                `${horas.toString().padStart(2, '0')}h : ` +
                `${minutos.toString().padStart(2, '0')}m : ` +
                `${segundos.toString().padStart(2, '0')}s`
            );
        };

        calcularTiempo();
        const intervalo = setInterval(calcularTiempo, 1000);

        return () => clearInterval(intervalo);
    }, [region]);

    return (
        <div className="daily-reset-wrapper">
            {/* Solo mostramos el reloj, los botones los controla el panel principal */}
            <div id="daily-countdown" className="timer-display">
                {tiempoRestante}
            </div>
            {/* Opcional: Un pequeño texto para que el usuario sepa de qué región es el reset */}
            <p style={{ textAlign: 'center', color: 'var(--ag-text-muted)', fontSize: '0.8rem', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Server: {region === 'eu' ? 'Europe' : region === 'am' ? 'America' : 'Asia / TW'}
            </p>
        </div>
    );
}