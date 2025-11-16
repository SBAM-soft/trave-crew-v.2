/**
 * Helper per generare media basati sulle esperienze
 *
 * TODO: In futuro collegare a un database media reale o CDN
 * Per ora genera placeholder basati sul tipo di esperienza
 */

/**
 * Mappa tipi di esperienza a keywords per immagini
 */
const EXPERIENCE_KEYWORDS = {
  'trekking': ['hiking', 'mountain', 'trail', 'nature'],
  'mare': ['beach', 'ocean', 'tropical', 'sea'],
  'tempio': ['temple', 'pagoda', 'buddhist', 'shrine'],
  'cultura': ['culture', 'traditional', 'heritage', 'historical'],
  'food': ['food', 'cuisine', 'restaurant', 'cooking'],
  'mercato': ['market', 'street food', 'bazaar', 'shopping'],
  'diving': ['diving', 'underwater', 'coral', 'snorkeling'],
  'elefanti': ['elephant', 'safari', 'wildlife', 'nature'],
  'cascata': ['waterfall', 'jungle', 'nature', 'river'],
  'isola': ['island', 'tropical', 'beach', 'paradise'],
  'città': ['city', 'urban', 'skyline', 'street'],
  'natura': ['nature', 'jungle', 'forest', 'wilderness'],
  'avventura': ['adventure', 'extreme', 'action', 'thrill'],
  'relax': ['spa', 'wellness', 'relaxation', 'resort'],
  'notturno': ['night', 'evening', 'sunset', 'nightlife'],
};

/**
 * Estrae keywords dal nome/descrizione dell'esperienza
 */
function extractKeywords(exp) {
  const text = `${exp.nome || ''} ${exp.descrizione || ''}`.toLowerCase();
  const keywords = [];

  // Cerca keywords corrispondenti
  for (const [key, values] of Object.entries(EXPERIENCE_KEYWORDS)) {
    if (text.includes(key) || values.some(v => text.includes(v))) {
      keywords.push(...values);
      break; // Usa solo il primo match
    }
  }

  // Default se non trova keywords
  if (keywords.length === 0) {
    keywords.push('travel', 'adventure', 'vacation');
  }

  return keywords;
}

/**
 * Genera URL immagini da Unsplash (placeholder di alta qualità)
 * In produzione, sostituire con CDN proprio o database media
 */
function generateUnsplashUrl(keyword, index, width = 800, height = 600) {
  // Unsplash Source API per placeholder di qualità
  // In futuro: sostituire con proprio CDN o database
  return `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(keyword)}&sig=${index}`;
}

/**
 * Genera media per un'esperienza
 *
 * @param {Object} exp - Oggetto esperienza
 * @param {Object} options - Opzioni { count, includeVideo, destinazione }
 * @returns {Array} Array di oggetti media { type, url, caption }
 */
export function generateMediaForExperience(exp, options = {}) {
  const {
    count = 5,
    includeVideo = true,
    destinazione = '',
  } = options;

  if (!exp) return [];

  const keywords = extractKeywords(exp);
  const media = [];

  // Genera immagini
  const imageCount = includeVideo ? count - 1 : count;
  for (let i = 0; i < imageCount; i++) {
    const keyword = keywords[i % keywords.length];
    media.push({
      type: 'image',
      url: generateUnsplashUrl(keyword, exp.id + i),
      caption: `${exp.nome} - Vista ${i + 1}`,
      thumbnail: generateUnsplashUrl(keyword, exp.id + i, 400, 300),
    });
  }

  // Aggiungi un video placeholder se richiesto
  if (includeVideo) {
    // Video placeholder - in futuro collegare a database video reali
    media.push({
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
      caption: `${exp.nome} - Video Tour`,
      thumbnail: generateUnsplashUrl(keywords[0], exp.id + 999, 400, 300),
    });
  }

  return media;
}

/**
 * Carica media da un database (futuro)
 *
 * Questa funzione sarà usata quando avremo un database media reale
 * Per ora ritorna i placeholder generati
 */
export async function loadMediaForExperience(expCode, destinazione = '') {
  // TODO: Implementare chiamata API/database per media reali
  // Per ora usa i placeholder

  // Simula un'esperienza base con il codice
  const fakeExp = {
    id: expCode,
    nome: `Esperienza ${expCode}`,
    descrizione: '',
  };

  return generateMediaForExperience(fakeExp, {
    count: 6,
    includeVideo: true,
    destinazione,
  });
}

/**
 * Valida URL media
 */
export function isValidMediaUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ottieni URL thumbnail per un media
 */
export function getMediaThumbnail(media) {
  if (media.thumbnail) return media.thumbnail;
  if (media.type === 'image') return media.url;
  // Per video, genera un placeholder
  return generateUnsplashUrl('video', 0, 400, 300);
}
