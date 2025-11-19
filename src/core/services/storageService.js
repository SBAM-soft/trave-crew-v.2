/**
 * Abstraction layer per localStorage
 * Facilita migration futura a IndexedDB o backend API
 */

const STORAGE_KEYS = {
  USER: 'travel_crew_user',
  TRIPS: 'trave_crew_trips',
  EXPLORE_TRIPS: 'trave_crew_explore_trips',
  PROFILE: (userId) => `travel_crew_profile_${userId}`,
};

class StorageService {
  /**
   * Get parsed JSON from localStorage
   */
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set JSON to localStorage
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove from localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  // ===== USER =====
  getUser() {
    return this.get(STORAGE_KEYS.USER);
  }

  setUser(user) {
    return this.set(STORAGE_KEYS.USER, user);
  }

  clearUser() {
    return this.remove(STORAGE_KEYS.USER);
  }

  // ===== PROFILE =====
  getProfile(userId) {
    return this.get(STORAGE_KEYS.PROFILE(userId));
  }

  setProfile(userId, profile) {
    return this.set(STORAGE_KEYS.PROFILE(userId), profile);
  }

  clearProfile(userId) {
    return this.remove(STORAGE_KEYS.PROFILE(userId));
  }

  // ===== TRIPS =====
  getAllTrips() {
    const trips = this.get(STORAGE_KEYS.TRIPS);
    return trips || { upcoming: [], past: [], saved: [] };
  }

  setAllTrips(trips) {
    return this.set(STORAGE_KEYS.TRIPS, trips);
  }

  // ===== EXPLORE TRIPS =====
  getExploreTrips() {
    return this.get(STORAGE_KEYS.EXPLORE_TRIPS) || [];
  }

  setExploreTrips(trips) {
    return this.set(STORAGE_KEYS.EXPLORE_TRIPS, trips);
  }
}

// Singleton instance
export const storageService = new StorageService();

// Export keys per uso diretto se necessario
export { STORAGE_KEYS };
