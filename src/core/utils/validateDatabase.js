/**
 * Validazione integrità database CSV
 * Verifica che tutti i collegamenti tra i vari livelli siano corretti
 */

/**
 * Valida integrità collegamenti in itinerario.csv
 * @param {Object} data - Oggetto con tutti i database caricati
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export const validateItinerari = (data) => {
  const errors = [];
  const warnings = [];

  if (!data.itinerario || data.itinerario.length === 0) {
    warnings.push('Nessun itinerario trovato nel database');
    return { valid: true, errors, warnings };
  }

  data.itinerario.forEach((it, index) => {
    const rigaNum = index + 2; // +2 perché CSV ha header e indice parte da 0

    // Valida zone esistano in zone.csv
    const zoneItinerario = [it.ZONA_1, it.ZONA_2, it.ZONA_3, it.ZONA_4]
      .filter(z => z && z !== '' && z !== 'None' && !isNaN(z) === false);

    if (zoneItinerario.length === 0) {
      errors.push(`Riga ${rigaNum} (${it.CODICE}): Nessuna zona definita`);
    }

    zoneItinerario.forEach(codiceZona => {
      const zonaExists = data.zone.find(z => z.CODICE === codiceZona);
      if (!zonaExists) {
        errors.push(`Riga ${rigaNum} (${it.CODICE}): ZONA ${codiceZona} non trovata in zone.csv`);
      }
    });

    // Valida costi accessori esistano (solo se definiti)
    const costiAcc = [
      it.COSTI_ACC_1, it.COSTI_ACC_2, it.COSTI_ACC_3,
      it.COSTI_ACC_4, it.COSTI_ACC_5, it.COSTI_ACC_6
    ].filter(c => c && c !== '' && c !== 'None' && !isNaN(c) === false);

    costiAcc.forEach(codiceCosto => {
      const costoExists = data.costi_accessori.find(c => c.CODICE === codiceCosto);
      if (!costoExists) {
        errors.push(`Riga ${rigaNum} (${it.CODICE}): COSTO_ACC ${codiceCosto} non trovato in costi_accessori.csv`);
      }
    });

    // Valida extra esistano (solo se definiti)
    const extra = [
      it.EXTRA_1, it.EXTRA_2, it.EXTRA_3, it.EXTRA_4,
      it.EXTRA_5, it.EXTRA_6, it.EXTRA_7
    ].filter(e => e && e !== '' && e !== 'None' && !isNaN(e) === false);

    extra.forEach(codiceExtra => {
      const extraExists = data.plus.find(p => p.CODICE === codiceExtra);
      if (!extraExists) {
        warnings.push(`Riga ${rigaNum} (${it.CODICE}): EXTRA ${codiceExtra} non trovato in plus.csv`);
      }
    });

    // Valida MIN_NOTTI sia coerente con numero zone
    const minNottiAtteso = zoneItinerario.length === 1 ? 2 :
                           zoneItinerario.length === 2 ? 6 :
                           zoneItinerario.length === 3 ? 10 : 15;

    if (it.MIN_NOTTI && it.MIN_NOTTI < minNottiAtteso - 2) {
      warnings.push(`Riga ${rigaNum} (${it.CODICE}): MIN_NOTTI ${it.MIN_NOTTI} sembra basso per ${zoneItinerario.length} zone (consigliato: ${minNottiAtteso})`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida collegamenti zone → hotel/voli
 * @param {Object} data - Oggetto con tutti i database caricati
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export const validateZoneLinks = (data) => {
  const errors = [];
  const warnings = [];

  if (!data.zone) {
    errors.push('Database zone non caricato');
    return { valid: false, errors, warnings };
  }

  data.zone.forEach((zona, index) => {
    const rigaNum = index + 2;

    // Valida CODICI_HOTEL se presente
    if (zona.CODICI_HOTEL) {
      const codiciHotel = zona.CODICI_HOTEL.split(';').filter(c => c && c !== '');
      codiciHotel.forEach(codiceHotel => {
        const hotelExists = data.hotel?.find(h => h.CODICE === codiceHotel);
        if (!hotelExists) {
          warnings.push(`Zona ${zona.CODICE} riga ${rigaNum}: HOTEL ${codiceHotel} non trovato in hotel.csv`);
        }
      });
    }

    // Valida CODICI_VOLO se presente
    if (zona.CODICI_VOLO) {
      const codiciVolo = zona.CODICI_VOLO.split(';').filter(c => c && c !== '');
      codiciVolo.forEach(codiceVolo => {
        const voloExists = data.voli?.find(v => v.CODICE === codiceVolo);
        if (!voloExists) {
          warnings.push(`Zona ${zona.CODICE} riga ${rigaNum}: VOLO ${codiceVolo} non trovato in voli.csv`);
        }
      });
    }

    // Valida CODICI_EXTRA se presente
    if (zona.CODICI_EXTRA) {
      const codiciExtra = zona.CODICI_EXTRA.split(';').filter(c => c && c !== '');
      codiciExtra.forEach(codiceExtra => {
        const extraExists = data.plus?.find(p => p.CODICE === codiceExtra);
        if (!extraExists) {
          warnings.push(`Zona ${zona.CODICE} riga ${rigaNum}: EXTRA ${codiceExtra} non trovato in plus.csv`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * @deprecated Pacchetti entity removed from database (Nov 2025)
 * Valida collegamenti pacchetti → esperienze
 * Returns valid result for backward compatibility
 */
export const validatePacchettiLinks = (data) => {
  console.warn('⚠️  validatePacchettiLinks is deprecated: pacchetti entity has been removed');
  return {
    valid: true,
    errors: [],
    warnings: ['Pacchetti validation skipped: entity removed from database']
  };
};

/**
 * Esegue validazione completa di tutti i database
 * @param {Object} data - Oggetto con tutti i database caricati
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[], summary: Object }
 */
export const validateAllDatabases = (data) => {
  const results = {
    itinerari: validateItinerari(data),
    zone: validateZoneLinks(data)
    // pacchetti: removed (Nov 2025)
  };

  const allErrors = [
    ...results.itinerari.errors,
    ...results.zone.errors
  ];

  const allWarnings = [
    ...results.itinerari.warnings,
    ...results.zone.warnings
  ];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    summary: {
      totalErrors: allErrors.length,
      totalWarnings: allWarnings.length,
      itinerariChecked: data.itinerario?.length || 0,
      zoneChecked: data.zone?.length || 0
      // pacchettiChecked: removed (Nov 2025)
    },
    details: results
  };
};
