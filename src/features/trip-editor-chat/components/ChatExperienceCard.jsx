import { useState } from 'react';
import PropTypes from 'prop-types';
import ExperienceDetailFullscreen from './ExperienceDetailFullscreen';
import MarkdownText from './MarkdownText';
import styles from './ChatExperienceCard.module.css';

/**
 * Card per mostrare un'esperienza singola con azioni like/dislike
 * Stile "Tinder-like" per swipe attraverso esperienze
 */
function ChatExperienceCard({ experience, zone, progress, onLike, onDislike, disabled = false }) {
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Renderizza rating con stelle
  const renderRating = (rating) => {
    if (!rating) return null;
    const stars = Math.round(rating * 2) / 2; // Arrotonda a .0 o .5
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;

    return (
      <div className={styles.rating}>
        <div className={styles.stars}>
          {[...Array(fullStars)].map((_, i) => (
            <span key={`full-${i}`} className={styles.star}>⭐</span>
          ))}
          {hasHalfStar && <span className={styles.starHalf}>⭐</span>}
          {[...Array(5 - Math.ceil(stars))].map((_, i) => (
            <span key={`empty-${i}`} className={styles.starEmpty}>☆</span>
          ))}
        </div>
        <span className={styles.ratingText}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Determina se mostrare badge "Popular" o "Best Seller"
  const getBadge = () => {
    if (!experience.rating) return null;
    if (experience.rating >= 4.7) return { text: '🏆 Best Seller', className: styles.badgeBest };
    if (experience.rating >= 4.3) return { text: '⭐ Popular', className: styles.badgePopular };
    return null;
  };

  const handleLike = () => {
    if (disabled) return;
    if (onLike) {
      onLike({ action: 'like', experience, experienceId: experience.id || experience.code });
    }
  };

  const handleDislike = () => {
    if (disabled) return;
    if (onDislike) {
      onDislike({ action: 'dislike', experience, experienceId: experience.id || experience.code });
    }
  };

  const handleShowDetails = () => {
    if (disabled) return;
    setShowFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setShowFullscreen(false);
  };

  const handleFullscreenLike = () => {
    setShowFullscreen(false);
    handleLike();
  };

  const handleFullscreenDislike = () => {
    setShowFullscreen(false);
    handleDislike();
  };

  // Icona difficoltà
  const getDifficultyIcon = (level) => {
    if (level <= 1) return '🟢 Facile';
    if (level === 2) return '🟡 Moderata';
    return '🔴 Impegnativa';
  };

  // Prezzo formattato
  const priceText = experience.prezzo
    ? `€${experience.prezzo.toFixed(2)} / persona`
    : 'Prezzo da definire';

  const badge = getBadge();

  return (
    <>
      <div className={styles.card}>
        {/* Immagine principale */}
        {experience.immagini && experience.immagini.length > 0 ? (
          <div className={styles.imageContainer}>
            <img
              src={experience.immagini[0]}
              alt={experience.nome}
              className={styles.image}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className={styles.imagePlaceholder} style={{ display: 'none' }}>
              <span className={styles.placeholderEmoji}>{experience.emoji || '🎯'}</span>
            </div>
            {/* Badge Best Seller / Popular */}
            {badge && (
              <div className={`${styles.badge} ${badge.className}`}>
                {badge.text}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderEmoji}>{experience.emoji || '🎯'}</span>
            {/* Badge Best Seller / Popular */}
            {badge && (
              <div className={`${styles.badge} ${badge.className}`}>
                {badge.text}
              </div>
            )}
          </div>
        )}

        {/* Contenuto */}
        <div className={styles.content}>
          {/* Titolo */}
          <h3 className={styles.title}>
            {experience.emoji && <span className={styles.emoji}>{experience.emoji}</span>}
            {experience.nome}
          </h3>

          {/* Rating con stelle */}
          {experience.rating && renderRating(experience.rating)}

          {/* Info rapide */}
          <div className={styles.quickInfo}>
            <span className={styles.infoItem}>
              ⏱️ {experience.durata || '1 giorno'}
            </span>
            <span className={styles.infoItem}>
              {getDifficultyIcon(experience.difficolta)}
            </span>
            {experience.tipo && (
              <span className={styles.infoItem}>
                🏷️ {experience.tipo}
              </span>
            )}
          </div>

          {/* Prezzo */}
          <div className={styles.price}>
            <span className={styles.priceValue}>{priceText}</span>
          </div>

          {/* Descrizione con markdown */}
          <div className={styles.description}>
            <MarkdownText>
              {experience.descrizione || experience.descrizioneEstesa || 'Esperienza da scoprire'}
            </MarkdownText>
          </div>

          {/* Preview "Incluso nel prezzo" */}
          {experience.incluso && experience.incluso.length > 0 && (
            <div className={styles.included}>
              <h4 className={styles.includedTitle}>✓ Incluso nel prezzo</h4>
              <ul className={styles.includedList}>
                {experience.incluso.slice(0, 3).map((item, idx) => (
                  <li key={idx} className={styles.includedItem}>
                    {item}
                  </li>
                ))}
                {experience.incluso.length > 3 && (
                  <li className={styles.includedMore}>
                    +{experience.incluso.length - 3} altri inclusi
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Tags / Interessi */}
          {experience.tags && experience.tags.length > 0 && (
            <div className={styles.tags}>
              {experience.tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Highlights */}
          {experience.highlights && experience.highlights.length > 0 && (
            <div className={styles.highlights}>
              <h4 className={styles.highlightsTitle}>✨ Highlights</h4>
              <ul className={styles.highlightsList}>
                {experience.highlights.slice(0, 3).map((highlight, idx) => (
                  <li key={idx} className={styles.highlightItem}>
                    • {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottone dettagli */}
          <button
            className={styles.detailsButton}
            onClick={handleShowDetails}
            disabled={disabled}
            type="button"
            style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            👀 Vedi tutti i dettagli
          </button>
        </div>

        {/* Azioni principali */}
        <div className={styles.actions}>
          <button
            className={styles.dislikeButton}
            onClick={handleDislike}
            disabled={disabled}
            type="button"
            title="Non mi interessa"
            style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            <span className={styles.actionIcon}>👎</span>
            <span className={styles.actionLabel}>Non mi interessa</span>
          </button>
          <button
            className={styles.likeButton}
            onClick={handleLike}
            disabled={disabled}
            type="button"
            title="Aggiungi al viaggio"
            style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            <span className={styles.actionIcon}>❤️</span>
            <span className={styles.actionLabel}>Mi piace!</span>
          </button>
        </div>
      </div>

      {/* Fullscreen modal per dettagli completi */}
      {showFullscreen && (
        <ExperienceDetailFullscreen
          experience={experience}
          onLike={handleFullscreenLike}
          onDislike={handleFullscreenDislike}
          onClose={handleCloseFullscreen}
        />
      )}
    </>
  );
}

ChatExperienceCard.propTypes = {
  experience: PropTypes.shape({
    id: PropTypes.string,
    code: PropTypes.string,
    nome: PropTypes.string.isRequired,
    descrizione: PropTypes.string,
    descrizioneEstesa: PropTypes.string,
    prezzo: PropTypes.number,
    durata: PropTypes.string,
    tipo: PropTypes.string,
    difficolta: PropTypes.number,
    emoji: PropTypes.string,
    immagini: PropTypes.arrayOf(PropTypes.string),
    highlights: PropTypes.arrayOf(PropTypes.string),
    incluso: PropTypes.arrayOf(PropTypes.string),
    nonIncluso: PropTypes.arrayOf(PropTypes.string),
    note: PropTypes.string,
    rating: PropTypes.number
  }).isRequired,
  zone: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string
  }),
  progress: PropTypes.shape({
    current: PropTypes.number,
    total: PropTypes.number
  }),
  onLike: PropTypes.func,
  onDislike: PropTypes.func,
  disabled: PropTypes.bool
};

export default ChatExperienceCard;
