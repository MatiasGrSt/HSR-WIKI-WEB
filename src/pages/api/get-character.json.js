// src/pages/api/get-character.json.js
export const prerender = false; // Esto obliga a que sea SSR

export async function GET({ request }) {
    const { searchParams } = new URL(request.url);
    const personaje = searchParams.get('personaje');
    const tipo = searchParams.get('tipo');
    const skill_id = searchParams.get('skill_id');

    if (!personaje && !skill_id) {
        return new Response(JSON.stringify({ error: "Faltan parámetros" }), { status: 400 });
    }

    const TOKEN = import.meta.env.DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN;
    const BASE_URL = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL;
    const headers = { "Authorization": `Bearer ${TOKEN}` };

    // Función interna para pedir a Directus
    const fetchDirectus = async (coleccion, campo, valor, sort = '') => {
        const url = `${BASE_URL}/items/${coleccion}?filter[${campo}][_eq]=${encodeURIComponent(valor)}${sort ? '&sort=' + sort : ''}`;
        const res = await fetch(url, { headers });
        const json = await res.json();
        return json.data || [];
    };

    try {
        let finalData = {};

        if (tipo === 'all') {
            // Hacemos todas las peticiones que hacía tu PHP en paralelo
            const [resBasic, resSkills, resEidolons, resTraces, resTracesMi] = await Promise.all([
                fetchDirectus('characters', 'name', personaje),
                fetchDirectus('skills', 'character_id', personaje),
                fetchDirectus('eidolons', 'character_id', personaje, 'lvl'),
                fetchDirectus('traces', 'character_id', personaje),
                fetchDirectus('traces_mi', 'character_id', personaje)
            ]);

            if (resBasic.length === 0) {
                return new Response(JSON.stringify({ error: "No encontrado" }), { status: 404 });
            }

            finalData = {
                info: resBasic[0],
                skills: resSkills,
                eidolons: resEidolons,
                major_traces: resTraces,
                minor_traces: resTracesMi
            };
        } else if (tipo === 'skill_levels') {
            finalData = await fetchDirectus('skill_levels', 'skill_id', skill_id);
        }

        return new Response(JSON.stringify(finalData), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}