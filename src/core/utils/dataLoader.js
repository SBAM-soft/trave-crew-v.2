import Papa from 'papaparse';

// Helper per ottenere il path corretto con base URL
const getDataPath = (filename) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}data/${filename}`;
};

export const loadCSV = (filePath) => {
  // Se il path inizia con /data/, rimuovilo e usa getDataPath
  const cleanPath = filePath.replace(/^\/data\//, '');
  const fullPath = cleanPath.includes('/') ? filePath : getDataPath(cleanPath);

  return new Promise((resolve, reject) => {
    Papa.parse(fullPath, {
      download: true,
      header: true,
      dynamicTyping: false, // Disabled to prevent parsing issues with values like "si"
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      escapeChar: '"',
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('Warning parsing CSV:', results.errors);
          results.errors.slice(0, 5).forEach(err => {
            console.warn(`  Row ${err.row}: ${err.message}`);
          });
        }
        console.log('CSV caricato:', fullPath, '→', results.data.length, 'righe');
        resolve(results.data);
      },
      error: (error) => {
        console.error('Errore caricamento CSV:', fullPath, error);
        reject(error);
      }
    });
  });
};

export const loadAllData = async () => {
  try {
    const [destinazioni, zone, esperienze, pacchetti, itinerario, hotel, voli, plus, costi_accessori, viaggi] = await Promise.all([
      loadCSV('destinazioni.csv'),
      loadCSV('zone.csv'),
      loadCSV('esperienze.csv'),
      loadCSV('pacchetti.csv'),
      loadCSV('itinerario.csv'),
      loadCSV('hotel.csv'),
      loadCSV('voli.csv'),
      loadCSV('plus.csv'),
      loadCSV('costi_accessori.csv'),
      loadCSV('viaggi.csv')
    ]);

    return {
      destinazioni,
      zone,
      esperienze,
      pacchetti,
      itinerario,
      hotel,
      voli,
      plus,
      costi_accessori,
      viaggi
    };
  } catch (error) {
    console.error('Errore nel caricamento dei dati:', error);
    throw error;
  }
};