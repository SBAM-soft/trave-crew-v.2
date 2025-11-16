import { useCSVQuery } from './useCSVQuery';

/**
 * Hook per caricare e filtrare i plus dal CSV
 */
export function usePlus(filters = {}) {
  const { data: allPlus = [], isLoading, error } = useCSVQuery('plus.csv');

  // Filtra i plus in base ai parametri
  let filteredPlus = allPlus;

  if (filters.destinazione) {
    filteredPlus = filteredPlus.filter(p =>
      p.DESTINAZIONE === 'TUTTE' ||
      p.DESTINAZIONE?.toLowerCase() === filters.destinazione?.toLowerCase()
    );
  }

  if (filters.zona) {
    filteredPlus = filteredPlus.filter(p =>
      p.ZONA === 'TUTTE' ||
      p.ZONA?.toLowerCase() === filters.zona?.toLowerCase()
    );
  }

  if (filters.tipo) {
    filteredPlus = filteredPlus.filter(p =>
      p.TIPO?.toLowerCase() === filters.tipo?.toLowerCase()
    );
  }

  if (filters.categoria) {
    filteredPlus = filteredPlus.filter(p =>
      p.CATEGORIA?.toLowerCase().includes(filters.categoria?.toLowerCase())
    );
  }

  if (filters.applicabileA) {
    filteredPlus = filteredPlus.filter(p =>
      p.APPLICABILE_A?.toLowerCase().includes(filters.applicabileA?.toLowerCase())
    );
  }

  // Mappa i plus al formato atteso dall'app
  const mappedPlus = filteredPlus.map(p => ({
    id: p.CODICE,
    codice: p.CODICE,
    nome: p.PLUS,
    descrizione: p.DESCRIZIONE || '',
    categoria: p.CATEGORIA,
    livello: p.LIVELLO_PLUS,
    tipo: p.TIPO,
    applicabileA: p.APPLICABILE_A,
    prerequisito: p.PREREQUISITO,
    prezzo: parseFloat(p.PRZ_PAX_GEN) || 0,
    include: p.INCLUDE || '',
    nonInclude: p.NON_INCLUDE || '',
    termini: p.TERMINI || '',
    icon: p.ICON || '✨',
    popolarita: p.POPOLARITA || 'media',
    // Prezzi mensili
    prezziMensili: {
      gennaio: parseFloat(p.PRZ_PAX_GEN) || 0,
      febbraio: parseFloat(p.PRZ_PAX_FEB) || 0,
      marzo: parseFloat(p.PRZ_PAX_MAR) || 0,
      aprile: parseFloat(p.PRZ_PAX_APR) || 0,
      maggio: parseFloat(p.PRZ_PAX_MAG) || 0,
      giugno: parseFloat(p.PRZ_PAX_GIU) || 0,
      luglio: parseFloat(p.PRZ_PAX_LUG) || 0,
      agosto: parseFloat(p.PRZ_PAX_AGO) || 0,
      settembre: parseFloat(p.PRZ_PAX_SET) || 0,
      ottobre: parseFloat(p.PRZ_PAX_OTT) || 0,
      novembre: parseFloat(p.PRZ_PAX_NOV) || 0,
      dicembre: parseFloat(p.PRZ_PAX_DIC) || 0,
    }
  }));

  return {
    plus: mappedPlus,
    allPlus: mappedPlus,
    isLoading,
    error
  };
}

/**
 * Hook per ottenere plus suggeriti per un'esperienza
 */
export function usePlusSuggeriti(experienceType = '', destinazione = '', zona = '') {
  // Determina categorie rilevanti basate sul tipo di esperienza
  const getCategorieRilevanti = (expType) => {
    const type = expType?.toLowerCase() || '';

    if (type.includes('trekking') || type.includes('escursione') || type.includes('natura')) {
      return ['Assicurazione', 'Servizio', 'Transfer'];
    }
    if (type.includes('mare') || type.includes('spiaggia') || type.includes('diving')) {
      return ['Assicurazione', 'Upgrade', 'Servizio Hotel'];
    }
    if (type.includes('cultura') || type.includes('tempio') || type.includes('tour')) {
      return ['Servizio', 'Transfer', 'Upgrade'];
    }
    if (type.includes('food') || type.includes('cucina') || type.includes('ristorante')) {
      return ['Servizio', 'Transfer'];
    }

    // Default: tutti i tipi
    return null;
  };

  const categorieRilevanti = getCategorieRilevanti(experienceType);

  const filters = {
    destinazione,
    zona,
  };

  const { plus, isLoading, error } = usePlus(filters);

  // Filtra per categorie rilevanti se specificate
  let plusSuggeriti = plus;
  if (categorieRilevanti) {
    plusSuggeriti = plus.filter(p =>
      categorieRilevanti.some(cat =>
        p.categoria?.toLowerCase().includes(cat.toLowerCase())
      )
    );
  }

  // Ordina per popolarità e prendi i top
  plusSuggeriti.sort((a, b) => {
    const popOrder = { 'alta': 3, 'media': 2, 'bassa': 1 };
    return (popOrder[b.popolarita] || 0) - (popOrder[a.popolarita] || 0);
  });

  // Limita a 10 plus suggeriti
  plusSuggeriti = plusSuggeriti.slice(0, 10);

  return {
    plusSuggeriti,
    isLoading,
    error
  };
}
