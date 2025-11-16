import { useQuery } from '@tanstack/react-query';
import { loadCSV } from '../core/utils/dataLoader';

/**
 * Custom hook for loading and caching CSV data with React Query
 *
 * Benefits:
 * - Automatic caching (shared across components)
 * - Deduplication (multiple calls = single request)
 * - Automatic retry on failure
 * - Loading and error states
 *
 * @param {string} csvFileName - Name of CSV file (e.g., 'hotel.csv')
 * @param {Object} options - Additional React Query options
 * @returns {Object} { data, isLoading, error, isError }
 */
export function useCSVQuery(csvFileName, options = {}) {
  return useQuery({
    queryKey: ['csv', csvFileName],
    queryFn: () => loadCSV(csvFileName),
    ...options,
  });
}
