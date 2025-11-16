import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MediaSlider from './MediaSlider';
import PlusSelector from './PlusSelector';
import LikeDislikeButtons from './LikeDislikeButtons';
import CostSummary from './CostSummary';
import styles from './DETEXP.module.css';

function DETEXP({ exp, onLike, onDislike, onClose }) {
  const [selectedPlus, setSelectedPlus] = useState([]);

  // Keyboard navigation: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Robust validation - prevent crash if exp is invalid
  if (!exp || !exp.nome) {
    return (
      <div
        className={styles.overlay}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detexp-error-title"
      >
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 id="detexp-error-title" className={styles.title}>
              Esperienza non disponibile
            </h2>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Chiudi finestra"
            >
              ✕
            </button>
          </div>
          <div className={styles.content}>
            <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Le informazioni per questa esperienza non sono disponibili.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formatta descrizione con paragrafi
  const formatDescription = (desc) => {
    if (!desc) return ['Un\'esperienza indimenticabile che ti lascerà ricordi per tutta la vita.'];
    // Se la descrizione contiene punti, dividi in paragrafi
    const paragraphs = desc.split('.').filter(p => p.trim().length > 0);
    return paragraphs.map(p => p.trim() + '.');
  };

  // Separa info incluse/non incluse
  const infoIncluse = [];
  const infoNonIncluse = [];

  if (exp.include) {
    exp.include.split(';').forEach(item => {
      if (item.trim()) infoIncluse.push(item.trim());
    });
  }

  if (exp.nonInclude) {
    exp.nonInclude.split(';').forEach(item => {
      if (item.trim()) infoNonIncluse.push(item.trim());
    });
  }

  // Info generali
  const infoGenerali = [];
  if (exp.durata) infoGenerali.push({ icon: '⏱️', label: 'Durata', value: exp.durata });
  if (exp.difficolta) infoGenerali.push({ icon: '🚶', label: 'Difficoltà', value: `${exp.difficolta}/3` });

  // Mock plus (in futuro si possono caricare dal CSV plus.csv)
  const disponibile_plus = [
    { id: 'plus1', nome: 'Extra premium', prezzo: 25 },
    { id: 'plus2', nome: 'Fotografo professionista', prezzo: 60 }
  ];

  // Mock immagini (in futuro si possono collegare ai media)
  const media = {
    video: null,
    images: [
      'https://images.unsplash.com/photo-1563492065211-4f7e3a4c9c3e?w=800',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800'
    ]
  };

  const handlePlusChange = (newSelectedPlus) => {
    setSelectedPlus(newSelectedPlus);
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detexp-title"
      aria-describedby="detexp-intro"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header con close button */}
        <div className={styles.header}>
          <h2 id="detexp-title" className={styles.title}>
            {exp.nome}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Chiudi dettagli esperienza"
          >
            ✕
          </button>
        </div>

        {/* Content scrollabile */}
        <div className={styles.content}>
          {/* Tags */}
          {exp.tags && exp.tags.length > 0 && (
            <div className={styles.tags}>
              {exp.tags.map((tag, i) => (
                <span key={i} className={styles.tag}>{tag.trim()}</span>
              ))}
            </div>
          )}

          {/* Intro/Hook */}
          <p id="detexp-intro" className={styles.intro}>
            {exp.descrizione ? exp.descrizione.split('.')[0] + '.' :
             'Un\'esperienza unica che renderà il tuo viaggio indimenticabile.'}
          </p>

          {/* Media Slider */}
          <MediaSlider
            videoUrl={media.video}
            images={media.images}
          />

          {/* Info Generali */}
          {infoGenerali.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>ℹ️ Informazioni</h3>
              <div className={styles.infoGrid}>
                {infoGenerali.map((info, i) => (
                  <div key={i} className={styles.infoBadge}>
                    <span className={styles.infoBadgeIcon}>{info.icon}</span>
                    <div className={styles.infoBadgeContent}>
                      <span className={styles.infoBadgeLabel}>{info.label}</span>
                      <span className={styles.infoBadgeValue}>{info.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descrizione dettagliata */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📖 L'esperienza</h3>
            <div className={styles.description}>
              {formatDescription(exp.descrizione).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Cosa include */}
          {infoIncluse.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>✅ Cosa include</h3>
              <ul className={styles.infoList}>
                {infoIncluse.map((info, i) => (
                  <li key={i}>✓ {info}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cosa NON include */}
          {infoNonIncluse.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>❌ Cosa NON include</h3>
              <ul className={styles.infoList}>
                {infoNonIncluse.map((info, i) => (
                  <li key={i}>✗ {info}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Plus Selector */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>✨ Personalizza l'esperienza</h3>
            <PlusSelector
              availablePlus={disponibile_plus}
              selectedPlus={selectedPlus}
              onChange={handlePlusChange}
            />
          </div>

          {/* Cost Summary */}
          <div className={styles.section}>
            <CostSummary
              baseCost={exp.prezzo || 0}
              selectedPlus={selectedPlus}
            />
          </div>

          {/* Like/Dislike Buttons */}
          <div className={styles.section}>
            <LikeDislikeButtons
              onLike={onLike}
              onDislike={onDislike}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

DETEXP.propTypes = {
  exp: PropTypes.shape({
    codice: PropTypes.string,
    nome: PropTypes.string.isRequired,
    descrizione: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    durata: PropTypes.string,
    difficolta: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    include: PropTypes.string,
    nonInclude: PropTypes.string,
    prezzo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DETEXP;
