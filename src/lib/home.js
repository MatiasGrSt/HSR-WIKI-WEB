const TOKEN = import.meta.env.DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN;
const URL_BASE = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL;

const headers = { "Authorization": `Bearer ${TOKEN}` };

// Función interna para peticiones
async function fetchItems(query) {
    const res = await fetch(`${URL_BASE}/items/${query}`, { headers });
    const json = await res.json();
    return json.data || [];
}

export async function getHomeData() {
    const ahora = new Date().toISOString();

    const [rawVersion, rawEvents, rawCodes, rawFeatured, rawEndgame] = await Promise.all([
        fetchItems("general?filter[name][_eq]=version&limit=1"),
        fetchItems("events?limit=-1"),
        fetchItems("general?filter[name][_contains]=code_"),
        fetchItems("general?filter[name][_contains]=character_"),
        fetchItems("endgames")
    ]);

    const version = rawVersion[0]?.values || "???";
    const fin_version = rawEvents.find(e => e.title === 'fin_version')?.end_time || null;

    // Lógica de eventos (la que antes estaba en el .astro)
    const eventos = rawEvents
        .filter(e => e.title !== 'fin_version')
        .map(evento => {
            const start = evento.start_time;
            const end = evento.end_time;
            let status = 'finalizado';

            if (ahora >= start && ahora <= end) status = 'activo';
            else if (ahora < start && start <= fin_version) status = 'proximamente';
            else if (ahora < start && start > fin_version) status = 'anunciado';

            return { ...evento, status };
        })
        .sort((a, b) => {
            if (a.status === 'activo' && b.status !== 'activo') return -1;
            if (a.status !== 'activo' && b.status === 'activo') return 1;
            return a.start_time.localeCompare(b.start_time);
        });

    return {
        version,
        fin_version,
        eventos,
        codigos: rawCodes,
        personajes: rawFeatured.map(f => f.values),
        endgame: rawEndgame
    };
}