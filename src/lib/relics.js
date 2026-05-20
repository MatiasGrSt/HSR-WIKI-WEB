// src/lib/directus.js
const TOKEN = import.meta.env.DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN;
const URL_BASE = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL;

const headers = { 
    "Authorization": `Bearer ${TOKEN}`,
    "Cache-Control": "no-cache", // <--- Esto le dice a Directus: "No me des nada guardado"
    "Pragma": "no-cache"
};

export async function getDatosRelics() {
    try {
        const res = await fetch(`${URL_BASE}/items/relics?limit=-1`, { headers, cache: 'no-store' });
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error("Error fetching relics:", e);
        return [];
    }
}