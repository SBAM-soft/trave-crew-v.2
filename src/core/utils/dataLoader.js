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

/**
 * Unisce dati tech e copy tramite colonna CODICE
 * @param {Array} techData - Array di oggetti dal CSV tech
 * @param {Array} copyData - Array di oggetti dal CSV copy
 * @returns {Array} - Array di oggetti uniti
 */
const mergeByCode = (techData, copyData) => {
  console.log('🔀 Merging tech + copy data by CODICE...');

  // Crea una mappa dei dati copy per CODICE
  const copyMap = new Map();
  copyData.forEach(item => {
    if (item.CODICE) {
      copyMap.set(item.CODICE, item);
    }
  });

  // Unisci tech con copy
  const merged = techData.map(techItem => {
    const copyItem = copyMap.get(techItem.CODICE) || {};

    // Merge: tech ha priorità, ma aggiungiamo tutte le proprietà copy che non sono in tech
    // Rimuoviamo duplicati di CODICE e TIPO
    const { CODICE: copyCode, TIPO: copyTipo, ...restCopyData } = copyItem;

    return {
      ...techItem,
      ...restCopyData
    };
  });

  console.log(`   ✅ Merged ${merged.length} items (tech: ${techData.length}, copy: ${copyData.length})`);

  return merged;
};

/**
 * Carica dati di un'entità con separazione tech/copy
 * @param {string} entityName - Nome dell'entità (es: 'destinazioni')
 * @param {boolean} hasCopy - Se l'entità ha anche foglio copy (default: true)
 * @returns {Promise<Array>} - Array di oggetti uniti
 */
export const loadEntityData = async (entityName, hasCopy = true) => {
  const techFile = `${entityName}_tech.csv`;

  if (!hasCopy) {
    // Solo tech (voli, itinerario, costi_accessori, extra)
    console.log(`📋 Loading ${entityName} (tech only)...`);
    return await loadCSV(techFile);
  }

  // Tech + Copy
  console.log(`📋 Loading ${entityName} (tech + copy)...`);
  const copyFile = `${entityName}_copy.csv`;

  const [techData, copyData] = await Promise.all([
    loadCSV(techFile),
    loadCSV(copyFile)
  ]);

  return mergeByCode(techData, copyData);
};

export const loadAllData = async () => {
  try {
    console.log('🚀 Loading all database entities...');

    // Carica tutte le entità in parallelo
    const [
      destinazioni,
      zone,
      esperienze,
      pacchetti,
      hotel,
      voli,
      itinerario,
      costi_accessori,
      extra
    ] = await Promise.all([
      // Entità con tech + copy (merge automatico)
      loadEntityData('destinazioni', true),
      loadEntityData('zone', true),
      loadEntityData('esperienze', true),
      loadEntityData('pacchetti', true),
      loadEntityData('hotel', true),

      // Entità solo tech (no copy)
      loadEntityData('voli', false),
      loadEntityData('itinerario', false),
      loadEntityData('costi_accessori', false),
      loadEntityData('extra', false)
    ]);

    console.log('✅ All database entities loaded successfully!');

    return {
      destinazioni,
      zone,
      esperienze,
      pacchetti,
      hotel,
      voli,
      itinerario,
      costi_accessori,
      extra, // Sostituisce plus

      // Backward compatibility (deprecato)
      plus: extra, // Alias per compatibilità con codice esistente
      viaggi: [] // Vuoto, entità obsoleta
    };
  } catch (error) {
    console.error('❌ Errore nel caricamento dei dati:', error);
    throw error;
  }
};