import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './ChatExperienceSlider.module.css';

/**
 * Slider orizzontale per mostrare 3 esperienze alla volta
 * Con gesture touch per mobile
 */
function ChatExperienceSlider({ experiences, zone, onSelect }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const sliderRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minima distanza per swipe (in px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Scroll lo slider
      const slider = sliderRef.current;
      if (slider) {
        const scrollAmount = slider.offsetWidth * 0.8;
        slider.scrollBy({
          left: isLeftSwipe ? scrollAmount : -scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleSelect = (experience, index) => {
    setSelectedIndex(index);

    // Delay per animazione
    setTimeout(() => {
      onSelect(experience);
    }, 300);
  };

  if (!experiences || experiences.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Nessuna esperienza disponibile</p>
      </div>
    );
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.header}>
        <span className={styles.zoneName}>📍 {zone?.name}</span>
        <span className={styles.count}>
          {experiences.length} {experiences.length === 1 ? 'esperienza' : 'esperienze'}
        </span>
      </div>

      <div
        ref={sliderRef}
        className={styles.slider}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {experiences.map((exp, index) => (
          <div
            key={exp.id || index}
            className={`${styles.card} ${selectedIndex === index ? styles.selected : ''}`}
            onClick={() => handleSelect(exp, index)}
          >
            <div className={styles.cardHeader}>
              <span className={styles.emoji}>{exp.emoji || '🎯'}</span>
              <span className={styles.difficulty}>
                {'⭐'.repeat(exp.difficolta || 1)}
              </span>
            </div>

            <h3 className={styles.title}>{exp.nome}</h3>

            <p className={styles.description}>
              {exp.descrizione?.substring(0, 100) || 'Esperienza unica'}
              {exp.descrizione?.length > 100 && '...'}
            </p>

            <div className={styles.cardFooter}>
              <div className={styles.meta}>
                <span className={styles.duration}>
                  🕐 {exp.slot || 1} {exp.slot === 1 ? 'giorno' : 'giorni'}
                </span>
                {exp.prezzo > 0 && (
                  <span className={styles.price}>
                    💰 €{exp.prezzo}
                  </span>
                )}
              </div>

              <button className={styles.selectBtn}>
                Scegli
              </button>
            </div>

            {selectedIndex === index && (
              <div className={styles.selectedOverlay}>
                <span className={styles.checkmark}>✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.scrollHint}>
        ← Scorri per vedere altre esperienze →
      </div>
    </div>
  );
}

ChatExperienceSlider.propTypes = {
  experiences: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      nome: PropTypes.string.isRequired,
      descrizione: PropTypes.string,
      emoji: PropTypes.string,
      difficolta: PropTypes.number,
      slot: PropTypes.number,
      prezzo: PropTypes.number
    })
  ).isRequired,
  zone: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string
  }),
  onSelect: PropTypes.func.isRequired
};

export default ChatExperienceSlider;
