import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService, STORAGE_KEYS } from '../storageService';

describe('storageService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    localStorage.getItem.mockReset();
    localStorage.setItem.mockReset();
    localStorage.removeItem.mockReset();
    localStorage.clear.mockReset();

    // Re-implement default behaviors
    let store = {};
    localStorage.getItem.mockImplementation((key) => store[key] || null);
    localStorage.setItem.mockImplementation((key, value) => {
      store[key] = String(value);
    });
    localStorage.removeItem.mockImplementation((key) => {
      delete store[key];
    });
    localStorage.clear.mockImplementation(() => {
      store = {};
    });
  });

  describe('get', () => {
    it('should get and parse JSON from localStorage', () => {
      const testData = { name: 'Test' };
      localStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = storageService.get('test_key');

      expect(localStorage.getItem).toHaveBeenCalledWith('test_key');
      expect(result).toEqual(testData);
    });

    it('should return null if key does not exist', () => {
      localStorage.getItem.mockReturnValue(null);

      const result = storageService.get('nonexistent_key');

      expect(result).toBeNull();
    });

    it('should return null and log error on parse failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.getItem.mockReturnValue('invalid json');

      const result = storageService.get('invalid_key');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('set', () => {
    it('should stringify and set JSON to localStorage', () => {
      const testData = { name: 'Test' };
      const result = storageService.set('test_key', testData);

      expect(localStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(testData));
      expect(result).toBe(true);
    });

    it('should return false and log error on set failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = storageService.set('test_key', { data: 'test' });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('remove', () => {
    it('should remove item from localStorage', () => {
      const result = storageService.remove('test_key');

      expect(localStorage.removeItem).toHaveBeenCalledWith('test_key');
      expect(result).toBe(true);
    });

    it('should return false and log error on remove failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = storageService.remove('test_key');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('should clear all localStorage', () => {
      const result = storageService.clear();

      expect(localStorage.clear).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false and log error on clear failure', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.clear.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = storageService.clear();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getUser / setUser / clearUser', () => {
    it('should get user from localStorage', () => {
      const userData = { id: 1, name: 'John' };
      localStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = storageService.getUser();

      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.USER);
      expect(result).toEqual(userData);
    });

    it('should set user to localStorage', () => {
      const userData = { id: 1, name: 'John' };
      storageService.setUser(userData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER,
        JSON.stringify(userData)
      );
    });

    it('should clear user from localStorage', () => {
      storageService.clearUser();

      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER);
    });
  });

  describe('getProfile / setProfile / clearProfile', () => {
    it('should get profile for specific user', () => {
      const profileData = { userId: '123', preferences: {} };
      localStorage.getItem.mockReturnValue(JSON.stringify(profileData));

      const result = storageService.getProfile('123');

      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.PROFILE('123'));
      expect(result).toEqual(profileData);
    });

    it('should set profile for specific user', () => {
      const profileData = { userId: '123', preferences: {} };
      storageService.setProfile('123', profileData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PROFILE('123'),
        JSON.stringify(profileData)
      );
    });

    it('should clear profile for specific user', () => {
      storageService.clearProfile('123');

      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.PROFILE('123'));
    });
  });

  describe('getAllTrips / setAllTrips', () => {
    it('should get all trips', () => {
      const tripsData = { upcoming: [], past: [], saved: [] };
      localStorage.getItem.mockReturnValue(JSON.stringify(tripsData));

      const result = storageService.getAllTrips();

      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.TRIPS);
      expect(result).toEqual(tripsData);
    });

    it('should return default structure if no trips exist', () => {
      localStorage.getItem.mockReturnValue(null);

      const result = storageService.getAllTrips();

      expect(result).toEqual({ upcoming: [], past: [], saved: [] });
    });

    it('should set all trips', () => {
      const tripsData = { upcoming: [{ id: 1 }], past: [], saved: [] };
      storageService.setAllTrips(tripsData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TRIPS,
        JSON.stringify(tripsData)
      );
    });
  });

  describe('getExploreTrips / setExploreTrips', () => {
    it('should get explore trips', () => {
      const exploreTrips = [{ id: 1, name: 'Trip 1' }];
      localStorage.getItem.mockReturnValue(JSON.stringify(exploreTrips));

      const result = storageService.getExploreTrips();

      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.EXPLORE_TRIPS);
      expect(result).toEqual(exploreTrips);
    });

    it('should return empty array if no explore trips exist', () => {
      localStorage.getItem.mockReturnValue(null);

      const result = storageService.getExploreTrips();

      expect(result).toEqual([]);
    });

    it('should set explore trips', () => {
      const exploreTrips = [{ id: 1, name: 'Trip 1' }];
      storageService.setExploreTrips(exploreTrips);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EXPLORE_TRIPS,
        JSON.stringify(exploreTrips)
      );
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have correct key values', () => {
      expect(STORAGE_KEYS.USER).toBe('travel_crew_user');
      expect(STORAGE_KEYS.TRIPS).toBe('trave_crew_trips');
      expect(STORAGE_KEYS.EXPLORE_TRIPS).toBe('trave_crew_explore_trips');
    });

    it('should generate profile key with userId', () => {
      expect(STORAGE_KEYS.PROFILE('123')).toBe('travel_crew_profile_123');
    });
  });
});
