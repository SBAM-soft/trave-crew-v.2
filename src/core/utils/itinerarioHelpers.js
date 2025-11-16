/**
 * Helper functions per gestire gli itinerari pre-compilati
 * Parte del sistema database Travel Crew v2.0
 */

/**
 * Trova itinerario che matcha le zone selezionate
 * @param {string[]} zoneSelezionate - Array codici zona (es: ['ZTHBA01', 'ZTHPH03'])
 * @param {Object[]} itinerari - Array itinerari dal CSV
 * @returns {Object|null} - Itinerario matching o null
 */
export const findItinerarioByZone = (zoneSelezionate, itinerari) => {
  if (!zoneSelezionate || !itinerari || zoneSelezionate.length === 0) {
    return null;
  }

  return itinerari.find(it => {
    // Estrai zone dell'itinerario (ZONA_1 ... ZONA_4)
    const zoneItinerario = [
      it.ZONA_1,
      it.ZONA_2,
      it.ZONA_3,
      it.ZONA_4
    ].filter(z => z && z !== '' && z !== 'None' && !isNaN(z) === false);

    // Ordina entrambi gli array per confronto
    const zoneSel = [...zoneSelezionate].sort();
    const zoneIti = [...zoneItinerario].sort();

    // Match: stesso numero di zone e stesse zone
    if (zoneSel.length !== zoneIti.length) {
      return false;
    }

    return zoneSel.every((zona, index) => zona === zoneIti[index]);
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
    itinerario.COSTI_ACC_6
  ].filter(c => c && c !== '' && c !== 'None' && !isNaN(c) === false);
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
    itinerario.EXTRA_7
  ].filter(e => e && e !== '' && e !== 'None' && !isNaN(e) === false);
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
    itinerario.ZONA_4
  ].filter(z => z && z !== '' && z !== 'None' && !isNaN(z) === false);
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
 * Filtra pacchetti in base agli interessi del wizard
 * @param {Array} pacchetti - Array di pacchetti PEXP
 * @param {Array} interessi - Array di interessi selezionati nel wizard
 * @returns {Array} - Array di pacchetti filtrati
 */
export const filterPacchettiByInteressi = (pacchetti, interessi) => {
  if (!pacchetti || pacchetti.length === 0) {
    return [];
  }

  // Se non ci sono interessi, restituisci tutti i pacchetti
  if (!interessi || interessi.length === 0) {
    return pacchetti;
  }

  // Normalizza interessi per confronto (lowercase e trim)
  const interessiNormalized = interessi.map(i => i.toLowerCase().trim());

  return pacchetti.filter(pacco => {
    // Estrai categorie/tag del pacchetto
    const categoriePacco = [];

    // Aggiungi categoria principale se presente
    if (pacco.CATEGORIA) {
      categoriePacco.push(pacco.CATEGORIA.toLowerCase().trim());
    }

    // Aggiungi tag se presenti (campo TAGS separato da virgole o punto e virgola)
    if (pacco.TAGS) {
      const tags = pacco.TAGS.split(/[,;]/).map(t => t.toLowerCase().trim());
      categoriePacco.push(...tags);
    }

    // Aggiungi tipo di esperienza se presente
    if (pacco.TIPO) {
      categoriePacco.push(pacco.TIPO.toLowerCase().trim());
    }

    // Verifica se almeno un interesse matcha con le categorie del pacchetto
    return interessiNormalized.some(interesse =>
      categoriePacco.some(cat =>
        cat.includes(interesse) || interesse.includes(cat)
      )
    );
  });
};

/**
 * Suggerisci prossimi pacchetti basandosi sulla logistica
 * Usa il campo possibili_next_zone per proporre pacchetti ottimizzati
 * @param {Object} currentPEXP - Pacchetto corrente selezionato
 * @param {Array} allPEXP - Array di tutti i pacchetti disponibili
 * @returns {Array} - Array di pacchetti suggeriti per il prossimo giorno
 */
export const getNextPossiblePEXP = (currentPEXP, allPEXP) => {
  if (!currentPEXP || !allPEXP || allPEXP.length === 0) {
    return allPEXP;
  }

  // Se il pacchetto corrente non ha zone successive specificate, restituisci tutti
  if (!currentPEXP.possibili_next_zone || currentPEXP.possibili_next_zone === '') {
    return allPEXP;
  }

  // Estrai le zone successive possibili (separate da virgole)
  const nextZones = currentPEXP.possibili_next_zone
    .split(',')
    .map(z => z.trim())
    .filter(z => z !== '');

  // Filtra pacchetti che appartengono alle zone successive
  const suggeriti = allPEXP.filter(pexp => {
    const zonaId = pexp.ZONA_ID || pexp.zona_id;
    return nextZones.includes(zonaId);
  });

  // Se ci sono suggerimenti, restituiscili, altrimenti tutti
  return suggeriti.length > 0 ? suggeriti : allPEXP;
};

/**
 * Calcola score di rilevanza per un pacchetto basato su interessi e logistica
 * @param {Object} pexp - Pacchetto da valutare
 * @param {Array} interessi - Interessi utente
 * @param {Object} currentPEXP - Pacchetto corrente (per logistica)
 * @returns {Number} - Score di rilevanza (0-100)
 */
export const calculatePEXPRelevanceScore = (pexp, interessi = [], currentPEXP = null) => {
  let score = 50; // Base score

  // +30 punti se matcha con gli interessi
  if (interessi && interessi.length > 0) {
    const categoriePacco = [];

    if (pexp.CATEGORIA) categoriePacco.push(pexp.CATEGORIA.toLowerCase());
    if (pexp.TAGS) {
      const tags = pexp.TAGS.split(/[,;]/).map(t => t.toLowerCase().trim());
      categoriePacco.push(...tags);
    }
    if (pexp.TIPO) categoriePacco.push(pexp.TIPO.toLowerCase());

    const interessiNormalized = interessi.map(i => i.toLowerCase().trim());
    const hasMatch = interessiNormalized.some(interesse =>
      categoriePacco.some(cat => cat.includes(interesse) || interesse.includes(cat))
    );

    if (hasMatch) score += 30;
  }

  // +20 punti se è logisticamente ottimale (zona successiva suggerita)
  if (currentPEXP && currentPEXP.possibili_next_zone) {
    const nextZones = currentPEXP.possibili_next_zone.split(',').map(z => z.trim());
    const zonaId = pexp.ZONA_ID || pexp.zona_id;

    if (nextZones.includes(zonaId)) {
      score += 20;
    }
  }

  return Math.min(score, 100);
};

/**
 * Ordina pacchetti per rilevanza (score decrescente)
 * @param {Array} pacchetti - Array di pacchetti
 * @param {Array} interessi - Interessi utente
 * @param {Object} currentPEXP - Pacchetto corrente
 * @returns {Array} - Array ordinato per rilevanza
 */
export const sortPacchettiByRelevance = (pacchetti, interessi = [], currentPEXP = null) => {
  return [...pacchetti].sort((a, b) => {
    const scoreA = calculatePEXPRelevanceScore(a, interessi, currentPEXP);
    const scoreB = calculatePEXPRelevanceScore(b, interessi, currentPEXP);
    return scoreB - scoreA; // Decrescente
  });
};
