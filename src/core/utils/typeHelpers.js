/**
 * Helper per conversioni tipo sicure
 * Previene bug di type coercion con dati CSV caricati come stringhe
 */

/**
 * Converte un valore in numero, con fallback
 * @param {*} value - Valore da convertire
 * @param {number} defaultValue - Valore di default se conversione fallisce
 * @returns {number}
 */
export const toNumber = (value, defaultValue = 0) => {
  // Se è già un numero, ritorna direttamente
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  // Se è una stringa, prova a parsare
  if (typeof value === 'string') {
    const num = parseFloat(value.trim());
    return isNaN(num) ? defaultValue : num;
  }

  // Altrimenti ritorna il default
  return defaultValue;
};

/**
 * Converte un valore in prezzo (numero positivo)
 * @param {*} value - Valore da convertire
 * @param {number} defaultValue - Valore di default
 * @returns {number}
 */
export const toPrice = (value, defaultValue = 0) => {
  const num = toNumber(value, defaultValue);
  return num < 0 ? 0 : num;
};

/**
 * Converte un valore in intero
 * @param {*} value - Valore da convertire
 * @param {number} defaultValue - Valore di default
 * @returns {number}
 */
export const toInt = (value, defaultValue = 0) => {
  const num = toNumber(value, defaultValue);
  return Math.floor(num);
};

/**
 * Formatta un valore come valuta EUR
 * @param {*} value - Valore da formattare
 * @returns {string}
 */
export const toCurrency = (value) => {
  const num = toPrice(value, 0);
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Converte un array di valori in numeri
 * @param {Array} values - Array di valori
 * @param {number} defaultValue - Valore di default per elementi non convertibili
 * @returns {Array<number>}
 */
export const toNumberArray = (values, defaultValue = 0) => {
  if (!Array.isArray(values)) return [];
  return values.map(v => toNumber(v, defaultValue));
};

/**
 * Somma sicura di valori che potrebbero essere stringhe
 * @param {...*} values - Valori da sommare
 * @returns {number}
 */
export const safeSum = (...values) => {
  return values.reduce((sum, val) => sum + toNumber(val, 0), 0);
};
