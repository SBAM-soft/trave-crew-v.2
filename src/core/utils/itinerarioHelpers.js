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
