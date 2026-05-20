// tracesTemplates.js
// Coordenadas: x = CSS left%, y = CSS top%
export const plantillasVias = {
        "Destruction": {
        nodes: {
            // Skills
            BA: { x: 23, y: 46 },     // Basic_Attack
            SK: { x: 77, y: 46 },     // Skill
            ULT: { x: 50, y: 49.5 },   // Ultimate
            TAL: { x: 50, y: 27.5 },   // Talent
            TEC: { x: 50, y: 74.5 },   // Technique
            // Major Traces
            MA1: { x: 21.5, y: 77.5 },   // trace_ma_1
            MA2: { x: 78.5, y: 77.5 },   // trace_ma_2
            MA3: { x: 50, y: 10.5 },   // trace_ma_3
            // Minor Traces
            MI1: { x: 50, y: 95 },     // trace_mi_1
            MI2: { x: 6.5, y: 62.5 },   // trace_mi_2
            MI3: { x: -8.5, y: 47.5 },   // trace_mi_3
            MI4: { x: 6.5, y: 27.5 },   // trace_mi_4
            MI5: { x: 93.5, y: 62.5 },   // trace_mi_5
            MI6: { x: 108.5, y: 47.5 },   // trace_mi_6
            MI7: { x: 93.5, y: 27.5 },   // trace_mi_7
            MI8: { x: 50, y: -10 },    // trace_mi_8
            MI9: { x: 20, y: 0 },      // trace_mi_9
            MI10: { x: 80, y: 0 },      // trace_mi_10
        },
        connections: [
            // Línea central vertical
            { from: 'MI1', to: 'MI8' },
            // Arco superior (mi9 - ma3 - mi10)
            { from: 'MI9', to: 'MI10', q: { x: 50, y: -10 } },
            // Arco inferior (ma1 - tec - ma2)
            { from: 'MA1', to: 'MA2', q: { x: 50, y: 74.5 } },
            // Curva skills (BA - ult - SK)
            { from: 'BA', to: 'SK', q: { x: 50, y: 49.5 } },
            // Ramas izquierda
            { from: 'MA1', to: 'MI3' },
            { from: 'MI3', to: 'MI4' },
            // Ramas derecha
            { from: 'MA2', to: 'MI6' },
            { from: 'MI6', to: 'MI7' },
        ]
    },
        "Abundance": {
        nodes: {
            // Skills
            BA: { x: 29, y: 44 },     // Basic_Attack
            SK: { x: 71, y: 44 },     // Skill
            ULT: { x: 50, y: 48 },     // Ultimate
            TAL: { x: 50, y: 20 },     // Talent
            TEC: { x: 50, y: 90 },   // Technique
            // Major Traces
            MA1: { x: 50, y: -4 },     // trace_ma_1
            MA2: { x: 18.5, y: 76 },     // trace_ma_2
            MA3: { x: 81.5, y: 76 },     // trace_ma_3
            // Minor Traces
            MI1: { x: 60.5, y: 95 },     // trace_mi_1
            MI2: { x: 90, y: 60 },     // trace_mi_2
            MI3: { x: 100, y: 44 },     // trace_mi_3
            MI4: { x: 85, y: 29.5 },   // trace_mi_4
            MI5: { x: 10, y: 60 },     // trace_mi_5
            MI6: { x: 0, y: 44 },     // trace_mi_6
            MI7: { x: 15, y: 29.5 },   // trace_mi_7
            MI8: { x: 75, y: 0 },      // trace_mi_8
            MI9: { x: 25, y: 0 },      // trace_mi_9
            MI10: { x: 39.5, y: 95 },     // trace_mi_10
        },
        connections: [
            // Línea central vertical
            { from: 'MA1', to: 'TEC' },
            // Arco superior (mi9 - ma1 - mi8)
            { from: 'MI9', to: 'MI8', q: { x: 50, y: -4 } },
            // Arco skills (BA - ult - SK)
            { from: 'BA', to: 'SK', q: { x: 50, y: 48 } },
            // Arco inferior (ma2 - tec - ma3)
            { from: 'MA2', to: 'MA3', q: { x: 50, y: 72.5 } },
            // Cadena izquierda
            { from: 'MI7', to: 'MI6' },
            { from: 'MI6', to: 'MI5' },
            { from: 'MI5', to: 'MA2' },
            // Cadena derecha
            { from: 'MI4', to: 'MI3' },
            { from: 'MI3', to: 'MI2' },
            { from: 'MI2', to: 'MA3' },
            // Conexiones inferiores
            { from: 'MI1', to: 'MI10', q: { x: 50, y: 90 } },
        ]
    },
        "Preservation": {
        nodes: {
            // Skills
            BA: { x: 26.5, y: 51.5 },     // Basic_Attack
            SK: { x: 73.5, y: 51.5 },     // Skill
            ULT: { x: 50, y: 48.5 },      // Ultimate
            TAL: { x: 50, y: 26.5 },      // Talent
            TEC: { x: 50, y: 74.5 },      // Technique
            // Major Traces
            MA1: { x: 23.5, y: 90 },      // trace_ma_1
            MA2: { x: 76.5, y: 90 },      // trace_ma_2
            MA3: { x: 50, y: 10 },        // trace_ma_3
            // Minor Traces
            MI1: { x: 50, y: 90 },        // trace_mi_1
            MI2: { x: 5, y: 68.5 },       // trace_mi_2
            MI3: { x: -13.5, y: 43.5 },   // trace_mi_3
            MI4: { x: 8, y: 26.5 },       // trace_mi_4
            MI5: { x: 95, y: 68.5 },      // trace_mi_5
            MI6: { x: 113.5, y: 43.5 },   // trace_mi_6
            MI7: { x: 92, y: 26.5 },      // trace_mi_7
            MI8: { x: 50, y: -7.5 },      // trace_mi_8
            MI9: { x: 20, y: -2.5 },      // trace_mi_9
            MI10: { x: 80, y: -2.5 },     // trace_mi_10
        },
        connections: [
            // Línea central vertical
            { from: 'MI8', to: 'MI1' },
            // Arco superior (mi9 - mi8 - mi10)
            { from: 'MI9', to: 'MI10', q: { x: 50, y: -7.5 } },
            // Arco skills (BA - ult - SK)
            { from: 'BA', to: 'SK', q: { x: 50, y: 48.5 } },
            // Arco inferior (ma1 - mi1 - ma2)
            { from: 'MA1', to: 'MA2', q: { x: 50, y: 90 } },
            // Cadena izquierda (desde MA3)
            { from: 'BA', to: 'MI4' },
            { from: 'MI3', to: 'MI2' },
            { from: 'MA1', to: 'MI2' },
            // Cadena derecha (desde MA3)
            { from: 'SK', to: 'MI7' },
            { from: 'MI6', to: 'MI5' },
            { from: 'MI5', to: 'MA2' },
        ]
    },
    "The_Hunt": {
        nodes: {
            // Skills
            BA: { x: 26, y: 37 },         // Basic_Attack
            SK: { x: 74, y: 37 },         // Skill
            ULT: { x: 50, y: 48.5 },      // Ultimate
            TAL: { x: 50, y: 24 },        // Talent
            TEC: { x: 50, y: 70 },        // Technique
            // Major Traces
            MA1: { x: 24.5, y: 72 },      // trace_ma_1
            MA2: { x: 75.5, y: 72 },      // trace_ma_2
            MA3: { x: 50, y: 6.5 },       // trace_ma_3
            // Minor Traces
            MI1: { x: 50, y: 95 },        // trace_mi_1
            MI2: { x: 9.5, y: 57 },       // trace_mi_2
            MI3: { x: -5.5, y: 43 },      // trace_mi_3
            MI4: { x: 11, y: 22 },        // trace_mi_4
            MI5: { x: 90.5, y: 57 },      // trace_mi_5
            MI6: { x: 105.5, y: 43 },     // trace_mi_6
            MI7: { x: 89, y: 22 },        // trace_mi_7
            MI8: { x: 50, y: -10 },       // trace_mi_8
            MI9: { x: 20, y: -5 },        // trace_mi_9
            MI10: { x: 80, y: -5 },       // trace_mi_10
        },
        connections: [
            // Línea central vertical
            { from: 'MI8', to: 'MI1' },
            // Arco superior (mi9 - mi8 - mi10)
            { from: 'MI9', to: 'MI10', q: { x: 50, y: -10 } },
            // Arco medio (BA - ULT - SK)
            { from: 'BA', to: 'SK', q: { x: 50, y: 48.5 } },
            // V izquierda (desde BA)
            { from: 'BA', to: 'MI4' },
            { from: 'MI3', to: 'MI2' },
            { from: 'MI2', to: 'MA1' },
            // V derecha (desde SK)
            { from: 'SK', to: 'MI7' },
            { from: 'MI6', to: 'MI5' },
            { from: 'MI5', to: 'MA2' },
            // Arco inferior (ma1 - tec - ma2)
            { from: 'MA1', to: 'MA2', q: { x: 50, y: 70 } },
        ]
    },
        "Harmony": {
        nodes: {
            // Skills
            BA: { x: 25.5, y: 42.5 },     // Basic_Attack
            SK: { x: 74.5, y: 42.5 },     // Skill
            ULT: { x: 50, y: 61 },        // Ultimate
            TAL: { x: 50, y: 38 },        // Talent
            TEC: { x: 50, y: 80 },        // Technique
            // Major Traces
            MA1: { x: 5, y: 55 },         // trace_ma_1
            MA2: { x: 95, y: 55 },        // trace_ma_2
            MA3: { x: 50, y: 12 },        // trace_ma_3
            // Minor Traces
            MI1: { x: 50, y: 95 },        // trace_mi_1
            MI2: { x: -10, y: 40 },       // trace_mi_2
            MI3: { x: 10, y: 25 },        // trace_mi_3
            MI4: { x: 20, y: 90 },        // trace_mi_4
            MI5: { x: 80, y: 70 },        // trace_mi_5
            MI6: { x: 65, y: 60 },        // trace_mi_6
            MI7: { x: 80, y: 90 },        // trace_mi_7
            MI8: { x: 50, y: -5 },        // trace_mi_8
            MI9: { x: 20, y: 0 },         // trace_mi_9
            MI10: { x: 80, y: 0 },        // trace_mi_10
        },
        connections: [
            // Línea central vertical
            { from: 'MI8', to: 'MI1' },
            // Arco superior (mi9 - mi8 - mi10)
            { from: 'MI9', to: 'MI10', q: { x: 50, y: -5 } },
            // Cadena izquierda
            { from: 'TAL', to: 'MA1', q: { x: 25.5, y: 42.5 } },
            { from: 'MA1', to: 'MI2' },
            { from: 'MI2', to: 'MI3' },
            // Cadena derecha
            { from: 'TAL', to: 'MA2', q: { x: 74.5, y: 42.5 } },
            { from: 'MA2', to: 'MI5' },
            { from: 'MI5', to: 'MI6' },
            // Arco inferior (mi4 - mi1 - mi7)
            { from: 'MI4', to: 'MI7', q: { x: 50, y: 95 } },
        ]
    },
        "Erudition": {
        nodes: {
            // Skills
            BA: { x: 27.5, y: 56.5 },     // Basic_Attack
            SK: { x: 72.5, y: 56.5 },     // Skill
            ULT: { x: 50, y: 56.5 },      // Ultimate
            TAL: { x: 50, y: 32 },        // Talent
            TEC: { x: 50, y: 94 },        // Technique
            // Major Traces
            MA1: { x: 9, y: 56.5 },       // trace_ma_1
            MA2: { x: 91, y: 56.5 },      // trace_ma_2
            MA3: { x: 50, y: -5 },        // trace_ma_3
            // Minor Traces
            MI1: { x: 28, y: 92 },        // trace_mi_1
            MI2: { x: -9, y: 56.5 },      // trace_mi_2
            MI3: { x: -5, y: 78.5 },      // trace_mi_3
            MI4: { x: -5, y: 34.5 },      // trace_mi_4
            MI5: { x: 109, y: 56.5 },     // trace_mi_5
            MI6: { x: 105, y: 78.5 },     // trace_mi_6
            MI7: { x: 105, y: 34.5 },     // trace_mi_7
            MI8: { x: 20, y: 0 },         // trace_mi_8
            MI9: { x: 80, y: 0 },         // trace_mi_9
            MI10: { x: 72, y: 92 },       // trace_mi_10
        },
        connections: [
            // Línea central vertical
            { from: 'MA3', to: 'TEC' },
            // Horizontal central que conecta todos los de y: 56.5%
            { from: 'MI2', to: 'MI5' },
            // Ramificaciones izquierdas
            { from: 'MI4', to: 'MI3', q: { x: -9, y: 56.5 } },
            // Ramificaciones derechas
            { from: 'MI7', to: 'MI6', q: { x: 109, y: 56.5 } },
            // Ramificaciones inferiores
            { from: 'MI1', to: 'MI10', q: { x: 50, y: 94 } },
            // Ramificaciones superiores
            { from: 'MI8', to: 'MI9', q: { x: 50, y: -5 } },
        ]
    },
    "Nihility": {
        nodes: {
            // Skills
            BA: { x: 25, y: 45 },         // Basic_Attack
            SK: { x: 75, y: 45 },         // Skill
            ULT: { x: 50, y: 43 },        // Ultimate
            TAL: { x: 50, y: 24 },        // Talent
            TEC: { x: 50, y: 65 },        // Technique
            // Major Traces
            MA1: { x: 6, y: 38 },         // trace_ma_1
            MA2: { x: 94, y: 38 },        // trace_ma_2
            MA3: { x: 50, y: 0 },         // trace_ma_3
            // Minor Traces
            MI1: { x: 50, y: 80 },        // trace_mi_1
            MI2: { x: -10, y: 53 },       // trace_mi_2
            MI3: { x: 5, y: 73 },         // trace_mi_3
            MI4: { x: 20, y: 93 },        // trace_mi_4
            MI5: { x: 110, y: 53 },       // trace_mi_5
            MI6: { x: 95, y: 73 },        // trace_mi_6
            MI7: { x: 80, y: 93 },        // trace_mi_7
            MI8: { x: 20, y: 5 },         // trace_mi_8
            MI9: { x: 80, y: 5 },         // trace_mi_9
            MI10: { x: 50, y: 95 },       // trace_mi_10
        },
        connections: [
            // Línea central vertical
            { from: 'MA3', to: 'MI10' },
            // Arco superior (mi8 - ma3 - mi9)
            { from: 'MI8', to: 'MI9', q: { x: 50, y: 0 } },
            // Arco medio de habilidades (BA - ult - SK)
            { from: 'BA', to: 'SK', q: { x: 50, y: 43 } },
            // Ramificación izquierda
            { from: 'BA', to: 'MA1' },
            { from: 'MA1', to: 'MI2' },
            { from: 'MI2', to: 'MI4', q: { x: 5, y: 73 } }, // pasa por MI3
            // Ramificación derecha
            { from: 'SK', to: 'MA2' },
            { from: 'MA2', to: 'MI5' },
            { from: 'MI5', to: 'MI7', q: { x: 95, y: 73 } }, // pasa por MI6
        ]
    },
        "Elation": {
        nodes: {
            // Skills
            BA: { x: 29.5, y: 3 },        // Basic_Attack
            SK: { x: 70.5, y: 3 },        // Skill
            ULT: { x: 50, y: 19.5 },      // Ultimate
            TAL: { x: 50, y: 40.5 },      // Talent
            TEC: { x: 50, y: 60.9 },      // Technique
            // Major Traces
            MA1: { x: 50, y: 90 },        // trace_ma_1
            MA2: { x: 10, y: 16 },        // trace_ma_2
            MA3: { x: 90, y: 16 },        // trace_ma_3
            // Minor Traces
            MI1: { x: 25, y: 55.9 },      // trace_mi_1
            MI2: { x: 75, y: 55.9 },      // trace_mi_2
            MI3: { x: 30, y: 90 },        // trace_mi_3
            MI4: { x: 70, y: 90 },        // trace_mi_4
            MI5: { x: 0, y: 36 },         // trace_mi_5
            MI6: { x: 2, y: 56 },         // trace_mi_6
            MI7: { x: 15, y: 45 },        // trace_mi_7
            MI8: { x: 100, y: 36 },       // trace_mi_8
            MI9: { x: 98, y: 56 },        // trace_mi_9
            MI10: { x: 85, y: 45 },       // trace_mi_10
        },
        connections: [
            // Línea central vertical
            { from: 'MA1', to: 'ULT' },
            // Recta inferior
            { from: 'MI3', to: 'MI4' },
            // Arco superior
            { from: 'MI1', to: 'MI2', q: { x: 50, y: 60.9 } },
            // Ramificación izquierda
            { from: 'ULT', to: 'BA' },
            { from: 'BA', to: 'MI6', q: [{ x: 10, y: 16 }, { x: 0, y: 36 }] },
            { from: 'MI6', to: 'MI7' },
            // Ramificación derecha
            { from: 'ULT', to: 'SK' },
            { from: 'SK', to: 'MI9', q: [{ x: 90, y: 16 }, { x: 100, y: 36 }] },
            { from: 'MI9', to: 'MI10' },
        ]
    },
    "Remembrance": {
        nodes: {
            // Skills
            BA: { x: 27, y: 65 },
            SK: { x: 73.5, y: 65 },
            ULT: { x: 50, y: 71.5 },
            TAL: { x: 85.5, y: 42 },
            TEC: { x: 14.5, y: 42 },
            // Major Traces
            MA1: { x: 105, y: 42 },
            MA2: { x: 50, y: 93 },
            MA3: { x: 25, y: 17.5 },
            // Minor Traces
            MI1: { x: -5, y: 42 },
            MI2: { x: 0, y: 22 },
            MI3: { x: 0, y: 62 },
            MI4: { x: 100, y: 22 },
            MI5: { x: 100, y: 62 },
            MI6: { x: 25, y: 87 },
            MI7: { x: 75, y: 87 },
            MI8: { x: 10, y: 2.5 },
            MI9: { x: 29, y: -7 },
            MI10: { x: 50, y: -10.5 },

            MS: { x: 50, y: 38 },
            MT: { x: 50, y: 9 },
        },
        connections: [
            { from: 'MI6', to: 'MI7', q: { x: 50, y: 93 } },
            { from: 'MA2', to: 'ULT' },
            { from: 'TAL', to: 'ULT', q: { x: 73.5, y: 65 } },
            { from: 'ULT', to: 'MA3', q: [{ x: 27, y: 65 }, { x: 14.5, y: 42 }] },
            { from: 'TAL', to: 'MA1' },
            { from: 'MI4', to: 'MI5', q: { x: 105, y: 42 } },
            { from: 'TEC', to: 'MI1' },
            { from: 'MI2', to: 'MI3', q: { x: -5, y: 42 } },
            { from: 'MA3', to: 'MI8' },
            { from: 'MI8', to: 'MI10', q: { x: 29, y: -7 } },
            { from: 'MS', to: 'MT' },
        ]
    }
}