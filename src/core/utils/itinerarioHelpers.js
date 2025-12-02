/**
 * Helper functions per gestire gli itinerari pre-compilati
 * Parte del sistema database Travel Crew v2.0
 */

/**
 * Trova itinerario che contiene tutte le zone selezionate
 * L'ordine delle zone è quello definito nel CSV (ottimizzato), non quello di selezione dell'utente
 * @param {string[]} zoneSelezionate - Array codici zona (es: ['ZTHBA', 'ZTHPH', 'ZTHCH'])
 * @param {Object[]} itinerari - Array itinerari dal CSV
 * @returns {Object|null} - Itinerario matching o null
 */
export const findItinerarioByZone = (zoneSelezionate, itinerari) => {
  if (!zoneSelezionate || !itinerari || zoneSelezionate.length === 0) {
    return null;
  }

  // Crea un Set delle zone selezionate per lookup veloce
  const zoneSelSet = new Set(zoneSelezionate);

  return itinerari.find(it => {
    // Estrai zone dell'itinerario (ZONA_1 ... ZONA_6)
    const zoneItinerario = [
      it.ZONA_1,
      it.ZONA_2,
      it.ZONA_3,
      it.ZONA_4,
      it.ZONA_5,
      it.ZONA_6
    ].filter(z => z && z !== '' && z !== 'None' && z !== 'nd');

    // Match: l'itinerario deve contenere ESATTAMENTE le stesse zone (stesso numero e stesse zone)
    // L'ordine è quello del CSV, non quello di selezione
    if (zoneSelSet.size !== zoneItinerario.length) {
      return false;
    }

    // Verifica che ogni zona dell'itinerario sia nelle zone selezionate
    return zoneItinerario.every(zona => zoneSelSet.has(zona));
  });
};

/**
 * Estrai codici costi accessori di un itinerario
 * @param {Object} itinerario - Oggetto itinerario
 * @returns {string[]} - Array codici costi accessori
 */
export const getCodiciCostiAccessori = (itinerario) => {
  if (!itinerario) {
    return [];
  }

  return [
    itinerario.COSTI_ACC_1,
    itinerario.COSTI_ACC_2,
    itinerario.COSTI_ACC_3,
    itinerario.COSTI_ACC_4,
    itinerario.COSTI_ACC_5,
    itinerario.COSTI_ACC_6,
    itinerario.COSTI_ACC_7,
    itinerario.COSTI_ACC_8,
    itinerario.COSTI_ACC_9,
    itinerario.COSTI_ACC_10,
    itinerario.COSTI_ACC_11,
    itinerario.COSTI_ACC_12,
    itinerario.COSTI_ACC_13,
    itinerario.COSTI_ACC_14,
    itinerario.COSTI_ACC_15
  ].filter(c => c && c !== '' && c !== 'None' && c !== 'nd');
};

/**
 * Estrai oggetti costi accessori completi
 * @param {Object} itinerario - Oggetto itinerario
 * @param {Object[]} costiAccessoriDB - Database costi accessori
 * @returns {Object[]} - Array oggetti costi accessori
 */
export const getCostiAccessoriItinerario = (itinerario, costiAccessoriDB) => {
  if (!costiAccessoriDB) {
    return [];
  }

  const codici = getCodiciCostiAccessori(itinerario);
  return costiAccessoriDB.filter(acc => codici.includes(acc.CODICE));
};

/**
 * Estrai codici extra suggeriti
 * @param {Object} itinerario - Oggetto itinerario
 * @returns {string[]} - Array codici extra
 */
export const getCodiciExtra = (itinerario) => {
  if (!itinerario) {
    return [];
  }

  return [
    itinerario.EXTRA_1,
    itinerario.EXTRA_2,
    itinerario.EXTRA_3,
    itinerario.EXTRA_4,
    itinerario.EXTRA_5,
    itinerario.EXTRA_6,
    itinerario.EXTRA_7,
    itinerario.EXTRA_8,
    itinerario.EXTRA_9,
    itinerario.EXTRA_10,
    itinerario.EXTRA_11,
    itinerario.EXTRA_12,
    itinerario.EXTRA_13,
    itinerario.EXTRA_14,
    itinerario.EXTRA_15
  ].filter(e => e && e !== '' && e !== 'None' && e !== 'nd');
};

/**
 * Estrai oggetti extra completi
 * @param {Object} itinerario - Oggetto itinerario
 * @param {Object[]} plusDB - Database plus/extra
 * @returns {Object[]} - Array oggetti extra
 */
export const getExtraSuggeriti = (itinerario, plusDB) => {
  if (!plusDB) {
    return [];
  }

  const codici = getCodiciExtra(itinerario);
  return plusDB.filter(ext => codici.includes(ext.CODICE));
};

/**
 * Estrai zone dell'itinerario
 * @param {Object} itinerario - Oggetto itinerario
 * @returns {string[]} - Array codici zone
 */
export const getZoneItinerario = (itinerario) => {
  if (!itinerario) {
    return [];
  }

  return [
    itinerario.ZONA_1,
    itinerario.ZONA_2,
    itinerario.ZONA_3,
    itinerario.ZONA_4,
    itinerario.ZONA_5,
    itinerario.ZONA_6
  ].filter(z => z && z !== '' && z !== 'None' && z !== 'nd');
};

/**
 * Genera codice itinerario
 * @param {string} destinazione - Nome destinazione (es: THAILANDIA)
 * @param {string} zonaPrincipale - Nome zona principale (es: BANGKOK)
 * @param {number} contatore - Numero progressivo
 * @returns {string} - Codice generato (es: ITHBA01)
 */
export const generaCodiceItinerario = (destinazione, zonaPrincipale, contatore) => {
  const dest2 = destinazione.substring(0, 2).toUpperCase();
  const zona2 = zonaPrincipale.substring(0, 2).toUpperCase();
  const cont = String(contatore).padStart(2, '0');

  return `I${dest2}${zona2}${cont}`;
};

/**
 * Trova tutti gli itinerari disponibili per una destinazione
 * @param {string} codiceDestinazione - Codice destinazione (es: DTH01 o THAILANDIA)
 * @param {Object[]} itinerari - Array itinerari dal CSV
 * @returns {Object[]} - Array itinerari disponibili
 */
export const getItinerariPerDestinazione = (codiceDestinazione, itinerari) => {
  if (!codiceDestinazione || !itinerari) {
    return [];
  }

  // Cerca sia per codice che per nome destinazione
  return itinerari.filter(it =>
    it.DESTINAZIONE === codiceDestinazione ||
    it.DESTINAZIONE?.toUpperCase().includes(codiceDestinazione.toUpperCase())
  );
};

/**
 * Verifica se un itinerario contiene una specifica zona
 * @param {Object} itinerario - Oggetto itinerario
 * @param {string} codiceZona - Codice zona da cercare
 * @returns {boolean} - True se la zona è nell'itinerario
 */
export const itinerarioContienZona = (itinerario, codiceZona) => {
  if (!itinerario || !codiceZona) {
    return false;
  }

  const zone = getZoneItinerario(itinerario);
  return zone.includes(codiceZona);
};

/**
 * Calcola il numero di zone in un itinerario
 * @param {Object} itinerario - Oggetto itinerario
 * @returns {number} - Numero di zone
 */
export const getNumeroZone = (itinerario) => {
  if (!itinerario) {
    return 0;
  }

  return getZoneItinerario(itinerario).length;
};

/**
 * Estrai zone visitate dai blocchi confermati
 * @param {Array} filledBlocks - Array di blocchi giorno confermati
 * @returns {Array} - Array di oggetti { codice, nome } zone uniche
 */
export const getZoneVisitate = (filledBlocks) => {
  if (!filledBlocks || filledBlocks.length === 0) {
    return [];
  }

  const zoneMap = new Map();

  filledBlocks.forEach(block => {
    if (block.codiceZona && block.zona) {
      zoneMap.set(block.codiceZona, block.zona);
    }
  });

  // Converti in array di oggetti
  return Array.from(zoneMap.entries()).map(([codice, nome]) => ({
    codice,
    nome
  }));
};

/**
 * Filtra hotel per zone visitate
 * @param {Array} hotels - Array di tutti gli hotel
 * @param {Array} zoneVisitate - Array di zone visitate { codice, nome }
 * @returns {Object} - Oggetto { zoneHotels: [...], allHotels: [...] }
 */
export const filterHotelsByZone = (hotels, zoneVisitate) => {
  if (!hotels || !zoneVisitate || zoneVisitate.length === 0) {
    return { zoneHotels: {}, allHotels: [] };
  }

  const zoneNames = zoneVisitate.map(z => z.nome.toUpperCase().trim());
  const zoneHotels = {};
  const allHotels = [];

  hotels.forEach(hotel => {
    const hotelZone = hotel.ZONA?.toUpperCase().trim();

    if (zoneNames.includes(hotelZone)) {
      if (!zoneHotels[hotelZone]) {
        zoneHotels[hotelZone] = [];
      }
      zoneHotels[hotelZone].push(hotel);
      allHotels.push(hotel);
    }
  });

  return { zoneHotels, allHotels };
};

/**
 * Raggruppa hotel per zona e budget
 * @param {Array} hotels - Array di hotel
 * @param {Array} zoneVisitate - Array di zone visitate
 * @returns {Object} - { zonaNome: { LOW: hotel, MEDIUM: hotel, HIGH: hotel } }
 */
export const groupHotelsByZoneAndBudget = (hotels, zoneVisitate) => {
  if (!hotels || !zoneVisitate || zoneVisitate.length === 0) {
    return {};
  }

  const grouped = {};
  const zoneNames = zoneVisitate.map(z => z.nome.toUpperCase().trim());

  zoneNames.forEach(zoneName => {
    grouped[zoneName] = {
      LOW: null,
      MEDIUM: null,
      HIGH: null
    };
  });

  hotels.forEach(hotel => {
    const hotelZone = hotel.ZONA?.toUpperCase().trim();
    const budget = hotel.BUDGET;

    if (zoneNames.includes(hotelZone) && grouped[hotelZone]) {
      // Prendi il primo hotel disponibile per ogni budget
      if (!grouped[hotelZone][budget]) {
        grouped[hotelZone][budget] = hotel;
      }
    }
  });

  return grouped;
};

/**
 * Estrai extra hotel dal CSV plus
 * @param {Object} hotel - Oggetto hotel
 * @param {Array} plusDB - Database plus/extra
 * @returns {Array} - Array oggetti extra disponibili per l'hotel
 */
export const getHotelExtras = (hotel, plusDB) => {
  if (!hotel || !plusDB) {
    return [];
  }

  const extraCodes = [
    hotel.EXTRA_1,
    hotel.EXTRA_2,
    hotel.EXTRA_3,
    hotel.EXTRA_4,
    hotel.EXTRA_5,
    hotel.EXTRA_6,
    hotel.EXTRA_7
  ].filter(code => code && code !== '' && code !== 'None');

  return plusDB.filter(extra =>
    extraCodes.includes(extra.CODICE) &&
    extra.APPLICABILE_A?.toLowerCase().includes('hotel')
  );
};

/**
 * @deprecated Pacchetti entity removed from database (Nov 2025)
 * Filtra pacchetti in base agli interessi del wizard
 * Returns empty array for backward compatibility
 */
export const filterPacchettiByInteressi = (pacchetti, interessi) => {
  console.warn('⚠️  filterPacchettiByInteressi is deprecated: pacchetti entity has been removed');
  return [];
};

/**
 * @deprecated Pacchetti entity removed from database (Nov 2025)
 * Suggerisci prossimi pacchetti basandosi sulla logistica
 * Returns empty array for backward compatibility
 */
export const getNextPossiblePEXP = (currentPEXP, allPEXP) => {
  console.warn('⚠️  getNextPossiblePEXP is deprecated: pacchetti entity has been removed');
  return [];
};

/**
 * @deprecated Pacchetti entity removed from database (Nov 2025)
 * Calcola score di rilevanza per un pacchetto
 * Returns 0 for backward compatibility
 */
export const calculatePEXPRelevanceScore = (pexp, interessi = [], currentPEXP = null) => {
  console.warn('⚠️  calculatePEXPRelevanceScore is deprecated: pacchetti entity has been removed');
  return 0;
};

/**
 * @deprecated Pacchetti entity removed from database (Nov 2025)
 * Ordina pacchetti per rilevanza
 * Returns empty array for backward compatibility
 */
export const sortPacchettiByRelevance = (pacchetti, interessi = [], currentPEXP = null) => {
  console.warn('⚠️  sortPacchettiByRelevance is deprecated: pacchetti entity has been removed');
  return [];
};

/**
 * Calcola il numero di notti per ogni zona dai blocchi confermati
 * @param {Array} filledBlocks - Array di blocchi giorno confermati
 * @param {Array} zoneVisitate - Array di zone visitate { codice, nome }
 * @returns {Object} - { zonaNome: numNotti }
 */
export const calcolaNottiPerZona = (filledBlocks, zoneVisitate) => {
  if (!filledBlocks || filledBlocks.length === 0 || !zoneVisitate) {
    return {};
  }

  const nottiPerZona = {};

  // Inizializza contatori per ogni zona
  zoneVisitate.forEach(zona => {
    const zonaKey = zona.nome.toUpperCase().trim();
    nottiPerZona[zonaKey] = 0;
  });

  // Crea una mappa delle zone per codice (per lookup veloce)
  const zoneMap = new Map();
  zoneVisitate.forEach(zona => {
    zoneMap.set(zona.codice, zona.nome.toUpperCase().trim());
  });

  // Conta i giorni per zona
  // Ogni blocco con un'esperienza in una zona conta come un giorno in quella zona
  filledBlocks.forEach(block => {
    if (block.codiceZona && block.zona) {
      const zonaKey = block.zona.toUpperCase().trim();

      // Verifica se la zona è nelle zone visitate
      if (nottiPerZona.hasOwnProperty(zonaKey)) {
        // Se il blocco ha un'esperienza, conta come 1 notte
        // (assumendo che se visiti una zona in un giorno, dormi lì quella notte)
        if (block.experience) {
          nottiPerZona[zonaKey] += 1;
        }
      }
    }
  });

  return nottiPerZona;
};
