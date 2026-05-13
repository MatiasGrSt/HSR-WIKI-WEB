// src/lib/tierlist.js

// Mantenemos el doble check para CapRover (SSR)
const TOKEN = import.meta.env.DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN;
const URL_BASE = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL;

export async function getTierListData() {
    const headers = { 
        "Authorization": `Bearer ${TOKEN}`,
        "Cache-Control": "no-cache", // <--- Esto le dice a Directus: "No me des nada guardado"
        "Pragma": "no-cache"
    };

    try {
        // Lanzamos ambas peticiones a la vez
        const [resPers, resTier] = await Promise.all([
            fetch(`${URL_BASE}/items/characters?limit=-1`, { headers, cache: 'no-store' }),
            fetch(`${URL_BASE}/items/tier_list?limit=-1`, { headers, cache: 'no-store' })
        ]);

        // Verificamos si las respuestas son correctas
        if (!resPers.ok || !resTier.ok) {
            throw new Error(`Error Directus: Pers[${resPers.status}] Tier[${resTier.status}]`);
        }

        const jsonPers = await resPers.json();
        const jsonTier = await resTier.json();

        return {
            personajes: jsonPers.data || [],
            tierData: jsonTier.data || []
        };

    } catch (e) {
        console.error("Error en el servicio de TierList:", e);
        // Devolvemos arrays vacíos para que la web no explote si falla la API
        return { personajes: [], tierData: [] };
    }
}