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

  // Add cache buster to force fresh load
  const cacheBuster = `?v=${Date.now()}`;
  const urlWithCacheBuster = fullPath + cacheBuster;

  console.log('🔄 Loading CSV from:', urlWithCacheBuster);

  return new Promise((resolve, reject) => {
    Papa.parse(urlWithCacheBuster, {
      download: true,
      header: true,
      dynamicTyping: false, // Disabled to prevent parsing issues with values like "si"
      skipEmptyLines: true,
      delimiter: '', // Auto-detect delimiter (supports both comma and semicolon)
      quoteChar: '"',
      escapeChar: '"',
      complete: (results) => {
        console.log('✅ CSV parse complete');
        console.log('   File:', fullPath);
        console.log('   Rows:', results.data.length);
        console.log('   Errors:', results.errors.length);

        if (results.errors.length > 0) {
          console.warn('⚠️  CSV parsing warnings:');
          results.errors.slice(0, 5).forEach(err => {
            console.warn(`   Row ${err.row}: ${err.type} - ${err.message}`);
          });
        }

        // Log first row for debugging
        if (results.data.length > 0) {
          console.log('   First row:', JSON.stringify(results.data[0], null, 2));
        }

        resolve(results.data);
      },
      error: (error) => {
        console.error('❌ CSV loading error:', fullPath, error);
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