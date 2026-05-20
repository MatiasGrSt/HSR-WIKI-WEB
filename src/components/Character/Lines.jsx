import React from 'react';
import { plantillasVias } from '../Utils/templateVias.js';

export default function SkillTree({ personaje }) {
  const plantilla = plantillasVias[personaje.path];

  if (!plantilla) return null;

  return (
    <svg
      className="skill-tree-lines"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {plantilla.connections.map((conn, index) => {
        const origen = plantilla.nodes[conn.from];
        const destino = plantilla.nodes[conn.to];
        const passThrough = conn.q;

        if (!origen || !destino) return null;

        // Convertimos 'passThrough' a un punto único si es un array de 1 elemento
        let passPoint = passThrough;
        if (Array.isArray(passThrough) && passThrough.length === 1) {
          passPoint = passThrough[0];
        }

        let pathData;
        if (Array.isArray(passThrough) && passThrough.length === 2) {
          // Curva Bézier cúbica interpolada para pasar exactamente por 2 puntos en t=1/3 y t=2/3
          const q1 = passThrough[0];
          const q2 = passThrough[1];
          const c1x = 3 * q1.x - 1.5 * q2.x - (5 / 6) * origen.x + (1 / 3) * destino.x;
          const c1y = 3 * q1.y - 1.5 * q2.y - (5 / 6) * origen.y + (1 / 3) * destino.y;
          const c2x = 3 * q2.x - 1.5 * q1.x + (1 / 3) * origen.x - (5 / 6) * destino.x;
          const c2y = 3 * q2.y - 1.5 * q1.y + (1 / 3) * origen.y - (5 / 6) * destino.y;
          pathData = `M ${origen.x} ${origen.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${destino.x} ${destino.y}`;
        } else if (passPoint && !Array.isArray(passPoint)) {
          // Curva Bézier cuadrática que pasa por 1 punto
          const cx = 2 * passPoint.x - 0.5 * origen.x - 0.5 * destino.x;
          const cy = 2 * passPoint.y - 0.5 * origen.y - 0.5 * destino.y;
          pathData = `M ${origen.x} ${origen.y} Q ${cx} ${cy} ${destino.x} ${destino.y}`;
        } else {
          // Línea recta
          pathData = `M ${origen.x} ${origen.y} L ${destino.x} ${destino.y}`;
        }

        return (
          <path
            key={index}
            d={pathData}
            stroke="#ffffff"
            strokeWidth="0.7" // Un ancho mayor hace que se vea más sólida y "completa"
            fill="none"
            opacity="0.8"
            // strokeDasharray="0" elimina el efecto punteado para que sea una línea sólida
            strokeLinecap="round" // Esto hace que los extremos de la línea sean suaves
            strokeLinejoin="round" // Esto une las líneas de forma fluida
          />
        );
      })}
    </svg>
  );
}