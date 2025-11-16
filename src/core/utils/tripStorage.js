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

// Salva viaggio completo con hotel e extra
export const saveTripComplete = (tripData, category = 'saved') => {
  try {
    const trips = getAllTrips();

    // Calcola costo totale includendo hotel e extra
    const costoBase = tripData.costoBase || 0;
    const costoHotels = tripData.selectedHotels?.reduce((acc, selection) => {
      const hotelCost = calculateHotelCost(selection.hotel, tripData.giorni);
      const extrasCost = selection.extras?.reduce((sum, extra) => {
        return sum + (parseFloat(extra.PRZ_PAX_GEN || extra.PRZ_PAX_FEB || 0) * (tripData.wizardData?.numeroPersone || 1));
      }, 0) || 0;
      return acc + hotelCost + extrasCost;
    }, 0) || 0;

    const costoTotale = costoBase + costoHotels;

    // Estrai zone visitate
    const zoneVisitate = tripData.zoneVisitate?.map(z => z.nome).join(', ') || '';

    const newTrip = {
      id: tripData.id || Date.now(),
      destinazione: tripData.wizardData?.destinazione || 'Destinazione',
      zona: zoneVisitate,
      dataPartenza: tripData.wizardData?.dataPartenza || null,
      dataRitorno: calculateDataRitorno(tripData.wizardData?.dataPartenza, tripData.giorni),
      giorni: tripData.giorni || 7,
      persone: tripData.wizardData?.numeroPersone || 1,
      immagine: tripData.immagine || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
      status: category === 'saved' ? 'saved' : category === 'upcoming' ? 'confirmed' : 'completed',
      costoTotale,
      // Dati completi per modifica
      wizardData: tripData.wizardData,
      filledBlocks: tripData.filledBlocks || [],
      zoneVisitate: tripData.zoneVisitate || [],
      selectedHotels: tripData.selectedHotels || [],
      itinerario: tripData.itinerario || null,
      costiAccessori: tripData.costiAccessori || [],
      extraSuggeriti: tripData.extraSuggeriti || [],
      createdAt: tripData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Se esiste già, aggiorna invece di creare
    const existingIndex = trips[category].findIndex(t => t.id === newTrip.id);
    if (existingIndex !== -1) {
      trips[category][existingIndex] = newTrip;
    } else {
      trips[category].push(newTrip);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));

    return newTrip;
  } catch (error) {
    console.error('Errore salvataggio viaggio completo:', error);
    return null;
  }
};

// Helper: calcola costo hotel
const calculateHotelCost = (hotel, giorni) => {
  if (!hotel) return 0;

  // Usa il campo PRZ_PAX_NIGHT_* più recente disponibile
  const priceKeys = Object.keys(hotel).filter(k => k.startsWith('PRZ_PAX_NIGHT_'));
  const prices = priceKeys
    .map(key => parseFloat(hotel[key]) || 0)
    .filter(p => p > 0);

  if (prices.length === 0) return 0;

  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  return Math.round(avgPrice * (giorni - 1)); // -1 perché il primo giorno è arrivo
};

// Helper: calcola data ritorno
const calculateDataRitorno = (dataPartenza, giorni) => {
  // Valida che dataPartenza sia presente e non vuota
  if (!dataPartenza || dataPartenza === '') return null;

  const partenza = new Date(dataPartenza);

  // Valida che la data creata sia valida
  if (isNaN(partenza.getTime())) return null;

  const ritorno = new Date(partenza);
  ritorno.setDate(partenza.getDate() + (giorni - 1));

  // Doppia validazione sulla data di ritorno
  if (isNaN(ritorno.getTime())) return null;

  return ritorno.toISOString().split('T')[0];
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
