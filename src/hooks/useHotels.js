import { useMemo } from 'react';
import { useEntityQuery } from './useEntityQuery';
import { filterByField } from '../core/utils/filterHelpers';

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
  const { data: hotels = [], isLoading, error } = useEntityQuery('hotel', true);

  // Apply all filters with memoization
  const filteredHotels = useMemo(() => {
    let filtered = hotels;

    // Use centralized filter helper
    filtered = filterByField(filtered, 'DESTINAZIONE', destinazione, {
      caseInsensitive: true,
      trim: true
    });

    filtered = filterByField(filtered, 'BUDGET', budget);
    filtered = filterByField(filtered, 'ZONA', zona);

    // Filter by stars (requires custom logic for number parsing)
    if (stelle !== 'ALL') {
      filtered = filtered.filter(
        (h) => parseInt(h.STELLE) === parseInt(stelle)
      );
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
