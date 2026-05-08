function organizarHabilidades(habilidades) {
    const normal = habilidades.filter(h => h.enhanced === null);
    const novaflare = habilidades.filter(h => h.enhanced === 1);
    return { normal, novaflare };
}

function juntarHabilidades(lista) {
    let grupos = {};
    lista.forEach(habilidad => {
        if (!grupos[habilidad.type]) {
            grupos[habilidad.type] = [];
        }
        grupos[habilidad.type].push(habilidad);
    });
    return grupos;
}

export function habilidades(habilidades){
    const { normal, novaflare } = organizarHabilidades(habilidades);
    
    const gruposNormal = juntarHabilidades(normal);
    const gruposNovaflare = juntarHabilidades(novaflare);
    console.log("Grupos Normal:", gruposNormal);
    console.log("Grupos Novaflare:", gruposNovaflare);
}