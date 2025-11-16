import { useMemo } from 'react';
import { useCSVQuery } from './useCSVQuery';

/**
 * Custom hook for loading hotels with advanced filtering
 *
 * Eliminates duplicated filter logic across HotelPanel, HotelSelector, and HotelSelectionPage
 * Provides automatic caching and deduplication via React Query
 *
 * @param {Object} filters - Filter options
 * @param {string} filters.destinazione - Filter by destination
 * @param {string} filters.budget - Filter by budget (LOW/MEDIUM/HIGH or ALL)
 * @param {string|number} filters.stelle - Filter by stars (2-5 or ALL)
 * @param {string} filters.zona - Filter by zone
 * @param {Object} filters.servizi - Service filters { colazione, wifi, piscina }
 * @returns {Object} { hotels, filteredHotels, isLoading, error }
 */
export function useHotels(filters = {}) {
  const {
    destinazione,
    budget = 'ALL',
    stelle = 'ALL',
    zona = 'ALL',
    servizi = {},
  } = filters;

  // Load hotels with caching
  const { data: hotels = [], isLoading, error } = useCSVQuery('hotel.csv');

  // Apply all filters with memoization
  const filteredHotels = useMemo(() => {
    let filtered = [...hotels];

    // Filter by destination
    if (destinazione) {
      filtered = filtered.filter(
        (h) => h.DESTINAZIONE?.toLowerCase() === destinazione?.toLowerCase()
      );
    }

    // Filter by budget
    if (budget !== 'ALL') {
      filtered = filtered.filter((h) => h.BUDGET === budget);
    }

    // Filter by stars
    if (stelle !== 'ALL') {
      filtered = filtered.filter(
        (h) => parseInt(h.STELLE) === parseInt(stelle)
      );
    }

    // Filter by zone
    if (zona !== 'ALL') {
      filtered = filtered.filter((h) => h.ZONA === zona);
    }

    // Filter by services
    if (servizi.colazione) {
      filtered = filtered.filter((h) => h.COLAZIONE_INCLUSA === 'si');
    }
    if (servizi.wifi) {
      filtered = filtered.filter((h) => h.WIFI === 'si');
    }
    if (servizi.piscina) {
      filtered = filtered.filter((h) => h.PISCINA === 'si');
    }

    return filtered;
  }, [hotels, destinazione, budget, stelle, zona, servizi]);

  return {
    hotels,
    filteredHotels,
    isLoading,
    error,
    isError: !!error,
  };
}
