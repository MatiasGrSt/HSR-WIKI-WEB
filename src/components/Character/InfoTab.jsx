import React from 'react';
import './styles/InfoTab.css';

export default function InfoTab({ info }) {
    // Si por algún motivo no hay datos, evitamos que el componente rompa
    if (!info) return null;

    return (
        <div className="info">
            {/* INTRODUCCIÓN / DESCRIPCIÓN
                Usamos dangerouslySetInnerHTML porque en las Wikis de HSR 
                las descripciones suelen traer etiquetas de formato como <br> o <span>
            */}
            <div 
                id="introduction" 
                dangerouslySetInnerHTML={{ __html: info.description || 'Sin descripción disponible.' }}
            />

            {/* SECCIÓN DE ACTORES DE VOZ (VOICE ACTORS) */}
            <div id="voice_actors">
                {/* Inglés */}
                <div>
                    <p>ENG</p>
                    <p id="eng">{info.eng_va || '-'}</p>
                </div>

                {/* Japonés */}
                <div>
                    <p>JPN</p>
                    <p id="jpn">{info.jpn_va || '-'}</p>
                </div>

                {/* Chino */}
                <div>
                    <p>CHN</p>
                    <p id="chn">{info.cn_va || '-'}</p>
                </div>

                {/* Coreano */}
                <div>
                    <p>KOR</p>
                    <p id="kor">{info.kr_va || '-'}</p>
                </div>
            </div>
        </div>
    );
}