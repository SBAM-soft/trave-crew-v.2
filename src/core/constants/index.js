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
  // DEPRECATED: Pacchetti entity removed from database (Nov 2025)
  // Kept for backward compatibility only, returns empty array
  /*
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
  */
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
