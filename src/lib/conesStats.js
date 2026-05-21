const TOKEN = import.meta.env.DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN;
const BASE_URL = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL;

const headers = {
    "Authorization": `Bearer ${TOKEN}`,
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
};

export async function getStatsConos() {
    try {
        const url = `${BASE_URL}/items/light_cones_stats?limit=-1`;
        const res = await fetch(url, { headers, cache: 'no-store' });
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error("Error fetching light cone stats:", e);
        return [];
    }
}
