/**
 * Funzioni di validazione per input utente
 */

export const validateDays = (days) => {
  const numDays = parseInt(days);
  if (isNaN(numDays)) return { valid: false, error: 'Inserisci un numero valido' };
  if (numDays < 3) return { valid: false, error: 'Il viaggio deve durare almeno 3 giorni' };
  if (numDays > 14) return { valid: false, error: 'Il viaggio non può superare 14 giorni' };
  return { valid: true };
};

export const validateZoneSelection = (zones, totalDays, filledBlocks = []) => {
  if (zones.length === 0) return { valid: false, error: 'Seleziona almeno una zona' };

  const totalDaysNeeded = zones.reduce((sum, z) => sum + (z.daysRecommended || 2), 0);
  // LOGICA AGGIORNATA: -1 per partenza, -filledBlocks già occupati
  const availableDays = totalDays - 1 - filledBlocks.length;

  if (totalDaysNeeded > availableDays) {
    return {
      valid: false,
      error: `Le zone selezionate richiedono ${totalDaysNeeded} giorni, ma ne hai solo ${availableDays} disponibili`
    };
  }

  return { valid: true };
};

export const validateHotelSelection = (tier, zona) => {
  if (!tier) return { valid: false, error: 'Seleziona una categoria hotel' };
  if (!zona) return { valid: false, error: 'Zona non specificata' };
  return { valid: true };
};

export const calculateNightsForZone = (zoneCode, filledBlocks) => {
  const zoneBlocks = filledBlocks.filter(b => b.zoneCode === zoneCode);
  return zoneBlocks.length; // 1 blocco = 1 notte
};

export const formatPrice = (price, currency = '€') => {
  const num = parseFloat(price);
  if (isNaN(num)) return `${currency}0`;
  return `${currency}${num.toLocaleString('it-IT')}`;
};

export const formatDuration = (days) => {
  const num = parseInt(days);
  if (isNaN(num)) return '0 giorni';
  return num === 1 ? '1 giorno' : `${num} giorni`;
};
