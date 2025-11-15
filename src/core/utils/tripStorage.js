/**
 * Sistema di memorizzazione viaggi con localStorage
 * Gestisce salvataggio, recupero, modifica e cancellazione viaggi
 */

const STORAGE_KEY = 'trave_crew_trips';

// Ottieni tutti i viaggi
export const getAllTrips = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { upcoming: [], past: [], saved: [] };
  } catch (error) {
    console.error('Errore lettura viaggi da localStorage:', error);
    return { upcoming: [], past: [], saved: [] };
  }
};

// Salva un nuovo viaggio
export const saveTrip = (tripData, category = 'saved') => {
  try {
    const trips = getAllTrips();

    const newTrip = {
      id: Date.now(), // ID univoco basato su timestamp
      ...tripData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    trips[category].push(newTrip);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));

    return newTrip;
  } catch (error) {
    console.error('Errore salvataggio viaggio:', error);
    return null;
  }
};

// Aggiorna un viaggio esistente
export const updateTrip = (tripId, updatedData) => {
  try {
    const trips = getAllTrips();
    let updated = false;

    // Cerca in tutte le categorie
    ['upcoming', 'past', 'saved'].forEach(category => {
      const index = trips[category].findIndex(t => t.id === tripId);
      if (index !== -1) {
        trips[category][index] = {
          ...trips[category][index],
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Errore aggiornamento viaggio:', error);
    return false;
  }
};

// Cancella un viaggio
export const deleteTrip = (tripId) => {
  try {
    const trips = getAllTrips();
    let deleted = false;

    // Cerca e rimuovi da tutte le categorie
    ['upcoming', 'past', 'saved'].forEach(category => {
      const index = trips[category].findIndex(t => t.id === tripId);
      if (index !== -1) {
        trips[category].splice(index, 1);
        deleted = true;
      }
    });

    if (deleted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Errore cancellazione viaggio:', error);
    return false;
  }
};

// Sposta viaggio tra categorie (es: da saved a upcoming quando si pubblica/prenota)
export const moveTripToCategory = (tripId, targetCategory) => {
  try {
    const trips = getAllTrips();
    let trip = null;
    let sourceCategory = null;

    // Trova il viaggio e la categoria di origine
    ['upcoming', 'past', 'saved'].forEach(category => {
      const found = trips[category].find(t => t.id === tripId);
      if (found) {
        trip = found;
        sourceCategory = category;
      }
    });

    if (!trip || !sourceCategory) {
      return false;
    }

    // Rimuovi dalla categoria di origine
    trips[sourceCategory] = trips[sourceCategory].filter(t => t.id !== tripId);

    // Aggiungi alla categoria di destinazione
    trips[targetCategory].push({
      ...trip,
      status: targetCategory === 'upcoming' ? 'confirmed' : targetCategory === 'past' ? 'completed' : 'saved',
      updatedAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    return true;
  } catch (error) {
    console.error('Errore spostamento viaggio:', error);
    return false;
  }
};

// Ottieni un viaggio specifico per ID
export const getTripById = (tripId) => {
  try {
    const trips = getAllTrips();

    for (const category of ['upcoming', 'past', 'saved']) {
      const trip = trips[category].find(t => t.id === tripId);
      if (trip) {
        return { trip, category };
      }
    }

    return null;
  } catch (error) {
    console.error('Errore recupero viaggio:', error);
    return null;
  }
};

// Pulisci storage (per test)
export const clearAllTrips = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Errore pulizia storage:', error);
    return false;
  }
};

// Esporta viaggio in JSON
export const exportTripAsJSON = (tripId) => {
  const tripData = getTripById(tripId);
  if (!tripData) return null;

  const dataStr = JSON.stringify(tripData.trip, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `viaggio-${tripData.trip.destinazione || 'export'}-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
  return true;
};

// Popola storage con dati di esempio per testing
export const populateTestData = () => {
  const testTrips = {
    upcoming: [
      {
        id: 1000001,
        destinazione: 'Thailandia',
        zona: 'Bangkok e dintorni',
        dataPartenza: '2025-07-15',
        dataRitorno: '2025-07-22',
        giorni: 7,
        persone: 2,
        immagine: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
        status: 'confirmed',
        costoTotale: 1850,
        wizardData: {
          destinazione: 'Thailandia',
          numeroPersone: 2,
          tipoViaggio: 'privato',
          budget: 'medium'
        },
        filledBlocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    past: [],
    saved: []
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(testTrips));
  return testTrips;
};
