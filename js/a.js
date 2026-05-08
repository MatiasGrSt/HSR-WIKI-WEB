import { inicializarModal } from "./utils/modal.js";
import { organizarHabilidades,juntarHabilidades,crearIconosHabilidades } from "./utils/skills.js";

export async function cargarHabilidades(habilidades, charName) {
    const { normal, novaflare } = organizarHabilidades(habilidades);
    
    const gruposNormal = juntarHabilidades(normal);
    const gruposNovaflare = juntarHabilidades(novaflare);

    const groups = { normal: gruposNormal, novaflare: gruposNovaflare };

    crearIconosHabilidades(groups, charName);
}