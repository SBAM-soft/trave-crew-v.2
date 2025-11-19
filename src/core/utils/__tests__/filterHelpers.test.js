import { describe, it, expect } from 'vitest';
import {
  filterByField,
  filterByTextSearch,
  filterByRange,
  sortByField,
  applyFilters
} from '../filterHelpers';

describe('filterHelpers', () => {
  const sampleData = [
    { name: 'Alice', age: 25, city: 'Rome' },
    { name: 'Bob', age: 30, city: 'Milan' },
    { name: 'Charlie', age: 35, city: 'rome' },
  ];

  describe('filterByField', () => {
    it('should filter case-insensitive by default', () => {
      const result = filterByField(sampleData, 'city', 'rome');
      expect(result).toHaveLength(2);
    });

    it('should return all if value is "all"', () => {
      const result = filterByField(sampleData, 'city', 'all');
      expect(result).toHaveLength(3);
    });

    it('should return all if value is "ALL"', () => {
      const result = filterByField(sampleData, 'city', 'ALL');
      expect(result).toHaveLength(3);
    });

    it('should return all if value is null', () => {
      const result = filterByField(sampleData, 'city', null);
      expect(result).toHaveLength(3);
    });

    it('should filter case-sensitive when option is set', () => {
      const result = filterByField(sampleData, 'city', 'rome', { caseInsensitive: false });
      expect(result).toHaveLength(1);
      expect(result[0].city).toBe('rome');
    });

    it('should trim values when option is set', () => {
      const dataWithSpaces = [
        { name: 'Alice  ' },
        { name: 'Bob' }
      ];
      const result = filterByField(dataWithSpaces, 'name', 'Alice');
      expect(result).toHaveLength(1);
    });

    it('should handle exact matches', () => {
      const result = filterByField(sampleData, 'name', 'Alice');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });

    it('should return empty array when no matches', () => {
      const result = filterByField(sampleData, 'city', 'Paris');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByTextSearch', () => {
    it('should search across multiple fields', () => {
      const result = filterByTextSearch(sampleData, 'alice', ['name', 'city']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });

    it('should return all if search is empty', () => {
      const result = filterByTextSearch(sampleData, '', ['name']);
      expect(result).toHaveLength(3);
    });

    it('should return all if search is whitespace only', () => {
      const result = filterByTextSearch(sampleData, '   ', ['name']);
      expect(result).toHaveLength(3);
    });

    it('should search case-insensitively', () => {
      const result = filterByTextSearch(sampleData, 'ALICE', ['name']);
      expect(result).toHaveLength(1);
    });

    it('should search with partial matches', () => {
      const result = filterByTextSearch(sampleData, 'li', ['name']);
      expect(result).toHaveLength(2); // Alice and Charlie
    });

    it('should handle missing field gracefully', () => {
      const result = filterByTextSearch(sampleData, 'test', ['nonExistentField']);
      expect(result).toHaveLength(0);
    });

    it('should trim search text', () => {
      const result = filterByTextSearch(sampleData, '  alice  ', ['name']);
      expect(result).toHaveLength(1);
    });
  });

  describe('filterByRange', () => {
    it('should filter by min/max range', () => {
      const result = filterByRange(sampleData, 'age', 26, 32);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });

    it('should work with null min', () => {
      const result = filterByRange(sampleData, 'age', null, 30);
      expect(result).toHaveLength(2); // Alice and Bob
    });

    it('should work with null max', () => {
      const result = filterByRange(sampleData, 'age', 30, null);
      expect(result).toHaveLength(2); // Bob and Charlie
    });

    it('should include boundaries', () => {
      const result = filterByRange(sampleData, 'age', 25, 35);
      expect(result).toHaveLength(3); // All
    });

    it('should filter out NaN values', () => {
      const dataWithInvalid = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 'invalid' }
      ];
      const result = filterByRange(dataWithInvalid, 'age', 20, 30);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice');
    });

    it('should handle string numbers', () => {
      const dataWithStrings = [
        { name: 'Alice', age: '25' },
        { name: 'Bob', age: '30' }
      ];
      const result = filterByRange(dataWithStrings, 'age', 26, 32);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });
  });

  describe('sortByField', () => {
    it('should sort ascending by default', () => {
      const result = sortByField(sampleData, 'age', 'asc');
      expect(result[0].age).toBe(25);
      expect(result[2].age).toBe(35);
    });

    it('should sort descending', () => {
      const result = sortByField(sampleData, 'age', 'desc');
      expect(result[0].age).toBe(35);
      expect(result[2].age).toBe(25);
    });

    it('should sort strings ascending', () => {
      const result = sortByField(sampleData, 'name', 'asc');
      expect(result[0].name).toBe('Alice');
      expect(result[2].name).toBe('Charlie');
    });

    it('should sort strings descending', () => {
      const result = sortByField(sampleData, 'name', 'desc');
      expect(result[0].name).toBe('Charlie');
      expect(result[2].name).toBe('Alice');
    });

    it('should not mutate original array', () => {
      const original = [...sampleData];
      sortByField(sampleData, 'age', 'desc');
      expect(sampleData).toEqual(original);
    });

    it('should handle null/undefined values', () => {
      const dataWithNulls = [
        { name: 'Alice', value: 10 },
        { name: 'Bob', value: null },
        { name: 'Charlie', value: 5 }
      ];
      const result = sortByField(dataWithNulls, 'value', 'asc');
      expect(result).toHaveLength(3);
    });
  });

  describe('applyFilters', () => {
    it('should apply multiple filters in sequence', () => {
      const filters = [
        (items) => filterByRange(items, 'age', 25, 35),
        (items) => filterByTextSearch(items, 'o', ['name'])
      ];

      const result = applyFilters(sampleData, filters);
      expect(result).toHaveLength(1); // Only Bob matches both filters
      expect(result[0].name).toBe('Bob');
    });

    it('should handle empty filters array', () => {
      const result = applyFilters(sampleData, []);
      expect(result).toEqual(sampleData);
    });

    it('should handle single filter', () => {
      const filters = [
        (items) => filterByField(items, 'city', 'Rome')
      ];

      const result = applyFilters(sampleData, filters);
      expect(result).toHaveLength(2);
    });

    it('should apply filters in order', () => {
      const filters = [
        (items) => items.filter(i => i.age >= 30),
        (items) => items.slice(0, 1)
      ];

      const result = applyFilters(sampleData, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });
  });
});
