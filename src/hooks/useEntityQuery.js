import { useQuery } from '@tanstack/react-query';
import { loadEntityData } from '../core/utils/dataLoader';
import { CACHE_CONFIG } from '../core/constants';

/**
 * Custom hook for loading and caching entity data (tech + copy merged) with React Query
 *
 * Benefits:
 * - Automatic caching (shared across components)
 * - Deduplication (multiple calls = single request)
 * - Automatic retry on failure
 * - Loading and error states
 * - Loads _tech.csv + _copy.csv and merges them
 *
 * @param {string} entityName - Name of entity (e.g., 'destinazioni', 'zone')
 * @param {boolean} hasCopy - Whether entity has _copy.csv file (default: true)
 * @param {Object} options - Additional React Query options
 * @returns {Object} { data, isLoading, error, isError }
 */
export function useEntityQuery(entityName, hasCopy = true, options = {}) {
  return useQuery({
    queryKey: ['entity', entityName, hasCopy],
    queryFn: () => loadEntityData(entityName, hasCopy),
    staleTime: CACHE_CONFIG.STALE_TIME,
    cacheTime: CACHE_CONFIG.CACHE_TIME,
    retry: CACHE_CONFIG.RETRY_COUNT,
    ...options,
  });
}
