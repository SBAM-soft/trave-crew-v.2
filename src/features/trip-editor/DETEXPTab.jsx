import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import TabView from '../../shared/TabView';
import MediaSlider from './MediaSlider';
import PlusSelector from './PlusSelector';
import LikeDislikeButtons from './LikeDislikeButtons';
import CostSummary from './CostSummary';
import styles from './DETEXPTab.module.css';

/**
 * DETEXP Tab - Fullscreen tab showing experience details
 */
function DETEXPTab({ exp, onClose }) {
  const [selectedPlus, setSelectedPlus] = useState([]);

  if (!exp || !exp.nome) {
    return (
      <TabView isOpen={true} onClose={onClose} title="Esperienza" zIndex={1100}>
        <div className={styles.error}>
          <p>Le informazioni per questa esperienza non sono disponibili.</p>
        </div>
      </TabView>
    );
  }

  const formatDescription = (desc) => {
    if (!desc) return ['Un\'esperienza indimenticabile che ti lascerà ricordi per tutta la vita.'];
    const paragraphs = desc.split('.').filter(p => p.trim().length > 0);
    return paragraphs.map(p => p.trim() + '.');
  };

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

  const infoGenerali = [];
  if (exp.durata) infoGenerali.push({ icon: '⏱️', label: 'Durata', value: exp.durata });
  if (exp.difficolta) infoGenerali.push({ icon: '🚶', label: 'Difficoltà', value: `${exp.difficolta}/3` });

  const disponibile_plus = [
    { id: 'plus1', nome: 'Extra premium', prezzo: 25 },
    { id: 'plus2', nome: 'Fotografo professionista', prezzo: 60 }
  ];

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

  const handleLike = () => {
    toast.success('Esperienza confermata!');
    onClose();
  };

  const handleDislike = () => {
    toast.info('Esperienza rifiutata');
    onClose();
  };

  return (
    <TabView
      isOpen={true}
      onClose={onClose}
      title={exp.nome}
      zIndex={1100}
    >
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
          onLike={handleLike}
          onDislike={handleDislike}
        />
      </div>
    </TabView>
  );
}

DETEXPTab.propTypes = {
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
  onClose: PropTypes.func.isRequired,
};

export default DETEXPTab;
