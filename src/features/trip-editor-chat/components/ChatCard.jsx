import PropTypes from 'prop-types';
import styles from './ChatCard.module.css';

/**
 * Card per visualizzare pacchetti o zone
 */
function ChatCard({ card, onSelect, onDetails }) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect({ action: 'select', packageId: card.id, zoneCode: card.zoneCode });
    }
  };

  const handleDetails = () => {
    if (onDetails) {
      onDetails({ action: 'details', packageId: card.id, zoneCode: card.zoneCode });
    }
  };

  return (
    <div className={styles.card}>
      {card.image && (
        <div className={styles.imageContainer}>
          <img src={card.image} alt={card.name} className={styles.image} />
          {card.rating && (
            <div className={styles.rating}>
              ⭐ {card.rating.toFixed(1)}
              {card.reviewCount > 0 && (
                <span className={styles.reviewCount}> ({card.reviewCount})</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className={styles.content}>
        <h3 className={styles.title}>{card.name}</h3>

        {card.description && (
          <p className={styles.description}>{card.description}</p>
        )}

        {card.price !== undefined && (
          <div className={styles.price}>
            <span className={styles.priceAmount}>€{card.price}</span>
            <span className={styles.priceLabel}>/persona</span>
          </div>
        )}

        {card.duration && (
          <div className={styles.duration}>
            🕐 {card.duration} {card.duration === 1 ? 'giorno' : 'giorni'}
          </div>
        )}

        {card.highlights && card.highlights.length > 0 && (
          <ul className={styles.highlights}>
            {card.highlights.slice(0, 3).map((highlight, idx) => (
              <li key={idx}>✓ {highlight}</li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.actions}>
        {onDetails && (
          <button
            className={styles.detailsButton}
            onClick={handleDetails}
            type="button"
          >
            👀 Dettagli
          </button>
        )}
        <button
          className={styles.selectButton}
          onClick={handleSelect}
          type="button"
        >
          ✅ Scelgo questo
        </button>
      </div>
    </div>
  );
}

ChatCard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    price: PropTypes.number,
    duration: PropTypes.number,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    highlights: PropTypes.arrayOf(PropTypes.string),
    zoneCode: PropTypes.string
  }).isRequired,
  onSelect: PropTypes.func,
  onDetails: PropTypes.func
};

export default ChatCard;
