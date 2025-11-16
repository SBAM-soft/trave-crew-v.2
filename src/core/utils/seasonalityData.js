/**
 * Dati stagionalità e clima per le destinazioni
 */

export const SEASONALITY_DATA = {
  'Thailandia': {
    bestMonths: [11, 12, 1, 2, 3], // Novembre - Marzo
    goodMonths: [10, 4], // Ottobre, Aprile
    monsoonMonths: [5, 6, 7, 8, 9], // Maggio - Settembre
    peakMonths: [12, 1, 2], // Dicembre - Febbraio
    climateInfo: {
      1: { season: 'Alta Stagione', weather: 'Secco e fresco', price: 'Alta', temp: '25-32°C' },
      2: { season: 'Alta Stagione', weather: 'Secco e caldo', price: 'Alta', temp: '26-33°C' },
      3: { season: 'Alta Stagione', weather: 'Caldo e secco', price: 'Media-Alta', temp: '27-34°C' },
      4: { season: 'Stagione Calda', weather: 'Molto caldo', price: 'Media', temp: '28-36°C' },
      5: { season: 'Inizio Monsone', weather: 'Caldo e umido', price: 'Bassa', temp: '27-34°C' },
      6: { season: 'Monsone', weather: 'Piogge frequenti', price: 'Bassa', temp: '27-33°C' },
      7: { season: 'Monsone', weather: 'Piogge abbondanti', price: 'Bassa', temp: '27-32°C' },
      8: { season: 'Monsone', weather: 'Piogge abbondanti', price: 'Bassa', temp: '27-32°C' },
      9: { season: 'Fine Monsone', weather: 'Piogge sporadiche', price: 'Bassa', temp: '26-32°C' },
      10: { season: 'Transizione', weather: 'Ancora piovoso', price: 'Media-Bassa', temp: '26-31°C' },
      11: { season: 'Alta Stagione', weather: 'Secco e piacevole', price: 'Media-Alta', temp: '25-31°C' },
      12: { season: 'Alta Stagione', weather: 'Secco e fresco', price: 'Alta', temp: '25-31°C' },
    }
  },
  'Vietnam': {
    bestMonths: [11, 12, 1, 2, 3, 4],
    goodMonths: [10, 5],
    monsoonMonths: [6, 7, 8, 9],
    peakMonths: [12, 1, 2],
    climateInfo: {
      1: { season: 'Alta Stagione', weather: 'Fresco e secco', price: 'Alta', temp: '20-28°C' },
      2: { season: 'Alta Stagione', weather: 'Fresco e secco', price: 'Alta', temp: '21-29°C' },
      3: { season: 'Buona', weather: 'Caldo e secco', price: 'Media-Alta', temp: '23-31°C' },
      4: { season: 'Buona', weather: 'Caldo', price: 'Media', temp: '25-33°C' },
      5: { season: 'Inizio Piogge', weather: 'Caldo e umido', price: 'Media-Bassa', temp: '26-34°C' },
      6: { season: 'Monsone', weather: 'Piogge frequenti', price: 'Bassa', temp: '26-33°C' },
      7: { season: 'Monsone', weather: 'Piogge abbondanti', price: 'Bassa', temp: '26-33°C' },
      8: { season: 'Monsone', weather: 'Piogge abbondanti', price: 'Bassa', temp: '26-33°C' },
      9: { season: 'Fine Monsone', weather: 'Ancora piovoso', price: 'Bassa', temp: '25-32°C' },
      10: { season: 'Transizione', weather: 'Meno piogge', price: 'Media-Bassa', temp: '24-31°C' },
      11: { season: 'Alta Stagione', weather: 'Secco e piacevole', price: 'Media-Alta', temp: '22-29°C' },
      12: { season: 'Alta Stagione', weather: 'Fresco e secco', price: 'Alta', temp: '20-28°C' },
    }
  },
  'Bali': {
    bestMonths: [4, 5, 6, 7, 8, 9],
    goodMonths: [3, 10],
    monsoonMonths: [11, 12, 1, 2],
    peakMonths: [7, 8, 12],
    climateInfo: {
      1: { season: 'Monsone', weather: 'Piogge frequenti', price: 'Media', temp: '26-32°C' },
      2: { season: 'Monsone', weather: 'Piogge frequenti', price: 'Media', temp: '26-32°C' },
      3: { season: 'Transizione', weather: 'Meno piogge', price: 'Media', temp: '26-32°C' },
      4: { season: 'Stagione Secca', weather: 'Secco e piacevole', price: 'Media-Alta', temp: '26-32°C' },
      5: { season: 'Stagione Secca', weather: 'Secco e soleggiato', price: 'Media-Alta', temp: '26-31°C' },
      6: { season: 'Stagione Secca', weather: 'Secco e fresco', price: 'Media-Alta', temp: '25-30°C' },
      7: { season: 'Alta Stagione', weather: 'Secco e fresco', price: 'Alta', temp: '25-30°C' },
      8: { season: 'Alta Stagione', weather: 'Secco e fresco', price: 'Alta', temp: '25-30°C' },
      9: { season: 'Stagione Secca', weather: 'Secco e caldo', price: 'Media-Alta', temp: '26-31°C' },
      10: { season: 'Transizione', weather: 'Iniziano piogge', price: 'Media', temp: '26-32°C' },
      11: { season: 'Monsone', weather: 'Piogge sporadiche', price: 'Media-Bassa', temp: '26-32°C' },
      12: { season: 'Monsone', weather: 'Piogge frequenti', price: 'Alta (Natale)', temp: '26-32°C' },
    }
  },
  // Default per altre destinazioni
  'default': {
    bestMonths: [4, 5, 6, 7, 8, 9],
    goodMonths: [3, 10],
    monsoonMonths: [],
    peakMonths: [7, 8, 12],
    climateInfo: {
      1: { season: 'Inverno', weather: 'Variabile', price: 'Media', temp: '15-25°C' },
      2: { season: 'Inverno', weather: 'Variabile', price: 'Media', temp: '15-26°C' },
      3: { season: 'Primavera', weather: 'Piacevole', price: 'Media', temp: '18-27°C' },
      4: { season: 'Primavera', weather: 'Piacevole', price: 'Media', temp: '20-28°C' },
      5: { season: 'Primavera', weather: 'Caldo', price: 'Media', temp: '22-30°C' },
      6: { season: 'Estate', weather: 'Caldo', price: 'Media-Alta', temp: '25-32°C' },
      7: { season: 'Estate', weather: 'Molto caldo', price: 'Alta', temp: '27-35°C' },
      8: { season: 'Estate', weather: 'Molto caldo', price: 'Alta', temp: '27-35°C' },
      9: { season: 'Autunno', weather: 'Piacevole', price: 'Media', temp: '24-31°C' },
      10: { season: 'Autunno', weather: 'Piacevole', price: 'Media', temp: '21-28°C' },
      11: { season: 'Autunno', weather: 'Fresco', price: 'Media-Bassa', temp: '18-25°C' },
      12: { season: 'Inverno', weather: 'Freddo', price: 'Alta (Natale)', temp: '15-23°C' },
    }
  }
};

/**
 * Ottiene i dati di stagionalità per una destinazione
 */
export function getSeasonalityData(destinazione) {
  const destName = destinazione?.trim();
  return SEASONALITY_DATA[destName] || SEASONALITY_DATA['default'];
}

/**
 * Ottiene info sul clima per una destinazione in una specifica data
 */
export function getClimateInfo(destinazione, dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);
  const month = date.getMonth() + 1; // 1-12

  const seasonData = getSeasonalityData(destinazione);
  return seasonData.climateInfo[month] || null;
}

/**
 * Determina se un mese è ottimale per visitare la destinazione
 */
export function isOptimalMonth(destinazione, month) {
  const seasonData = getSeasonalityData(destinazione);
  return seasonData.bestMonths.includes(month);
}

/**
 * Determina se un mese è in alta stagione (prezzi alti)
 */
export function isPeakMonth(destinazione, month) {
  const seasonData = getSeasonalityData(destinazione);
  return seasonData.peakMonths.includes(month);
}

/**
 * Genera date suggerite per una destinazione
 */
export function getSuggestedDates(destinazione) {
  const seasonData = getSeasonalityData(destinazione);
  const today = new Date();
  const suggestions = [];

  // Trova i prossimi 3 mesi ottimali
  for (let offset = 0; offset < 365 && suggestions.length < 3; offset += 7) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    const month = date.getMonth() + 1;

    if (seasonData.bestMonths.includes(month)) {
      // Cerca il primo weekend del mese
      while (date.getDay() !== 6) { // Sabato
        date.setDate(date.getDate() + 1);
      }

      const monthName = date.toLocaleDateString('it-IT', { month: 'long' });
      const climateInfo = seasonData.climateInfo[month];

      suggestions.push({
        date: date.toISOString().split('T')[0],
        label: `${date.getDate()} ${monthName}`,
        reason: climateInfo.weather,
        priceLevel: climateInfo.price,
        optimal: true
      });

      // Salta al mese successivo
      offset = Math.max(offset, (date.getDate() - today.getDate()) + 30);
    }
  }

  return suggestions;
}

/**
 * Genera date rapide (indipendenti dalla destinazione)
 */
export function getQuickDates() {
  const today = new Date();

  return [
    {
      label: 'Prossimo Weekend',
      getDays: () => {
        const days = (6 - today.getDay() + 7) % 7;
        return days === 0 ? 7 : days;
      }
    },
    {
      label: 'Tra 1 Mese',
      getDays: () => 30
    },
    {
      label: 'Tra 3 Mesi',
      getDays: () => 90
    },
    {
      label: 'Tra 6 Mesi',
      getDays: () => 180
    }
  ];
}
