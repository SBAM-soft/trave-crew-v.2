import { useMemo } from 'react';
import { useEntityQuery } from './useEntityQuery';

/**
 * Custom hook for loading experiences with optional filtering
 *
 * @param {Object} filters - Filter options
 * @param {Array<string>} filters.experienceIds - Filter by specific experience IDs
 * @returns {Object} { experiences, filteredExperiences, isLoading, error }
 */
export function useExperiences(filters = {}) {
  const { experienceIds } = filters;

  // Load experiences with caching
  const { data: experiences = [], isLoading, error } = useEntityQuery('esperienze', true);

  // Filter experiences if IDs provided
  const filteredExperiences = useMemo(() => {
    if (!experienceIds || experienceIds.length === 0) {
      return experiences;
    }

    return experiences.filter((exp) =>
      experienceIds.includes(exp.CODICE || exp.codice)
    );
  }, [experiences, experienceIds]);

  return {
    experiences,
    filteredExperiences,
    isLoading,
    error,
    isError: !!error,
  };
}
