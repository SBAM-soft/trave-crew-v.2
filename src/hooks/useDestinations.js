import { useCSVQuery } from './useCSVQuery';

/**
 * Custom hook for loading destinations with caching
 *
 * @returns {Object} { destinations, isLoading, error }
 */
export function useDestinations() {
  const { data: destinations = [], isLoading, error } = useCSVQuery('destinazioni.csv');

  return {
    destinations,
    isLoading,
    error,
    isError: !!error,
  };
}
