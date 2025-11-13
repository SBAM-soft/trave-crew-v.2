import Papa from 'papaparse';

export const loadCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      escapeChar: '"',
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('Warning parsing CSV:', results.errors);
        }
        console.log('CSV caricato:', filePath, '→', results.data.length, 'righe');
        resolve(results.data);
      },
      error: (error) => {
        console.error('Errore caricamento CSV:', filePath, error);
        reject(error);
      }
    });
  });
};

export const loadAllData = async () => {
  try {
    const [destinazioni, zone, esperienze, pacchetti, hotel, voli, plus, costi_accessori, viaggi] = await Promise.all([
      loadCSV('/data/destinazioni.csv'),
      loadCSV('/data/zone.csv'),
      loadCSV('/data/esperienze.csv'),
      loadCSV('/data/pacchetti.csv'),
      loadCSV('/data/hotel.csv'),
      loadCSV('/data/voli.csv'),
      loadCSV('/data/plus.csv'),
      loadCSV('/data/costi_accessori.csv'),
      loadCSV('/data/viaggi.csv')
    ]);

    return {
      destinazioni,
      zone,
      esperienze,
      pacchetti,
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