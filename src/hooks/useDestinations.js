import { useEntityQuery } from './useEntityQuery';

/**
 * Custom hook for loading destinations with caching
 *
 * @returns {Object} { destinations, isLoading, error }
 */
export function useDestinations() {
  const { data: destinations = [], isLoading, error } = useEntityQuery('destinazioni', true);

  return {
    destinations,
    isLoading,
    error,
    isError: !!error,
  };
}
