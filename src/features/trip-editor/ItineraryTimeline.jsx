import { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../shared/Button';
import styles from './ItineraryTimeline.module.css';

/**
 * Timeline spettacolare per visualizzare l'itinerario completo
 * con animazioni fluide e design accattivante
 */
function ItineraryTimeline({ filledBlocks, totalDays, onContinue, wizardData }) {
  const [visibleDays, setVisibleDays] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animazione progressiva - mostra i giorni uno alla volta
  useEffect(() => {
    if (currentIndex < totalDays) {
      const timer = setTimeout(() => {
        setVisibleDays(prev => [...prev, currentIndex + 1]);
        setCurrentIndex(prev => prev + 1);
      }, 300); // 300ms tra un giorno e l'altro

      return () => clearTimeout(timer);
    }
  }, [currentIndex, totalDays]);

  // Costruisce i dati della timeline
  const timelineData = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;

    if (day === 1) {
      return {
        day: 1,
        type: 'arrival',
        title: 'Arrivo',
        subtitle: wizardData.destinazioneNome || wizardData.destinazione || 'Destinazione',
        icon: '✈️',
        color: '#667eea'
      };
    }

    const block = filledBlocks.find(b => b.day === day);

    if (block && block.experience) {
      return {
        day,
        type: 'experience',
        title: block.experience.nome || block.experience.ESPERIENZE,
        subtitle: block.zona || block.experience.zona,
        description: block.experience.descrizione || block.experience.DESCRIZIONE,
        duration: block.experience.durata || `${block.experience.SLOT || 1} notti`,
        price: block.experience.prezzo || block.experience.PRX_PAX,
        difficulty: block.experience.difficolta || block.experience.DIFFICOLTA,
        icon: '🎯',
        color: '#10b981',
        image: block.experience.immagine
      };
    }

    return {
      day,
      type: 'free',
      title: 'Giorno libero',
      subtitle: 'Relax o esplorazione personale',
      icon: '🏖️',
      color: '#f59e0b'
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.title}>
            Il Tuo Itinerario di {totalDays} Giorni
          </h1>
          <p className={styles.subtitle}>
            Un viaggio indimenticabile ti aspetta in {wizardData.destinazioneNome || wizardData.destinazione}
          </p>
        </motion.div>

        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🗓️</span>
            <span className={styles.statValue}>{totalDays}</span>
            <span className={styles.statLabel}>Giorni</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🎯</span>
            <span className={styles.statValue}>{filledBlocks.length}</span>
            <span className={styles.statLabel}>Esperienze</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>👥</span>
            <span className={styles.statValue}>{wizardData.numeroPersone}</span>
            <span className={styles.statLabel}>Persone</span>
          </div>
        </motion.div>
      </div>

      <div className={styles.timeline}>
        <AnimatePresence>
          {timelineData.map((item, index) => {
            const isVisible = visibleDays.includes(item.day);
            if (!isVisible) return null;

            return (
              <motion.div
                key={item.day}
                className={`${styles.timelineItem} ${styles[item.type]}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
              >
                {/* Line connector */}
                {index < timelineData.length - 1 && (
                  <motion.div
                    className={styles.connector}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  />
                )}

                {/* Day marker */}
                <motion.div
                  className={styles.marker}
                  style={{ backgroundColor: item.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <span className={styles.markerIcon}>{item.icon}</span>
                  <span className={styles.markerDay}>Giorno {item.day}</span>
                </motion.div>

                {/* Content card */}
                <motion.div
                  className={styles.card}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                  }}
                >
                  {item.image && (
                    <div className={styles.cardImage}>
                      <img src={item.image} alt={item.title} />
                      <div className={styles.imageOverlay}>
                        <span className={styles.imageIcon}>{item.icon}</span>
                      </div>
                    </div>
                  )}

                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardSubtitle}>📍 {item.subtitle}</p>

                    {item.description && (
                      <p className={styles.cardDescription}>
                        {item.description.length > 100
                          ? `${item.description.substring(0, 100)}...`
                          : item.description}
                      </p>
                    )}

                    {item.type === 'experience' && (
                      <div className={styles.cardMeta}>
                        {item.duration && (
                          <span className={styles.metaBadge}>
                            ⏱️ {item.duration}
                          </span>
                        )}
                        {item.difficulty && (
                          <span className={styles.metaBadge}>
                            🚶 Difficoltà {item.difficulty}/3
                          </span>
                        )}
                        {item.price && (
                          <span className={styles.metaBadge}>
                            💰 €{item.price}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {currentIndex >= totalDays && (
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
          >
            Continua con la selezione Hotel ✨
          </Button>
        </motion.div>
      )}

      {/* Progress indicator */}
      <motion.div
        className={styles.progress}
        initial={{ width: 0 }}
        animate={{ width: `${(currentIndex / totalDays) * 100}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

ItineraryTimeline.propTypes = {
  filledBlocks: PropTypes.array.isRequired,
  totalDays: PropTypes.number.isRequired,
  onContinue: PropTypes.func.isRequired,
  wizardData: PropTypes.object.isRequired,
};

export default memo(ItineraryTimeline);
