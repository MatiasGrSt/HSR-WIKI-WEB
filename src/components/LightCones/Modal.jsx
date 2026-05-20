// src/components/ModalInfo.jsx
import './styles/Modal.css';

export default function ModalInfo({ item, onClose }) {
    // Si no hay ningún item seleccionado, no renderizamos nada
    if (!item) return null;

    return (
        // El overlay oscuro de fondo. Si haces clic aquí, se cierra.
        <div className="modal-overlay" onClick={onClose}>
            
            {/* El contenedor del modal. e.stopPropagation() evita que el clic aquí cierre el modal */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                {/* Botón de cerrar */}
                <button className="modal-close" onClick={onClose}>✖</button>

                {/* --- AQUÍ PONES LA INFORMACIÓN DE TU LIGHT CONE / PERSONAJE --- */}
                <div className="modal-header">
                    <h2>{item.name}</h2>
                    <span className="modal-type">{item.path}</span>
                </div>
                
                <div className="modal-body">
                    <img src={`../imagenes/Utils/Vias/${item.path}.webp`} alt="Icono" />
                    <p><strong>Rareza:</strong> {item.rarity} Stars</p>
                    
                    <p dangerouslySetInnerHTML={{ __html: item.description }}></p>
                </div>
            </div>
        </div>
    );
}