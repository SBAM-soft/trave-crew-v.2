import { useMemo } from 'react';
import { useEntityQuery } from './useEntityQuery';

/**
 * Hook per caricare gli extra specifici di un'esperienza
 * Carica extra_tech.csv e filtra in base ai codici EXTRA_1-9 dell'esperienza
 */
export function useExperienceExtras(experience) {
  const { data: allExtras = [], isLoading, error } = useEntityQuery('extra', false);

  // Estrai i codici extra dall'esperienza (EXTRA_1, EXTRA_2, ..., EXTRA_9)
  const extraCodes = useMemo(() => {
    if (!experience) return [];

    const codes = [];
    for (let i = 1; i <= 9; i++) {
      const code = experience[`EXTRA_${i}`];
      if (code && code.trim()) {
        codes.push(code.trim());
      }
    }
    return codes;
  }, [experience]);

  // Filtra gli extra in base ai codici
  const experienceExtras = useMemo(() => {
    if (extraCodes.length === 0) return [];

    return allExtras
      .filter(extra => extraCodes.includes(extra.CODICE))
      .map(extra => ({
        id: extra.CODICE,
        codice: extra.CODICE,
        nome: extra.PLUS || 'Extra',
        descrizione: extra.DESCRIZIONE || '',
        livello: extra.LIVELLO_PLUS,
        tipo: extra.TIPO,
        supplemento: parseFloat(extra.SUPPLEMENTO) || 0,
        costoSupplemento: parseFloat(extra.COSTO_SUPPLEMENTO) || 0,
        codiceCollegato: extra.CODICE_COLLEGATO,
        // DEPRECATED: Following fields removed from database (Nov 2025)
        // prezzoServizioBase: 0,
        // prezzoFinaleServizio: 0,
        // marginaleFinale: '',
        destinazione: extra.DESTINAZIONE,
        zona: extra.ZONA,
        icon: getIconForExtra(extra.TIPO, extra.LIVELLO_PLUS),
      }));
  }, [allExtras, extraCodes]);

  return {
    extras: experienceExtras,
    extraCodes,
    isLoading,
    error,
    hasExtras: experienceExtras.length > 0
  };
}

/**
 * Helper per determinare l'icona in base al tipo di extra
 */
function getIconForExtra(tipo, livello) {
  // Mappa icone basate sul livello PLUS
  if (livello) {
    const level = livello.toLowerCase();
    if (level.includes('esp')) return '🎯'; // Esperienza
    if (level.includes('htl')) return '🏨'; // Hotel
    if (level.includes('pacc')) return '📦'; // Pacchetto
    if (level.includes('iti')) return '🗺️'; // Itinerario
  }

  // Fallback generico
  return '✨';
}
