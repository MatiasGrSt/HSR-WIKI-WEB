export function organizarHabilidades(habilidades) {
    const normal = habilidades.filter(h => h.enhanced === null);
    const novaflare = habilidades.filter(h => h.enhanced === 1);
    return { normal, novaflare };
}

export function juntarHabilidades(lista) {
    let grupos = {};
    lista.forEach(habilidad => {
        if (!grupos[habilidad.type]) {
            grupos[habilidad.type] = [];
        }
        grupos[habilidad.type].push(habilidad);
    });
    return grupos;
}