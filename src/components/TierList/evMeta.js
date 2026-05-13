/** Orden de renderizado de los niveles EV (mejor → peor) */
export const EV_LEVELS = [0, 0.5, 1, 2, 3, 4, 5];

/** Metadatos visuales por nivel EV (gradiente + sombra) */
export const EV_META = {
    0:   { bg: 'linear-gradient(160deg, #ff5252 0%, #b71c1c 100%)', shadow: 'rgba(255,82,82,0.4)' },
    0.5: { bg: 'linear-gradient(160deg, #ff9800 0%, #e65100 100%)', shadow: 'rgba(255,152,0,0.35)' },
    1:   { bg: 'linear-gradient(160deg, #ffd740 0%, #c79a00 100%)', shadow: 'rgba(255,215,64,0.35)' },
    2:   { bg: 'linear-gradient(160deg, #52c466 0%, #1b5e20 100%)', shadow: 'rgba(82,196,102,0.3)' },
    3:   { bg: 'linear-gradient(160deg, #4cc9f0 0%, #1565c0 100%)', shadow: 'rgba(76,201,240,0.3)' },
    4:   { bg: 'linear-gradient(160deg, #9c6fe4 0%, #4a1d96 100%)', shadow: 'rgba(156,111,228,0.3)' },
    5:   { bg: 'linear-gradient(160deg, #4b5563 0%, #1f2937 100%)', shadow: 'rgba(0,0,0,0.2)' },
};
