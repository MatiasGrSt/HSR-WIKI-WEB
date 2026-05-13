import React, { useState } from 'react';
import OfficialTierList from './OfficialTierList.jsx';
import CustomTierList   from './CustomTierList.jsx';

export default function TierListApp({ personajes, tierListData }) {
    const [seccion, setSeccion] = useState('oficial');

    return seccion === 'oficial'
        ? <OfficialTierList
            personajes={personajes}
            tierListData={tierListData}
            seccion={seccion}
            onSeccionChange={setSeccion}
          />
        : <CustomTierList
            personajes={personajes}
            seccion={seccion}
            onSeccionChange={setSeccion}
          />;
}
