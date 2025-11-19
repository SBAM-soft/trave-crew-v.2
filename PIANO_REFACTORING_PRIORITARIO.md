# 🚀 PIANO DI REFACTORING PRIORITARIO - Travel Crew v.2

**Data creazione:** 2025-11-19
**Branch:** `claude/review-app-consistency-01G7kPVB8vRoGWWta1ya66fa`
**Durata stimata:** 2-3 settimane (team 2 dev)

---

## 📋 INDICE

1. [Fase 1: Quick Wins (3-4 giorni)](#fase-1-quick-wins)
2. [Fase 2: Refactoring Core (5-7 giorni)](#fase-2-refactoring-core)
3. [Fase 3: Testing & Validation (2-3 giorni)](#fase-3-testing--validation)
4. [Checklist Finale](#checklist-finale)

---

## FASE 1: QUICK WINS (3-4 giorni)

### ✅ Task 1.1: Centralizzare Logica Filtri
**Priorità:** 🔴 ALTA
**Effort:** 1 giorno
**File interessati:** `useHotels.js`, `Explore.jsx`, multiple

#### Step:

1. **Creare file helper centralizzato**

```bash
# Path: src/core/utils/filterHelpers.js
```

```javascript
/**
 * Utilities centralizzate per filtering e sorting
 * Elimina duplicazione tra useHotels, Explore, e altri componenti
 */

/**
 * Filtra array per campo specifico con opzioni configurabili
 * @param {Array} items - Array da filtrare
 * @param {string} fieldName - Nome campo
 * @param {any} value - Valore da matchare
 * @param {Object} options - Opzioni { caseInsensitive, trim }
 * @returns {Array} Array filtrato
 */
export function filterByField(items, fieldName, value, options = {}) {
  if (!value || value === 'all' || value === 'ALL') return items;

  const {
    caseInsensitive = true,
    trim = true
  } = options;

  return items.filter(item => {
    let fieldValue = item[fieldName];
    let compareValue = value;

    if (caseInsensitive && typeof fieldValue === 'string') {
      fieldValue = fieldValue.toLowerCase();
      compareValue = String(compareValue).toLowerCase();
    }

    if (trim && typeof fieldValue === 'string') {
      fieldValue = fieldValue.trim();
      compareValue = String(compareValue).trim();
    }

    return fieldValue === compareValue;
  });
}

/**
 * Filtra per ricerca testuale su multipli campi
 * @param {Array} items - Array da filtrare
 * @param {string} searchText - Testo da cercare
 * @param {string[]} searchFields - Campi su cui cercare
 * @returns {Array} Array filtrato
 */
export function filterByTextSearch(items, searchText, searchFields) {
  if (!searchText || searchText.trim() === '') return items;

  const lowerSearch = searchText.toLowerCase().trim();

  return items.filter(item =>
    searchFields.some(field => {
      const fieldValue = item[field];
      return fieldValue && String(fieldValue).toLowerCase().includes(lowerSearch);
    })
  );
}

/**
 * Filtra per range numerico
 * @param {Array} items - Array da filtrare
 * @param {string} fieldName - Nome campo numerico
 * @param {number|null} min - Valore minimo (null = no limit)
 * @param {number|null} max - Valore massimo (null = no limit)
 * @returns {Array} Array filtrato
 */
export function filterByRange(items, fieldName, min, max) {
  return items.filter(item => {
    const value = parseFloat(item[fieldName]);
    if (isNaN(value)) return false;
    if (min !== null && value < min) return false;
    if (max !== null && value > max) return false;
    return true;
  });
}

/**
 * Sorting generico per campo
 * @param {Array} items - Array da ordinare
 * @param {string} fieldName - Campo su cui ordinare
 * @param {string} direction - 'asc' | 'desc'
 * @returns {Array} Nuovo array ordinato
 */
export function sortByField(items, fieldName, direction = 'asc') {
  return [...items].sort((a, b) => {
    const aVal = a[fieldName];
    const bVal = b[fieldName];

    // Numeri
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Stringhe
    const aStr = String(aVal || '');
    const bStr = String(bVal || '');
    return direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
}

/**
 * Pipeline di filtri applicati in sequenza
 * @param {Array} items - Array iniziale
 * @param {Function[]} filters - Array di funzioni filter
 * @returns {Array} Array filtrato
 */
export function applyFilters(items, filters) {
  return filters.reduce((acc, filterFn) => filterFn(acc), items);
}
```

2. **Refactor useHotels.js**

```javascript
// Path: src/hooks/useHotels.js
import { useMemo } from 'react';
import { useCSVQuery } from './useCSVQuery';
import { filterByField } from '../core/utils/filterHelpers';

export function useHotels(filters = {}) {
  const {
    destinazione,
    budget = 'ALL',
    stelle = 'ALL',
    zona = 'ALL',
    servizi = {},
  } = filters;

  const { data: hotels = [], isLoading, error } = useCSVQuery('hotel.csv');

  const filteredHotels = useMemo(() => {
    let filtered = hotels;

    // Usa helper centralizzato
    filtered = filterByField(filtered, 'DESTINAZIONE', destinazione, {
      caseInsensitive: true,
      trim: true
    });

    filtered = filterByField(filtered, 'BUDGET', budget);
    filtered = filterByField(filtered, 'ZONA', zona);

    if (stelle !== 'ALL') {
      filtered = filtered.filter(h => parseInt(h.STELLE) === parseInt(stelle));
    }

    // Filtri servizi
    if (servizi.colazione) {
      filtered = filtered.filter(h => h.COLAZIONE_INCLUSA === 'si');
    }
    if (servizi.wifi) {
      filtered = filtered.filter(h => h.WIFI === 'si');
    }
    if (servizi.piscina) {
      filtered = filtered.filter(h => h.PISCINA === 'si');
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
```

3. **Refactor Explore.jsx**

```javascript
// Path: src/features/explore/Explore.jsx
import { filterByField, filterByTextSearch, sortByField } from '../../core/utils/filterHelpers';

// Nel useEffect dei filtri:
useEffect(() => {
  let risultati = viaggi;

  // Usa helper centralizzato
  risultati = filterByTextSearch(risultati, searchText, [
    'TITOLO',
    'DESCRIZIONE',
    'DESTINAZIONE'
  ]);

  risultati = filterByField(risultati, 'DESTINAZIONE', filters.destinazione);
  risultati = filterByField(risultati, 'BUDGET_CATEGORIA', filters.budget);
  risultati = filterByField(risultati, 'GENERE', filters.genere);

  // Filtro durata custom
  if (filters.durata !== 'all') {
    risultati = risultati.filter(v => {
      const giorni = v.DURATA_GIORNI;
      if (filters.durata === 'short') return giorni >= 3 && giorni <= 5;
      if (filters.durata === 'medium') return giorni >= 6 && giorni <= 9;
      if (filters.durata === 'long') return giorni >= 10;
      return true;
    });
  }

  if (filters.stato === 'aperto') {
    risultati = risultati.filter(v => v.STATO === 'aperto');
  }

  // Sorting con helper
  if (sortBy === 'price-low') {
    risultati = sortByField(risultati, 'COSTO_TOTALE_PP', 'asc');
  } else if (sortBy === 'price-high') {
    risultati = sortByField(risultati, 'COSTO_TOTALE_PP', 'desc');
  } else if (sortBy === 'duration') {
    risultati = sortByField(risultati, 'DURATA_GIORNI', 'desc');
  }

  setViaggiFiltrati(risultati);
}, [searchText, filters, viaggi, sortBy]);
```

**Test:**
- ✅ Verifica che filtri hotel funzionino come prima
- ✅ Verifica filtri in Explore
- ✅ Non ci devono essere regressioni

---

### ✅ Task 1.2: Storage Abstraction Layer
**Priorità:** 🔴 ALTA
**Effort:** 1 giorno

#### Step:

1. **Creare StorageService**

```bash
# Path: src/core/services/storageService.js
```

```javascript
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
```

2. **Refactor AuthContext.jsx**

```javascript
// Path: src/contexts/AuthContext.jsx
import { storageService } from '../core/services/storageService';

// Sostituisci tutti i localStorage.getItem/setItem con:
const login = async (email, password) => {
  // ...
  const userData = { /* ... */ };
  storageService.setUser(userData); // ✅ Invece di localStorage.setItem
  setUser(userData);
  return { success: true, user: userData };
};

const logout = () => {
  storageService.clearUser(); // ✅ Invece di localStorage.removeItem
  setUser(null);
};

// Nel useEffect iniziale:
useEffect(() => {
  const storedUser = storageService.getUser(); // ✅
  if (storedUser) {
    setUser(storedUser);
  }
  setLoading(false);
}, []);
```

3. **Refactor UserContext.jsx**

```javascript
// Path: src/contexts/UserContext.jsx
import { storageService } from '../core/services/storageService';

const loadUserProfile = (userId) => {
  const profile = storageService.getProfile(userId); // ✅
  if (profile) {
    setUserProfile(profile);
  } else {
    // Crea profilo default
    const defaultProfile = createDefaultProfile(userId);
    storageService.setProfile(userId, defaultProfile); // ✅
    setUserProfile(defaultProfile);
  }
};

const updateUserProfile = (updates) => {
  const updated = { ...userProfile, ...updates };
  setUserProfile(updated);
  storageService.setProfile(userProfile.userId, updated); // ✅
};
```

4. **Refactor tripStorage.js**

```javascript
// Path: src/core/utils/tripStorage.js
import { storageService } from '../services/storageService';

export const getAllTrips = () => {
  return storageService.getAllTrips(); // ✅
};

export const saveTrip = (tripData, category = 'saved') => {
  const trips = getAllTrips();
  const newTrip = {
    id: crypto.randomUUID(),
    ...tripData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  trips[category].push(newTrip);
  storageService.setAllTrips(trips); // ✅
  return newTrip;
};

// ... applica a tutte le funzioni
```

5. **Refactor Explore.jsx**

```javascript
// Path: src/features/explore/Explore.jsx
import { storageService } from '../../core/services/storageService';

useEffect(() => {
  const fetchViaggi = async () => {
    try {
      setLoading(true);
      const csvData = await loadCSV('/data/viaggi.csv');
      const userTrips = storageService.getExploreTrips(); // ✅
      const allTrips = [...csvData, ...userTrips];
      setViaggi(allTrips);
      setViaggiFiltrati(allTrips);
    } catch (err) {
      // ...
    }
  };
  fetchViaggi();
}, []);
```

**Test:**
- ✅ Login/Logout funzionano
- ✅ Profilo si salva/carica
- ✅ Viaggi si salvano/caricano
- ✅ Explore carica viaggi

---

### ✅ Task 1.3: Costanti Centralizzate
**Priorità:** 🟡 MEDIA
**Effort:** 0.5 giorni

#### Step:

1. **Creare file costanti**

```bash
# Path: src/core/constants/index.js
```

```javascript
/**
 * Costanti centralizzate dell'applicazione
 */

// Cache & Query
export const CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000,    // 5 minuti
  CACHE_TIME: 10 * 60 * 1000,   // 10 minuti
  RETRY_COUNT: 2,
};

// Animazioni & Timing
export const ANIMATION = {
  TYPING_DELAY_MIN: 300,         // ms
  TYPING_DELAY_MAX: 500,         // ms
  TOAST_DURATION: 3000,          // ms
  ITINERARY_CREATION_MIN: 3000,  // ms
};

// Z-Index layers
export const Z_INDEX = {
  BASE: 900,
  PANEL: 1000,
  MODAL: 1100,
  TOAST: 2000,
  TOOLTIP: 3000,
};

// CSV Field Names
export const CSV_FIELDS = {
  PACCHETTI: {
    CODICE: 'CODICE',
    NOME: 'NOME_PACCHETTO',
    ZONA: 'ZONA',
    ZONA_COLLEGATA: 'ZONA_COLLEGATA',
    DESTINAZIONE: 'DESTINAZIONE',
    EXPERIENCES: {
      DAY_2: 'DAY2_ESPERIENZA_STD',
      DAY_3: 'DAY3_ESPERIENZA_STD',
      DAY_4: 'DAY4_ESPERIENZA_STD',
      DAY_5: 'DAY5_ESPERIENZA_STD',
      DAY_6: 'DAY6_ESPERIENZA_STD',
      DAY_7: 'DAY7_ESPERIENZA_STD',
      DAY_8: 'DAY8_ESPERIENZA_STD',
      DAY_9: 'DAY9_ESPERIENZA_STD',
      DAY_10: 'DAY10_ESPERIENZA_STD',
    }
  },
  HOTEL: {
    CODICE: 'CODICE',
    NOME: 'NOME',
    STELLE: 'STELLE',
    BUDGET: 'BUDGET',
    ZONA: 'ZONA',
    DESTINAZIONE: 'DESTINAZIONE',
    COLAZIONE: 'COLAZIONE_INCLUSA',
    WIFI: 'WIFI',
    PISCINA: 'PISCINA',
  },
  ESPERIENZE: {
    CODICE: 'CODICE',
    NOME: 'ESPERIENZE',
    DESCRIZIONE: 'DESCRIZIONE',
    PREZZO: 'PRX_PAX',
    SLOT: 'SLOT',
    DIFFICOLTA: 'DIFFICOLTA',
  },
  ZONE: {
    CODICE: 'CODICE',
    ZONA: 'ZONA',
    DESTINAZIONE: 'DESTINAZIONE',
  },
  DESTINAZIONI: {
    CODICE: 'CODICE',
    NOME: 'NOME',
  },
};

// Trip Status
export const TRIP_STATUS = {
  SAVED: 'saved',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
};

// Budget Tiers
export const BUDGET_TIERS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

// Hotel Tier Prices
export const HOTEL_TIER_PRICES = {
  LOW: 40,
  MEDIUM: 75,
  HIGH: 150,
  LUXURY: 150,
};
```

2. **Applicare costanti nei file**

```javascript
// src/hooks/useCSVQuery.js
import { CACHE_CONFIG } from '../core/constants';

export function useCSVQuery(filename) {
  return useQuery({
    queryKey: ['csv', filename],
    queryFn: () => loadCSV(filename),
    staleTime: CACHE_CONFIG.STALE_TIME, // ✅
    cacheTime: CACHE_CONFIG.CACHE_TIME, // ✅
    retry: CACHE_CONFIG.RETRY_COUNT,    // ✅
  });
}

// src/features/trip-editor-chat/store/useTripEditorChatStore.js
import { ANIMATION, HOTEL_TIER_PRICES } from '../../../core/constants';

addBotMessage: (content, type = 'bot', data = null) => {
  set({ isTyping: true });
  setTimeout(() => {
    get().addMessage({ type, content, data, sender: 'bot' });
    set({ isTyping: false });
  }, ANIMATION.TYPING_DELAY_MIN + Math.random() * (ANIMATION.TYPING_DELAY_MAX - ANIMATION.TYPING_DELAY_MIN)); // ✅
},

function getTierPriceFromBudget(tier) {
  return HOTEL_TIER_PRICES[tier?.toUpperCase()] || HOTEL_TIER_PRICES.MEDIUM; // ✅
}

// src/store/usePanelStore.js
import { Z_INDEX } from '../core/constants';

const usePanelStore = create((set, get) => ({
  panelStack: [],
  baseZIndex: Z_INDEX.PANEL, // ✅
  // ...
}));

// src/features/trip-editor/TripEditor.jsx
import { CSV_FIELDS } from '../../core/constants';

// Sostituisci hardcoded strings
const experienceIds = [];
Object.values(CSV_FIELDS.PACCHETTI.EXPERIENCES).forEach(field => { // ✅
  if (randomPexp[field]) {
    experienceIds.push(randomPexp[field]);
  }
});
```

**Test:**
- ✅ Nessuna regressione funzionale
- ✅ Codice più leggibile

---

### ✅ Task 1.4: Error Handling Migliorato
**Priorità:** 🔴 ALTA
**Effort:** 1 giorno

#### Step:

1. **Creare ErrorFallback component**

```bash
# Path: src/shared/ErrorFallback.jsx
```

```javascript
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import styles from './ErrorFallback.module.css';

/**
 * Componente riutilizzabile per mostrare errori con azioni
 */
function ErrorFallback({ error, onRetry, showHomeButton = true }) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (error?.actionPath) {
      navigate(error.actionPath);
    }
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          {error?.icon || '⚠️'}
        </div>

        <h2 className={styles.errorTitle}>
          {error?.title || 'Si è verificato un errore'}
        </h2>

        <p className={styles.errorMessage}>
          {error?.message || 'Qualcosa è andato storto'}
        </p>

        {error?.description && (
          <p className={styles.errorDescription}>
            {error.description}
          </p>
        )}

        <div className={styles.errorActions}>
          {(onRetry || error?.actionPath) && (
            <Button onClick={handleRetry} variant="primary">
              {error?.actionLabel || 'Riprova'}
            </Button>
          )}

          {showHomeButton && (
            <Button onClick={() => navigate('/')} variant="outline">
              Torna alla Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
```

2. **Creare CSS ErrorFallback**

```bash
# Path: src/shared/ErrorFallback.module.css
```

```css
.errorContainer {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.errorContent {
  max-width: 500px;
  text-align: center;
}

.errorIcon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.errorTitle {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary, #1a1a1a);
}

.errorMessage {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-text-secondary, #666);
}

.errorDescription {
  font-size: 0.9rem;
  margin-bottom: 2rem;
  color: var(--color-text-tertiary, #999);
}

.errorActions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
```

3. **Applicare in TripEditorChat.jsx**

```javascript
// Path: src/features/trip-editor-chat/TripEditorChat.jsx
import ErrorFallback from '../../shared/ErrorFallback';

function TripEditorChat() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const wizardData = location.state?.wizardData;
    if (!wizardData) {
      setError({
        icon: '🧭',
        title: 'Dati wizard mancanti',
        message: 'Non sono stati trovati i dati del wizard',
        description: 'Torna al wizard per iniziare un nuovo viaggio',
        actionPath: '/create',
        actionLabel: 'Vai al Wizard'
      });
      return;
    }

    store.setWizardData(wizardData);

    if (!store.currentStepId) {
      store.goToStep('welcome');
    }
  }, [location.state]);

  // Error fallback
  if (error) {
    return <ErrorFallback error={error} />;
  }

  // Loading state
  if (!store.currentStepId) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Inizializzazione conversazione...</p>
      </div>
    );
  }

  // ... resto del componente
}
```

4. **Applicare in TripEditor.jsx**

```javascript
// Path: src/features/trip-editor/TripEditor.jsx
import ErrorFallback from '../../shared/ErrorFallback';

function TripEditor() {
  // ...

  if (error) {
    return (
      <ErrorFallback
        error={{
          icon: '⚠️',
          title: 'Errore caricamento dati',
          message: error,
          description: 'Verifica la connessione e riprova',
          actionPath: '/create',
          actionLabel: 'Torna al Wizard'
        }}
      />
    );
  }

  // ...
}
```

**Test:**
- ✅ Simula errore mancanza wizardData
- ✅ Verifica rendering ErrorFallback
- ✅ Test button "Riprova"

---

## FASE 2: REFACTORING CORE (5-7 giorni)

### ✅ Task 2.1: Estrarre Business Logic dagli Store
**Priorità:** 🔴 ALTA
**Effort:** 3 giorni

#### Step:

1. **Creare TripBuilderService**

```bash
# Path: src/core/services/tripBuilderService.js
```

```javascript
/**
 * Business logic per costruzione viaggi
 * Pura, testabile, senza dipendenze da store
 */

/**
 * Calcola giorni necessari per un set di esperienze
 * @param {Array} experiences - Array di esperienze
 * @param {boolean} isZoneChange - Se c'è cambio zona
 * @returns {Object} { totalDays, experienceDays, logisticsDays, transferDays }
 */
export function calculateDaysNeeded(experiences, isZoneChange = false) {
  const experienceDays = experiences.length;
  let totalDays = experienceDays + 1; // +1 giorno logistico arrivo
  let transferDays = 0;

  if (isZoneChange) {
    totalDays += 1; // +1 giorno spostamento
    transferDays = 1;
  }

  return {
    totalDays,
    experienceDays,
    logisticsDays: 1,
    transferDays
  };
}

/**
 * Valida se un pacchetto può essere aggiunto
 * @param {Array} validExperiences - Esperienze da aggiungere
 * @param {number} totalDays - Giorni totali viaggio
 * @param {Array} filledBlocks - Blocchi già riempiti
 * @param {boolean} isZoneChange - Se c'è cambio zona
 * @returns {Object} { canAdd, daysNeeded, availableDays, shouldAskAddDays }
 */
export function validatePackageAddition(validExperiences, totalDays, filledBlocks, isZoneChange = false) {
  const { totalDays: daysNeeded } = calculateDaysNeeded(validExperiences, isZoneChange);
  const availableDays = totalDays - 1 - filledBlocks.length; // -1 per arrivo
  const canAdd = daysNeeded <= availableDays;

  return {
    canAdd,
    daysNeeded,
    availableDays,
    shouldAskAddDays: !canAdd,
    missingDays: Math.max(0, daysNeeded - availableDays)
  };
}

/**
 * Trova esperienze duplicate
 * @param {Array} newExperiences - Nuove esperienze da aggiungere
 * @param {Array} filledBlocks - Blocchi esistenti
 * @returns {Array} Esperienze duplicate
 */
export function findDuplicateExperiences(newExperiences, filledBlocks) {
  const existingIds = filledBlocks
    .map(block => block.experience?.id || block.experience?.CODICE)
    .filter(Boolean);

  return newExperiences.filter(exp => {
    const expId = exp.id || exp.CODICE;
    return existingIds.includes(expId);
  });
}

/**
 * Prepara blocchi esperienza da aggiungere
 * @param {Array} experiences - Esperienze
 * @param {Object} packageData - Dati pacchetto
 * @param {string} zoneCode - Codice zona
 * @param {string} zoneName - Nome zona
 * @param {number} startDay - Giorno iniziale
 * @param {boolean} isZoneChange - Se c'è cambio zona
 * @param {string} previousZoneName - Nome zona precedente
 * @returns {Array} Blocchi da aggiungere
 */
export function prepareExperienceBlocks(
  experiences,
  packageData,
  zoneCode,
  zoneName,
  startDay,
  isZoneChange = false,
  previousZoneName = null
) {
  const blocks = [];
  let currentDay = startDay;

  // Aggiungi giorno transfer se necessario
  if (isZoneChange && previousZoneName) {
    blocks.push({
      day: currentDay,
      type: 'transfer',
      zona: zoneName,
      codiceZona: zoneCode,
      packageName: null,
      experience: {
        nome: `Spostamento verso ${zoneName}`,
        descrizione: `Giorno dedicato al trasferimento da ${previousZoneName} a ${zoneName}`,
        type: 'transfer'
      }
    });
    currentDay++;
  }

  // Aggiungi giorno logistico arrivo
  blocks.push({
    day: currentDay,
    type: 'logistics',
    zona: zoneName,
    codiceZona: zoneCode,
    packageName: packageData.NOME_PACCHETTO || packageData.NOME || packageData.nome,
    experience: {
      nome: `Arrivo e sistemazione a ${zoneName}`,
      descrizione: `Giorno logistico per check-in hotel e orientamento`,
      type: 'logistics'
    }
  });
  currentDay++;

  // Aggiungi esperienze
  experiences.forEach(exp => {
    blocks.push({
      day: currentDay,
      type: 'experience',
      experience: exp,
      packageName: packageData.NOME_PACCHETTO || packageData.NOME || packageData.nome,
      zona: zoneName,
      codiceZona: zoneCode
    });
    currentDay++;
  });

  return blocks;
}

/**
 * Compatta blocchi rimuovendo giorni vuoti
 * @param {Array} blocks - Blocchi esistenti
 * @param {number} removedDay - Giorno rimosso
 * @returns {Array} Blocchi compattati
 */
export function compactBlocks(blocks, removedDay) {
  return blocks
    .filter(b => b.day !== removedDay)
    .map(b => {
      if (b.day > removedDay) {
        return { ...b, day: b.day - 1 };
      }
      return b;
    })
    .sort((a, b) => a.day - b.day);
}

/**
 * Calcola ultimo giorno utilizzato
 * @param {Array} blocks - Blocchi
 * @returns {number} Ultimo giorno
 */
export function getLastDay(blocks) {
  if (blocks.length === 0) return 1; // Giorno 1 è arrivo
  return Math.max(...blocks.map(b => b.day || b));
}

/**
 * Verifica se c'è cambio zona
 * @param {Array} filledBlocks - Blocchi esistenti
 * @param {string} newZoneCode - Codice nuova zona
 * @returns {boolean} True se c'è cambio zona
 */
export function isZoneChange(filledBlocks, newZoneCode) {
  if (filledBlocks.length === 0) return false;
  const lastBlock = filledBlocks[filledBlocks.length - 1];
  return lastBlock.codiceZona !== newZoneCode;
}
```

2. **Refactor useTripEditorChatStore.js**

```javascript
// Path: src/features/trip-editor-chat/store/useTripEditorChatStore.js
import {
  prepareExperienceBlocks,
  getLastDay
} from '../../../core/services/tripBuilderService';

const useTripEditorChatStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ... state esistente

        addPackage: (zoneCode, packageData, experiences) => set((state) => {
          const zone = state.tripData.selectedZones.find(z => z.code === zoneCode);
          const zoneName = zone?.name || packageData.ZONA;

          // Usa il service (testabile) ✅
          const lastDay = getLastDay(state.tripData.filledBlocks);
          const newBlocks = prepareExperienceBlocks(
            experiences,
            packageData,
            zoneCode,
            zoneName,
            lastDay + 1,
            false, // isZoneChange - gestisci se necessario
            null
          );

          return {
            tripData: {
              ...state.tripData,
              filledBlocks: [...state.tripData.filledBlocks, ...newBlocks]
            }
          };
        }),

        // ... resto store
      }),
      { name: 'trip-editor-chat-storage' }
    ),
    { name: 'TripEditorChat' }
  )
);
```

3. **Refactor TripEditor.jsx - handleConfirmPackage**

```javascript
// Path: src/features/trip-editor/TripEditor.jsx
import {
  calculateDaysNeeded,
  validatePackageAddition,
  findDuplicateExperiences,
  prepareExperienceBlocks,
  isZoneChange as checkZoneChange,
  getLastDay
} from '../../core/services/tripBuilderService';

const handleConfirmPackage = (validExperiences, pexp) => {
  if (!pexp || !validExperiences || validExperiences.length === 0) return;

  const zonaObj = zone.find(z =>
    z.ZONA?.toLowerCase() === pexp.ZONA?.toLowerCase()
  );
  const codiceZona = zonaObj?.CODICE || null;

  // MODALITÀ EDITING
  if (editingBlock) {
    // ... gestione editing esistente
    return;
  }

  // MODALITÀ NORMALE - Usa service ✅
  const isChangingZone = checkZoneChange(filledBlocks, codiceZona);
  const validation = validatePackageAddition(
    validExperiences,
    totalDays,
    filledBlocks,
    isChangingZone
  );

  if (!validation.canAdd) {
    const shouldAddDays = window.confirm(
      `⚠️ Il pacchetto richiede ${validation.daysNeeded} giorni, ma hai solo ${validation.availableDays} disponibili.\n\n` +
      `Vuoi aggiungere ${validation.missingDays} giorni al viaggio?`
    );

    if (shouldAddDays) {
      setTotalDays(totalDays + validation.missingDays);
      toast.success('Giorni aggiunti al viaggio!');
    } else {
      toast.info('Pacchetto non aggiunto');
      return;
    }
  }

  // Verifica duplicati ✅
  const duplicates = findDuplicateExperiences(validExperiences, filledBlocks);
  if (duplicates.length > 0) {
    const duplicateNames = duplicates.map(exp => exp.nome).join(', ');
    toast.error('Esperienza già presente!', {
      description: duplicateNames
    });
    return;
  }

  // Prepara blocchi ✅
  const lastBlock = filledBlocks.length > 0 ? filledBlocks[filledBlocks.length - 1] : null;
  const lastDay = getLastDay(filledBlocks);

  const newBlocks = prepareExperienceBlocks(
    validExperiences,
    pexp,
    codiceZona,
    pexp.ZONA,
    lastDay + 1,
    isChangingZone,
    lastBlock?.zona
  );

  // Aggiungi blocchi
  setFilledBlocks([...filledBlocks, ...newBlocks]);

  // Incrementa contatore zone
  const maxContatore = Math.max(...itinerari.map(it => parseInt(it.CONTATORE_ZONA) || 0));
  if (availableCounter < maxContatore) {
    setAvailableCounter(prev => prev + 1);
    toast.info(`🔓 Nuove zone sbloccate!`);
  }

  // Chiudi panels
  setActiveTab(null);
  setCurrentPexp(null);
  setCurrentExp(null);

  toast.success(`Pacchetto confermato!`, {
    description: `${newBlocks.length} blocchi aggiunti`
  });
};
```

**Test:**
- ✅ Unit test per tripBuilderService
- ✅ Verifica funzionamento TripEditor
- ✅ Verifica chat flow

---

### ✅ Task 2.2: Refactor TripEditor - Suddivisione Componenti
**Priorità:** 🔴 ALTA
**Effort:** 4 giorni

**NOTA:** Questo task è complesso e va fatto con attenzione. Suggerisco di farlo in una sessione dedicata con pair programming.

#### Obiettivo:
Suddividere `TripEditor.jsx` (1095 linee) in:
- `TripEditor.jsx` (orchestrator, ~200 linee)
- `useTripEditorStore.js` (Zustand store)
- `TripEditorMap.jsx`
- `TripEditorPackages.jsx`
- `TripEditorActions.jsx`

#### Step (High Level):

1. **Creare useTripEditorStore.js**
   - Migrare tutti useState in Zustand
   - Persistere dati essenziali

2. **Estrarre TripEditorMap.jsx**
   - Mappa + zone disponibili
   - State: selectedZone, availableZones
   - Props: onZoneClick

3. **Estrarre TripEditorPackages.jsx**
   - Grid pacchetti filtrati
   - Props: filteredPacchetti, onPacchettoClick

4. **Estrarre TripEditorActions.jsx**
   - CTA buttons (Crea Auto, Crea Itinerario)
   - Progress indicator

5. **Refactor TripEditor.jsx**
   - Diventa orchestrator
   - Compone sotto-componenti
   - Gestisce solo routing e modals

**⚠️ QUESTO TASK RICHIEDE SESSIONE DEDICATA** - Non farlo in questa fase quick wins

---

## FASE 3: TESTING & VALIDATION (2-3 giorni)

### ✅ Task 3.1: Unit Tests per Core Services
**Priorità:** 🟡 MEDIA
**Effort:** 2 giorni

#### Step:

1. **Setup Vitest** (se non già presente)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

2. **Configurare vitest.config.js**

```javascript
// Path: vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

3. **Test tripBuilderService**

```bash
# Path: src/core/services/__tests__/tripBuilderService.test.js
```

```javascript
import { describe, it, expect } from 'vitest';
import {
  calculateDaysNeeded,
  validatePackageAddition,
  findDuplicateExperiences,
  prepareExperienceBlocks,
  compactBlocks,
  getLastDay,
  isZoneChange
} from '../tripBuilderService';

describe('tripBuilderService', () => {
  describe('calculateDaysNeeded', () => {
    it('should calculate days for experiences without zone change', () => {
      const experiences = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = calculateDaysNeeded(experiences, false);

      expect(result.totalDays).toBe(4); // 3 exp + 1 logistic
      expect(result.experienceDays).toBe(3);
      expect(result.logisticsDays).toBe(1);
      expect(result.transferDays).toBe(0);
    });

    it('should add transfer day when zone changes', () => {
      const experiences = [{ id: 1 }, { id: 2 }];
      const result = calculateDaysNeeded(experiences, true);

      expect(result.totalDays).toBe(4); // 2 exp + 1 logistic + 1 transfer
      expect(result.transferDays).toBe(1);
    });
  });

  describe('validatePackageAddition', () => {
    it('should validate when enough days available', () => {
      const experiences = [{ id: 1 }, { id: 2 }];
      const totalDays = 10;
      const filledBlocks = []; // 0 giorni usati

      const result = validatePackageAddition(experiences, totalDays, filledBlocks, false);

      expect(result.canAdd).toBe(true);
      expect(result.daysNeeded).toBe(3); // 2 exp + 1 logistic
      expect(result.availableDays).toBe(9); // 10 - 1 (arrivo)
    });

    it('should reject when not enough days', () => {
      const experiences = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const totalDays = 5;
      const filledBlocks = [{ day: 2 }, { day: 3 }]; // 2 giorni usati

      const result = validatePackageAddition(experiences, totalDays, filledBlocks, false);

      expect(result.canAdd).toBe(false);
      expect(result.shouldAskAddDays).toBe(true);
      expect(result.missingDays).toBeGreaterThan(0);
    });
  });

  describe('findDuplicateExperiences', () => {
    it('should find duplicate experiences', () => {
      const newExperiences = [
        { id: 'EXP1' },
        { id: 'EXP2' },
        { id: 'EXP3' }
      ];

      const filledBlocks = [
        { experience: { id: 'EXP2' } },
        { experience: { id: 'EXP4' } }
      ];

      const duplicates = findDuplicateExperiences(newExperiences, filledBlocks);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].id).toBe('EXP2');
    });

    it('should return empty array when no duplicates', () => {
      const newExperiences = [{ id: 'EXP1' }];
      const filledBlocks = [{ experience: { id: 'EXP2' } }];

      const duplicates = findDuplicateExperiences(newExperiences, filledBlocks);

      expect(duplicates).toHaveLength(0);
    });
  });

  describe('compactBlocks', () => {
    it('should compact blocks after removal', () => {
      const blocks = [
        { day: 1 },
        { day: 2 },
        { day: 3 },
        { day: 4 },
        { day: 5 }
      ];

      const compacted = compactBlocks(blocks, 3);

      expect(compacted).toHaveLength(4);
      expect(compacted.find(b => b.day === 3)).toBeUndefined();
      expect(compacted.find(b => b.day === 4).day).toBe(3); // Shifted
      expect(compacted.find(b => b.day === 5).day).toBe(4); // Shifted
    });
  });

  describe('getLastDay', () => {
    it('should return 1 for empty blocks', () => {
      expect(getLastDay([])).toBe(1);
    });

    it('should return max day', () => {
      const blocks = [{ day: 2 }, { day: 5 }, { day: 3 }];
      expect(getLastDay(blocks)).toBe(5);
    });
  });

  describe('isZoneChange', () => {
    it('should return false for empty blocks', () => {
      expect(isZoneChange([], 'ZONE1')).toBe(false);
    });

    it('should detect zone change', () => {
      const blocks = [{ codiceZona: 'ZONE1' }];
      expect(isZoneChange(blocks, 'ZONE2')).toBe(true);
    });

    it('should return false for same zone', () => {
      const blocks = [{ codiceZona: 'ZONE1' }];
      expect(isZoneChange(blocks, 'ZONE1')).toBe(false);
    });
  });
});
```

4. **Test filterHelpers**

```bash
# Path: src/core/utils/__tests__/filterHelpers.test.js
```

```javascript
import { describe, it, expect } from 'vitest';
import {
  filterByField,
  filterByTextSearch,
  filterByRange,
  sortByField
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
  });

  describe('filterByRange', () => {
    it('should filter by min/max range', () => {
      const result = filterByRange(sampleData, 'age', 26, 32);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bob');
    });

    it('should work with null min', () => {
      const result = filterByRange(sampleData, 'age', null, 30);
      expect(result).toHaveLength(2);
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
  });
});
```

5. **Aggiungere script test in package.json**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Test:**
```bash
npm test
```

---

## CHECKLIST FINALE

### Fase 1: Quick Wins ✅
- [ ] filterHelpers.js creato e applicato
- [ ] storageService.js creato e applicato
- [ ] Costanti centralizzate create e applicate
- [ ] ErrorFallback component creato e applicato
- [ ] Tutti i test passano
- [ ] Nessuna regressione funzionale

### Fase 2: Refactoring Core ✅
- [ ] tripBuilderService.js creato
- [ ] Business logic estratta da useTripEditorChatStore
- [ ] TripEditor.jsx usa tripBuilderService
- [ ] Tutti i test passano
- [ ] (Opzionale) TripEditor suddiviso in componenti più piccoli

### Fase 3: Testing ✅
- [ ] Vitest configurato
- [ ] Test tripBuilderService completi
- [ ] Test filterHelpers completi
- [ ] Coverage > 80% per core services
- [ ] CI/CD pipeline configurata (opzionale)

### Commit & Push ✅
- [ ] Commit con messaggio descrittivo
- [ ] Push su branch `claude/review-app-consistency-01G7kPVB8vRoGWWta1ya66fa`
- [ ] Build production funziona
- [ ] App testata in staging

---

## 🚀 COMANDI RAPIDI

```bash
# Verifica branch
git status
git branch

# Test locale
npm run dev
npm test

# Build production
npm run build
npm run preview

# Commit finale
git add .
git commit -m "refactor: implement priority improvements

- Add centralized filter helpers
- Add storage abstraction layer
- Add centralized constants
- Improve error handling with ErrorFallback
- Extract business logic to tripBuilderService
- Add unit tests for core services

BREAKING CHANGES: none
TESTED: yes
"

# Push
git push -u origin claude/review-app-consistency-01G7kPVB8vRoGWWta1ya66fa
```

---

## 📝 NOTE FINALI

1. **Ordine di esecuzione:** Segui l'ordine delle fasi
2. **Testing:** Testa dopo ogni task completato
3. **Commit:** Fai commit frequenti e atomici
4. **Backup:** Prima di refactor massivi, crea un backup

**Durata totale stimata:** 10-14 giorni lavorativi (team 2 dev)

**Prossimi step dopo questo piano:**
- Migrazione a TypeScript (opzionale)
- Refactor TripEditor completo
- Add E2E tests con Playwright
- Performance optimization

---

**Creato:** 2025-11-19
**Branch:** `claude/review-app-consistency-01G7kPVB8vRoGWWta1ya66fa`
**Versione:** 1.0
