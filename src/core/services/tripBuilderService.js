/**
 * Business logic per costruzione viaggi
 * Pura, testabile, senza dipendenze da store
 */

/**
 * Calcola giorni necessari per un set di esperienze
 * @param {Array} experiences - Array di esperienze
 * @param {boolean} isZoneChange - Se c'è cambio zona
 * @returns {Object} { totalDays, experienceDays, logisticsDays, transferDays }
 */
export function calculateDaysNeeded(experiences, isZoneChange = false) {
  const experienceDays = experiences.length;
  let totalDays = experienceDays + 1; // +1 giorno logistico arrivo
  let transferDays = 0;

  if (isZoneChange) {
    totalDays += 1; // +1 giorno spostamento
    transferDays = 1;
  }

  return {
    totalDays,
    experienceDays,
    logisticsDays: 1,
    transferDays
  };
}

/**
 * Valida se un pacchetto può essere aggiunto
 * @param {Array} validExperiences - Esperienze da aggiungere
 * @param {number} totalDays - Giorni totali viaggio
 * @param {Array} filledBlocks - Blocchi già riempiti
 * @param {boolean} isZoneChange - Se c'è cambio zona
 * @returns {Object} { canAdd, daysNeeded, availableDays, shouldAskAddDays, missingDays }
 */
export function validatePackageAddition(validExperiences, totalDays, filledBlocks, isZoneChange = false) {
  const { totalDays: daysNeeded } = calculateDaysNeeded(validExperiences, isZoneChange);
  const availableDays = totalDays - 1 - filledBlocks.length; // -1 per arrivo
  const canAdd = daysNeeded <= availableDays;

  return {
    canAdd,
    daysNeeded,
    availableDays,
    shouldAskAddDays: !canAdd,
    missingDays: Math.max(0, daysNeeded - availableDays)
  };
}

/**
 * Trova esperienze duplicate
 * @param {Array} newExperiences - Nuove esperienze da aggiungere
 * @param {Array} filledBlocks - Blocchi esistenti
 * @returns {Array} Esperienze duplicate
 */
export function findDuplicateExperiences(newExperiences, filledBlocks) {
  const existingIds = filledBlocks
    .map(block => block.experience?.id || block.experience?.CODICE)
    .filter(Boolean);

  return newExperiences.filter(exp => {
    const expId = exp.id || exp.CODICE;
    return existingIds.includes(expId);
  });
}

/**
 * Prepara blocchi esperienza da aggiungere
 * @param {Array} experiences - Esperienze
 * @param {Object} packageData - Dati pacchetto
 * @param {string} zoneCode - Codice zona
 * @param {string} zoneName - Nome zona
 * @param {number} startDay - Giorno iniziale
 * @param {boolean} isZoneChange - Se c'è cambio zona
 * @param {string} previousZoneName - Nome zona precedente
 * @returns {Array} Blocchi da aggiungere
 */
export function prepareExperienceBlocks(
  experiences,
  packageData,
  zoneCode,
  zoneName,
  startDay,
  isZoneChange = false,
  previousZoneName = null
) {
  const blocks = [];
  let currentDay = startDay;

  // Aggiungi giorno transfer se necessario
  if (isZoneChange && previousZoneName) {
    blocks.push({
      day: currentDay,
      type: 'transfer',
      zona: zoneName,
      codiceZona: zoneCode,
      packageName: null,
      experience: {
        nome: `Spostamento verso ${zoneName}`,
        descrizione: `Giorno dedicato al trasferimento da ${previousZoneName} a ${zoneName}`,
        type: 'transfer'
      }
    });
    currentDay++;
  }

  // Aggiungi giorno logistico arrivo
  blocks.push({
    day: currentDay,
    type: 'logistics',
    zona: zoneName,
    codiceZona: zoneCode,
    packageName: packageData.NOME_PACCHETTO || packageData.NOME || packageData.nome,
    experience: {
      nome: `Arrivo e sistemazione a ${zoneName}`,
      descrizione: `Giorno logistico per check-in hotel e orientamento`,
      type: 'logistics'
    }
  });
  currentDay++;

  // Aggiungi esperienze
  experiences.forEach(exp => {
    blocks.push({
      day: currentDay,
      type: 'experience',
      experience: exp,
      packageName: packageData.NOME_PACCHETTO || packageData.NOME || packageData.nome,
      zona: zoneName,
      codiceZona: zoneCode
    });
    currentDay++;
  });

  return blocks;
}

/**
 * Compatta blocchi rimuovendo giorni vuoti
 * @param {Array} blocks - Blocchi esistenti
 * @param {number} removedDay - Giorno rimosso
 * @returns {Array} Blocchi compattati
 */
export function compactBlocks(blocks, removedDay) {
  return blocks
    .filter(b => b.day !== removedDay)
    .map(b => {
      if (b.day > removedDay) {
        return { ...b, day: b.day - 1 };
      }
      return b;
    })
    .sort((a, b) => a.day - b.day);
}

/**
 * Calcola ultimo giorno utilizzato
 * @param {Array} blocks - Blocchi
 * @returns {number} Ultimo giorno
 */
export function getLastDay(blocks) {
  if (blocks.length === 0) return 1; // Giorno 1 è arrivo
  return Math.max(...blocks.map(b => b.day || b));
}

/**
 * Verifica se c'è cambio zona
 * @param {Array} filledBlocks - Blocchi esistenti
 * @param {string} newZoneCode - Codice nuova zona
 * @returns {boolean} True se c'è cambio zona
 */
export function isZoneChange(filledBlocks, newZoneCode) {
  if (filledBlocks.length === 0) return false;
  const lastBlock = filledBlocks[filledBlocks.length - 1];
  return lastBlock.codiceZona !== newZoneCode;
}

/**
 * Trova la zona precedente nell'itinerario
 * @param {Array} filledBlocks - Blocchi esistenti
 * @returns {string|null} Nome zona precedente
 */
export function getPreviousZoneName(filledBlocks) {
  if (filledBlocks.length === 0) return null;
  const lastBlock = filledBlocks[filledBlocks.length - 1];
  return lastBlock.zona || null;
}

/**
 * Calcola il costo totale delle esperienze
 * @param {Array} experiences - Array di esperienze
 * @returns {number} Costo totale
 */
export function calculateExperiencesCost(experiences) {
  return experiences.reduce((total, exp) => {
    const price = parseFloat(exp.PRX_PAX || exp.prezzo || 0);
    return total + (isNaN(price) ? 0 : price);
  }, 0);
}

/**
 * Filtra esperienze valide da un pacchetto
 * @param {Object} packageData - Dati del pacchetto
 * @param {Array} allExperiences - Tutte le esperienze disponibili
 * @returns {Array} Esperienze valide
 */
export function extractValidExperiences(packageData, allExperiences) {
  const experienceIds = [];

  // Estrai IDs da campi DAY*_ESPERIENZA_STD
  for (let day = 2; day <= 10; day++) {
    const fieldName = `DAY${day}_ESPERIENZA_STD`;
    if (packageData[fieldName]) {
      experienceIds.push(packageData[fieldName]);
    }
  }

  // Filtra esperienze valide
  return experienceIds
    .map(id => allExperiences.find(exp => exp.CODICE === id))
    .filter(Boolean);
}

/**
 * Verifica se un blocco può essere modificato
 * @param {Object} block - Blocco da verificare
 * @returns {boolean} True se il blocco è modificabile
 */
export function isBlockEditable(block) {
  // I blocchi di tipo transfer e logistics non sono modificabili
  return block.type === 'experience';
}

/**
 * Raggruppa blocchi per zona
 * @param {Array} blocks - Blocchi da raggruppare
 * @returns {Array} Array di oggetti { zona, blocks }
 */
export function groupBlocksByZone(blocks) {
  const grouped = {};

  blocks.forEach(block => {
    const zoneName = block.zona || 'Unknown';
    if (!grouped[zoneName]) {
      grouped[zoneName] = {
        zona: zoneName,
        codiceZona: block.codiceZona,
        blocks: []
      };
    }
    grouped[zoneName].blocks.push(block);
  });

  return Object.values(grouped);
}
