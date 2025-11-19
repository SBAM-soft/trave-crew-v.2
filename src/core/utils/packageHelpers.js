/**
 * packageHelpers.js
 * Utility functions per gestione pacchetti esperienze
 */

import { loadEntityData } from './dataLoader';

/**
 * Carica un pacchetto completo con tutte le sue esperienze
 * @param {string} packageCode - Codice pacchetto (es: "PTHBA01")
 * @returns {Promise<object>} Pacchetto con array esperienze
 */
export const getPackageComplete = async (packageCode) => {
  try {
    // Carica CSV
    const packages = await loadEntityData('pacchetti', true);
    const experiences = await loadEntityData('esperienze', true);
    
    // Trova il pacchetto
    const pkg = packages.find(p => p.CODICE === packageCode);
    
    if (!pkg) {
      throw new Error(`Pacchetto ${packageCode} non trovato`);
    }
    
    // Raccogli tutte le esperienze collegate
    const experiencesList = [];
    
    // Scorre tutti i giorni possibili (G2 fino G10)
    for (let day = 2; day <= 10; day++) {
      // Per ogni giorno, controlla fino a 3 esperienze (ORD1, ORD2, ORD3)
      for (let ord = 1; ord <= 3; ord++) {
        const fieldName = `ATTIVITA_G${day}_ORD${ord}`;
        const expCode = pkg[fieldName];
        
        if (expCode) {
          // Trova l'esperienza nel CSV
          const exp = experiences.find(e => e.CODICE === expCode);
          
          if (exp) {
            experiencesList.push({
              ...exp,
              giorno: day,
              ordine: ord
            });
          }
        }
      }
    }
    
    return {
      ...pkg,
      experiences: experiencesList,
      totalExperiences: experiencesList.length
    };
    
  } catch (error) {
    console.error('Errore caricamento pacchetto:', error);
    throw error;
  }
};

/**
 * Carica tutti i plus applicabili a un'esperienza
 * @param {string} experienceCode - Codice esperienza (es: "XTHBA01")
 * @returns {Promise<array>} Array di plus applicabili
 */
export const getPlusForExperience = async (experienceCode) => {
  try {
    const experiences = await loadEntityData('esperienze', true);
    const plusData = await loadEntityData('extra', false);
    
    // Trova esperienza
    const exp = experiences.find(e => e.CODICE === experienceCode);
    
    if (!exp) {
      console.warn(`Esperienza ${experienceCode} non trovata`);
      return [];
    }
    
    const applicablePlus = [];
    
    // Scorre tutti i plus collegati (PLUS_COLLEGATO_1 fino PLUS_COLLEGATO_9)
    for (let i = 1; i <= 9; i++) {
      const plusCode = exp[`PLUS_COLLEGATO_${i}`];
      
      if (plusCode) {
        const plus = plusData.find(p => p.CODICE === plusCode);
        
        if (plus) {
          applicablePlus.push(plus);
        }
      }
    }
    
    return applicablePlus;
    
  } catch (error) {
    console.error('Errore caricamento plus:', error);
    return [];
  }
};

/**
 * Calcola il prezzo totale di un pacchetto con plus selezionati
 * @param {number} packagePrice - Prezzo base pacchetto
 * @param {array} selectedPlusCodes - Array codici plus selezionati
 * @param {number} numPersone - Numero persone
 * @returns {Promise<number>} Prezzo totale
 */
export const calculateTotalPrice = async (packagePrice, selectedPlusCodes = [], numPersone = 1) => {
  try {
    // Prezzo base pacchetto
    let total = parseFloat(packagePrice) * numPersone;
    
    if (selectedPlusCodes.length > 0) {
      const plusData = await loadEntityData('extra', false);
      
      // Aggiungi prezzo di ogni plus
      selectedPlusCodes.forEach(plusCode => {
        const plus = plusData.find(p => p.CODICE === plusCode);
        
        if (plus && plus.PRZ_PAX_GEN) {
          total += parseFloat(plus.PRZ_PAX_GEN) * numPersone;
        }
      });
    }
    
    return total;
    
  } catch (error) {
    console.error('Errore calcolo prezzo:', error);
    return parseFloat(packagePrice) * numPersone; // Fallback solo prezzo base
  }
};

/**
 * Valida che ci sia almeno 1 esperienza con Like
 * @param {object} experienceStates - Stato Like/Dislike esperienze
 * @returns {boolean} true se almeno 1 Like
 */
export const validateExperienceSelection = (experienceStates) => {
  const liked = Object.values(experienceStates).filter(s => s.liked);
  return liked.length > 0;
};

/**
 * Filtra solo le esperienze con Like
 * @param {array} experiences - Array esperienze
 * @param {object} experienceStates - Stato Like/Dislike
 * @returns {array} Solo esperienze con Like
 */
export const getLikedExperiences = (experiences, experienceStates) => {
  return experiences.filter(exp => 
    experienceStates[exp.CODICE]?.liked === true
  );
};

/**
 * Calcola slot totali occupati dalle esperienze
 * @param {array} experiences - Array esperienze
 * @returns {number} Totale slot
 */
export const calculateTotalSlots = (experiences) => {
  return experiences.reduce((total, exp) => {
    const slots = parseInt(exp.SLOT_OCCUPATI) || 0;
    return total + slots;
  }, 0);
};

/**
 * Formatta prezzo per visualizzazione
 * @param {number} price - Prezzo
 * @returns {string} Prezzo formattato (es: "€450")
 */
export const formatPrice = (price) => {
  return `€${parseFloat(price).toFixed(0)}`;
};

/**
 * Raggruppa esperienze per giorno
 * @param {array} experiences - Array esperienze
 * @returns {object} Oggetto con giorni come chiavi
 */
export const groupExperiencesByDay = (experiences) => {
  return experiences.reduce((grouped, exp) => {
    const day = exp.giorno || 1;
    
    if (!grouped[day]) {
      grouped[day] = [];
    }
    
    grouped[day].push(exp);
    return grouped;
  }, {});
};
