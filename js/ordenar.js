export function ordenarLista() {
    const listaNode = document.querySelector('.lista-personajes');
    if (!listaNode || listaNode.children.length === 0) return;
    
    const elementos = Array.from(listaNode.children);

    elementos.sort((a, b) => a.id.localeCompare(b.id));

    listaNode.innerHTML = "";
    elementos.forEach(elemento => listaNode.appendChild(elemento));
}