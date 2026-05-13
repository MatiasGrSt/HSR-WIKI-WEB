// src/lib/directus.js
const TOKEN = import.meta.env.DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN;
const URL_BASE = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL;

const headers = { "Authorization": `Bearer ${TOKEN}` };

export async function getDatosPersonajes() {
    try {
        const res = await fetch(`${URL_BASE}/items/characters?limit=-1`, { headers });
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error("Error fetching personajes:", e);
        return [];
    }
}

export async function getVersionActual() {
    try {
        const res = await fetch(`${URL_BASE}/items/general?filter[name][_eq]=version&limit=1`, { headers });
        const json = await res.json();
        // Según tu PHP, la versión está en el campo 'values' del primer item
        const versionStr = json.data?.[0]?.values || "1.0";
        return parseFloat(versionStr);
    } catch (e) {
        console.error("Error fetching version:", e);
        return 1.0;
    }
}