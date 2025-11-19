import { useState, useEffect } from 'prop-types';
import PropTypes from 'prop-types';
import styles from './ExperienceDetailFullscreen.module.css';

/**
 * Vista fullscreen per dettagli esperienza con like/dislike
 * Stile scorrevole come una scheda prodotto
 */
function ExperienceDetailFullscreen({ experience, onLike, onDislike, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animazione entrata
    setTimeout(() => setIsVisible(true), 50);

    // Blocca scroll body
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose && onClose(), 300);
  };

  const handleLike = () => {
    setIsVisible(false);
    setTimeout(() => onLike && onLike(experience), 300);
  };

  const handleDislike = () => {
    setIsVisible(false);
    setTimeout(() => onDislike && onDislike(experience), 300);
  };

  // Estrai dati esperienza
  const {
    nome = 'Esperienza',
    descrizione = '',
    descrizioneEstesa = '',
    durata = '1 giorno',
    prezzo = 0,
    difficolta = 1,
    emoji = '🎯',
    immagini = [],
    highlights = [],
    incluso = [],
    nonIncluso = [],
    note = '',
    TIPO_ESPERIENZA = '',
    SLOT = 1
  } = experience;

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.container} ${isVisible ? styles.slideIn : ''}`}>
        {/* Header con close button */}
        <div className={styles.header}>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className={styles.content}>
          {/* Hero Image/Gallery */}
          {immagini.length > 0 && (
            <div className={styles.gallery}>
              <img
                src={immagini[0]}
                alt={nome}
                className={styles.heroImage}
              />
              {immagini.length > 1 && (
                <div className={styles.galleryIndicator}>
                  📷 {immagini.length} foto
                </div>
              )}
            </div>
          )}

          {/* Title & Quick Info */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <span className={styles.emoji}>{emoji}</span> {nome}
            </h1>

            <div className={styles.quickInfo}>
              <div className={styles.infoBadge}>
                ⏱️ {durata}
              </div>
              {TIPO_ESPERIENZA && (
                <div className={styles.infoBadge}>
                  🏷️ {TIPO_ESPERIENZA}
                </div>
              )}
              <div className={styles.infoBadge}>
                💪 Difficoltà: {'⭐'.repeat(difficolta)}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className={styles.priceSection}>
            <div className={styles.priceAmount}>€{prezzo}</div>
            <div className={styles.priceLabel}>per persona</div>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📖 Descrizione</h2>
            <p className={styles.description}>
              {descrizioneEstesa || descrizione}
            </p>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>✨ Highlights</h2>
              <ul className={styles.list}>
                {highlights.map((item, idx) => (
                  <li key={idx} className={styles.listItem}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Incluso */}
          {incluso.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>✅ Incluso</h2>
              <ul className={styles.list}>
                {incluso.map((item, idx) => (
                  <li key={idx} className={styles.listItem}>
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Non Incluso */}
          {nonIncluso.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>❌ Non Incluso</h2>
              <ul className={styles.list}>
                {nonIncluso.map((item, idx) => (
                  <li key={idx} className={styles.listItem}>
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Note */}
          {note && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>ℹ️ Note</h2>
              <p className={styles.note}>{note}</p>
            </div>
          )}

          {/* Spacer per i bottoni fissi */}
          <div className={styles.spacer}></div>
        </div>

        {/* Fixed bottom actions */}
        <div className={styles.actions}>
          <button
            className={styles.dislikeButton}
            onClick={handleDislike}
            type="button"
          >
            👎 Non mi interessa
          </button>
          <button
            className={styles.likeButton}
            onClick={handleLike}
            type="button"
          >
            ❤️ Mi piace!
          </button>
        </div>
      </div>
    </div>
  );
}

ExperienceDetailFullscreen.propTypes = {
  experience: PropTypes.shape({
    nome: PropTypes.string,
    descrizione: PropTypes.string,
    descrizioneEstesa: PropTypes.string,
    durata: PropTypes.string,
    prezzo: PropTypes.number,
    difficolta: PropTypes.number,
    emoji: PropTypes.string,
    immagini: PropTypes.arrayOf(PropTypes.string),
    highlights: PropTypes.arrayOf(PropTypes.string),
    incluso: PropTypes.arrayOf(PropTypes.string),
    nonIncluso: PropTypes.arrayOf(PropTypes.string),
    note: PropTypes.string,
    TIPO_ESPERIENZA: PropTypes.string,
    SLOT: PropTypes.number
  }).isRequired,
  onLike: PropTypes.func,
  onDislike: PropTypes.func,
  onClose: PropTypes.func
};

export default ExperienceDetailFullscreen;
