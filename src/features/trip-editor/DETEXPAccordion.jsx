import { useState } from 'react';
import PropTypes from 'prop-types';
import MediaSlider from './MediaSlider';
import PlusSelector from './PlusSelector';
import LikeDislikeButtons from './LikeDislikeButtons';
import CostSummary from './CostSummary';
import { DISPONIBILE_PLUS, MOCK_MEDIA } from '../../core/utils/mockData';
import styles from './DETEXPAccordion.module.css';

/**
 * DETEXP Details accordion - Shows detailed experience info (nested accordion)
 * Replaces DETEXP modal with integrated nested accordion
 */
function DETEXPAccordion({ exp, isOpen, onToggle, onLike, onDislike }) {
  const [selectedPlus, setSelectedPlus] = useState([]);

  // Robust validation - prevent crash if exp is invalid
  if (!exp || !exp.nome) {
    return (
      <div className={styles.errorContent}>
        <p>Le informazioni per questa esperienza non sono disponibili.</p>
      </div>
    );
  }

  // Formatta descrizione con paragrafi
  const formatDescription = (desc) => {
    if (!desc) return ['Un\'esperienza indimenticabile che ti lascerà ricordi per tutta la vita.'];
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

  // TODO: In futuro collegare a dati reali dal CSV plus.csv e media
  const disponibile_plus = DISPONIBILE_PLUS;
  const media = MOCK_MEDIA;

  const handlePlusChange = (newSelectedPlus) => {
    setSelectedPlus(newSelectedPlus);
  };

  const handleLike = () => {
    onLike();
  };

  const handleDislike = () => {
    onDislike();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.detexpAccordion}>
      {/* Header con titolo */}
      <div className={styles.header}>
        <h4 className={styles.title}>{exp.nome}</h4>
        <button
          className={styles.closeButton}
          onClick={onToggle}
          aria-label="Chiudi dettagli"
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

        {/* Intro */}
        <p className={styles.intro}>
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
            <h5 className={styles.sectionTitle}>ℹ️ Informazioni</h5>
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
          <h5 className={styles.sectionTitle}>📖 L'esperienza</h5>
          <div className={styles.description}>
            {formatDescription(exp.descrizione).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Cosa include */}
        {infoIncluse.length > 0 && (
          <div className={styles.section}>
            <h5 className={styles.sectionTitle}>✅ Cosa include</h5>
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
            <h5 className={styles.sectionTitle}>❌ Cosa NON include</h5>
            <ul className={styles.infoList}>
              {infoNonIncluse.map((info, i) => (
                <li key={i}>✗ {info}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Plus Selector */}
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>✨ Personalizza l'esperienza</h5>
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
            onLike={handleLike}
            onDislike={handleDislike}
          />
        </div>
      </div>
    </div>
  );
}

DETEXPAccordion.propTypes = {
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
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
};

export default DETEXPAccordion;
