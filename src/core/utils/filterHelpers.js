/**
 * Utilities centralizzate per filtering e sorting
 * Elimina duplicazione tra useHotels, Explore, e altri componenti
 */

/**
 * Filtra array per campo specifico con opzioni configurabili
 * @param {Array} items - Array da filtrare
 * @param {string} fieldName - Nome campo
 * @param {any} value - Valore da matchare
 * @param {Object} options - Opzioni { caseInsensitive, trim }
 * @returns {Array} Array filtrato
 */
export function filterByField(items, fieldName, value, options = {}) {
  if (!value || value === 'all' || value === 'ALL') return items;

  const {
    caseInsensitive = true,
    trim = true
  } = options;

  return items.filter(item => {
    let fieldValue = item[fieldName];
    let compareValue = value;

    if (caseInsensitive && typeof fieldValue === 'string') {
      fieldValue = fieldValue.toLowerCase();
      compareValue = String(compareValue).toLowerCase();
    }

    if (trim && typeof fieldValue === 'string') {
      fieldValue = fieldValue.trim();
      compareValue = String(compareValue).trim();
    }

    return fieldValue === compareValue;
  });
}

/**
 * Filtra per ricerca testuale su multipli campi
 * @param {Array} items - Array da filtrare
 * @param {string} searchText - Testo da cercare
 * @param {string[]} searchFields - Campi su cui cercare
 * @returns {Array} Array filtrato
 */
export function filterByTextSearch(items, searchText, searchFields) {
  if (!searchText || searchText.trim() === '') return items;

  const lowerSearch = searchText.toLowerCase().trim();

  return items.filter(item =>
    searchFields.some(field => {
      const fieldValue = item[field];
      return fieldValue && String(fieldValue).toLowerCase().includes(lowerSearch);
    })
  );
}

/**
 * Filtra per range numerico
 * @param {Array} items - Array da filtrare
 * @param {string} fieldName - Nome campo numerico
 * @param {number|null} min - Valore minimo (null = no limit)
 * @param {number|null} max - Valore massimo (null = no limit)
 * @returns {Array} Array filtrato
 */
export function filterByRange(items, fieldName, min, max) {
  return items.filter(item => {
    const value = parseFloat(item[fieldName]);
    if (isNaN(value)) return false;
    if (min !== null && value < min) return false;
    if (max !== null && value > max) return false;
    return true;
  });
}

/**
 * Sorting generico per campo
 * @param {Array} items - Array da ordinare
 * @param {string} fieldName - Campo su cui ordinare
 * @param {string} direction - 'asc' | 'desc'
 * @returns {Array} Nuovo array ordinato
 */
export function sortByField(items, fieldName, direction = 'asc') {
  return [...items].sort((a, b) => {
    const aVal = a[fieldName];
    const bVal = b[fieldName];

    // Numeri
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Stringhe
    const aStr = String(aVal || '');
    const bStr = String(bVal || '');
    return direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
}

/**
 * Pipeline di filtri applicati in sequenza
 * @param {Array} items - Array iniziale
 * @param {Function[]} filters - Array di funzioni filter
 * @returns {Array} Array filtrato
 */
export function applyFilters(items, filters) {
  return filters.reduce((acc, filterFn) => filterFn(acc), items);
}
