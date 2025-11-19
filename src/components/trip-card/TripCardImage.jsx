import PropTypes from 'prop-types';
import Badge from '../ui/Badge';
import styles from './TripCardImage.module.css';

/**
 * TripCardImage - Componente per l'immagine della TripCard con badges
 *
 * Props:
 * - imageUrl: URL dell'immagine
 * - imageAlt: Testo alternativo per l'immagine
 * - badges: Array di oggetti badge { label, variant }
 */
function TripCardImage({ imageUrl, imageAlt, badges = [] }) {
  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';
  };

  return (
    <div className={styles.imageContainer}>
      <img
        src={imageUrl}
        alt={imageAlt}
        className={styles.image}
        onError={handleImageError}
      />
      {badges.length > 0 && (
        <div className={styles.badges}>
          {badges.map((badge, index) => (
            <Badge key={index} variant={badge.variant} size="sm">
              {badge.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

TripCardImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  imageAlt: PropTypes.string.isRequired,
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['success', 'danger', 'info', 'warning', 'default']),
    })
  ),
};

export default TripCardImage;
