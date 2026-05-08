import { inicializarModal } from "./utils/modal.js";
import { organizarHabilidades,juntarHabilidades } from "./utils/skills.js";

export async function cargarHabilidades(habilidades, charName) {
    const { normal, novaflare } = organizarHabilidades(habilidades);
    
    const gruposNormal = juntarHabilidades(normal);
    const gruposNovaflare = juntarHabilidades(novaflare);

    const groups = { normal: gruposNormal, novaflare: gruposNovaflare };

    crearIconosHabilidades(groups, charName);
}