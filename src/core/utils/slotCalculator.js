/**
 * SLOT CALCULATOR - Sistema gestione slot giornalieri
 * 
 * REGOLE:
 * - Giornata = 3 SLOT (Mattina, Pomeriggio, Sera)
 * - F (Full Day) = 3 slot
 * - H (Half Day) = 2 slot
 * - S (Single) = 1 slot
 * - MAX 3 slot per giorno
 */

/**
 * Calcola slot totali disponibili
 * @param {number} giorni - Numero giorni viaggio
 * @returns {number} - Slot totali disponibili
 */
export const calcolaSlotTotali = (giorni) => {
  return giorni * 3;
};

/**
 * Calcola slot usati nell'itinerario
 * @param {Array} esperienze - Array esperienze selezionate
 * @returns {number} - Slot totali usati
 */
export const calcolaSlotUsati = (esperienze) => {
  return esperienze.reduce((sum, exp) => sum + (exp.slot_occupati || 0), 0);
};

/**
 * Calcola slot usati per un giorno specifico
 * @param {Array} esperienze - Array esperienze
 * @param {number} giorno - Numero giorno (1-based)
 * @returns {number} - Slot usati in quel giorno
 */
export const calcolaSlotPerGiorno = (esperienze, giorno) => {
  const esperienzeGiorno = esperienze.filter(e => e.giorno === giorno);
  return esperienzeGiorno.reduce((sum, e) => sum + (e.slot_occupati || 0), 0);
};

/**
 * Verifica se c'è sforamento slot
 * @param {number} slotUsati - Slot usati
 * @param {number} slotTotali - Slot totali disponibili
 * @returns {boolean} - true se sforamento
 */
export const verificaSforamento = (slotUsati, slotTotali) => {
  return slotUsati > slotTotali;
};

/**
 * Trova il primo giorno con slot disponibili
 * @param {Array} esperienze - Esperienze già nell'itinerario
 * @param {number} giorniTotali - Giorni totali viaggio
 * @param {number} slotNecessari - Slot necessari per nuova esperienza
 * @returns {number|null} - Numero giorno disponibile o null
 */
export const trovaGiornoDisponibile = (esperienze, giorniTotali, slotNecessari) => {
  for (let giorno = 1; giorno <= giorniTotali; giorno++) {
    const slotGiorno = calcolaSlotPerGiorno(esperienze, giorno);
    const slotLiberi = 3 - slotGiorno;
    
    if (slotLiberi >= slotNecessari) {
      return giorno;
    }
  }
  return null;
};

/**
 * Calcola percentuale slot usati
 * @param {number} slotUsati 
 * @param {number} slotTotali 
 * @returns {number} - Percentuale (0-100)
 */
export const calcolaPercentualeSlot = (slotUsati, slotTotali) => {
  if (slotTotali === 0) return 0;
  return Math.min((slotUsati / slotTotali) * 100, 100);
};

/**
 * Ottieni badge colore per tipo slot
 * @param {string} tipoSlot - F, H, S
 * @returns {object} - { label, emoji, color }
 */
export const getBadgeSlot = (tipoSlot) => {
  const badges = {
    F: { label: 'Full Day', emoji: '⏰', color: '#8B5CF6', slots: 3 },
    H: { label: 'Half Day', emoji: '⏱️', color: '#F59E0B', slots: 2 },
    S: { label: 'Single', emoji: '⚡', color: '#10B981', slots: 1 }
  };
  
  return badges[tipoSlot] || badges.S;
};

/**
 * Ottieni emoji slot specifico
 * @param {string} slotCode - M, P, S
 * @returns {string} - Emoji
 */
export const getSlotEmoji = (slotCode) => {
  const emojis = {
    M: '🌅', // Mattina
    P: '☀️', // Pomeriggio
    S: '🌙'  // Sera
  };
  
  return emojis[slotCode] || '⭐';
};

/**
 * Ottieni label slot specifico
 * @param {string} slotCode - M, P, S
 * @returns {string} - Label
 */
export const getSlotLabel = (slotCode) => {
  const labels = {
    M: 'Mattina',
    P: 'Pomeriggio',
    S: 'Sera'
  };
  
  return labels[slotCode] || 'Generico';
};

/**
 * Valida se esperienza può essere aggiunta
 * @param {Array} itinerario - Itinerario attuale
 * @param {object} nuovaEsperienza - Esperienza da aggiungere
 * @param {number} giorniTotali - Giorni totali viaggio
 * @returns {object} - { valido: boolean, messaggio: string, giornoSuggerito: number }
 */
export const validaAggiuntaEsperienza = (itinerario, nuovaEsperienza, giorniTotali) => {
  const slotTotali = calcolaSlotTotali(giorniTotali);
  const slotUsati = calcolaSlotUsati(itinerario);
  const slotNecessari = nuovaEsperienza.slot_occupati || 1;
  
  // Check sforamento totale
  if (slotUsati + slotNecessari > slotTotali) {
    return {
      valido: false,
      messaggio: `⚠️ Sforamento slot! Hai già usato ${slotUsati}/${slotTotali} slot. Rimuovi altre esperienze.`,
      giornoSuggerito: null
    };
  }
  
  // Trova giorno disponibile
  const giornoDisponibile = trovaGiornoDisponibile(itinerario, giorniTotali, slotNecessari);
  
  if (!giornoDisponibile) {
    return {
      valido: false,
      messaggio: `Nessun giorno ha ${slotNecessari} slot liberi consecutivi`,
      giornoSuggerito: null
    };
  }
  
  return {
    valido: true,
    messaggio: `✅ Esperienza aggiungibile al giorno ${giornoDisponibile}`,
    giornoSuggerito: giornoDisponibile
  };
};

/**
 * Distribuisci esperienze nei giorni (algoritmo semplice)
 * @param {Array} esperienze - Esperienze da distribuire
 * @param {number} giorniTotali - Giorni totali
 * @returns {Array} - Esperienze con campo 'giorno' assegnato
 */
export const distribuisciEsperienzeNeiGiorni = (esperienze, giorniTotali) => {
  const itinerario = [];
  
  esperienze.forEach(exp => {
    const giornoDisponibile = trovaGiornoDisponibile(
      itinerario, 
      giorniTotali, 
      exp.slot_occupati
    );
    
    if (giornoDisponibile) {
      itinerario.push({
        ...exp,
        giorno: giornoDisponibile
      });
    }
  });
  
  return itinerario;
};

/**
 * Ottieni riepilogo slot per giorno
 * @param {Array} esperienze 
 * @param {number} giorno 
 * @returns {object} - { slotUsati, slotLiberi, esperienze, completo }
 */
export const getRiepilogoGiorno = (esperienze, giorno) => {
  const esperienzeGiorno = esperienze.filter(e => e.giorno === giorno);
  const slotUsati = calcolaSlotPerGiorno(esperienze, giorno);
  const slotLiberi = 3 - slotUsati;
  
  return {
    slotUsati,
    slotLiberi,
    esperienze: esperienzeGiorno,
    completo: slotUsati === 3,
    sforamento: slotUsati > 3
  };
};