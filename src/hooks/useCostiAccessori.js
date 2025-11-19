import { useMemo } from 'react';
import { useEntityQuery } from './useEntityQuery';

/**
 * Hook per caricare i costi accessori (voli interni, assicurazioni, documenti)
 * da costi_accessori_tech.csv
 */
export function useCostiAccessori(destinazione) {
  const { data: allCosti = [], isLoading, error } = useEntityQuery('costi_accessori', false);

  // Filtra i costi per destinazione
  const costiDestinazione = useMemo(() => {
    if (!destinazione || !allCosti.length) return [];

    return allCosti.filter(costo =>
      costo.DESTINAZIONE?.toLowerCase() === destinazione.toLowerCase()
    );
  }, [allCosti, destinazione]);

  // Separa per tipo di servizio
  const costiPerTipo = useMemo(() => {
    const result = {
      voli: [],
      assicurazione: null,
      documenti: null,
    };

    costiDestinazione.forEach(costo => {
      const servizio = costo.SERVIZIO?.toLowerCase();

      if (servizio === 'volo') {
        result.voli.push({
          codice: costo.CODICE,
          descrizione: costo.DESCRIZIONE,
          costo: parseFloat(costo.COSTO) || 0,
        });
      } else if (servizio === 'assicurazione') {
        result.assicurazione = {
          codice: costo.CODICE,
          descrizione: costo.DESCRIZIONE,
          costo: parseFloat(costo.COSTO) || 0,
        };
      } else if (servizio === 'documenti') {
        result.documenti = {
          codice: costo.CODICE,
          descrizione: costo.DESCRIZIONE,
          costo: parseFloat(costo.COSTO) || 0,
        };
      }
    });

    return result;
  }, [costiDestinazione]);

  return {
    costiAccessori: costiPerTipo,
    allCosti: costiDestinazione,
    isLoading,
    error,
  };
}

/**
 * Helper per calcolare i costi accessori applicabili a un viaggio
 * @param {Object} costiAccessori - Costi accessori per destinazione
 * @param {number} numeroPersone - Numero di persone nel viaggio
 * @param {Array} zoneVisitate - Array di zone visitate nel viaggio
 * @returns {Object} - Costi applicabili con totale
 */
export function calcolaCostiApplicabili(costiAccessori, numeroPersone, zoneVisitate = []) {
  let totale = 0;
  const items = [];

  // Assicurazione (sempre applicata, 1 per persona)
  if (costiAccessori.assicurazione && costiAccessori.assicurazione.costo > 0) {
    const costoAssicurazione = costiAccessori.assicurazione.costo * numeroPersone;
    totale += costoAssicurazione;
    items.push({
      tipo: 'Assicurazione',
      descrizione: costiAccessori.assicurazione.descrizione,
      costo: costoAssicurazione,
      dettaglio: `€${costiAccessori.assicurazione.costo} x ${numeroPersone} persone`,
    });
  }

  // Documenti (se ha un costo)
  if (costiAccessori.documenti && costiAccessori.documenti.costo > 0) {
    const costoDocumenti = costiAccessori.documenti.costo * numeroPersone;
    totale += costoDocumenti;
    items.push({
      tipo: 'Documenti',
      descrizione: costiAccessori.documenti.descrizione,
      costo: costoDocumenti,
      dettaglio: `€${costiAccessori.documenti.costo} x ${numeroPersone} persone`,
    });
  }

  // Note: voli interni potrebbero essere aggiunti qui in futuro
  // basandosi sulle zone visitate e sui trasferimenti necessari

  return {
    items,
    totale,
  };
}
