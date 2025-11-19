import PropTypes from 'prop-types';
import styles from './TripCardInfo.module.css';

/**
 * TripCardInfo - Informazioni del viaggio (età, genere, etc)
 *
 * Props:
 * - items: Array di oggetti info { label, value }
 */
function TripCardInfo({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <div className={styles.info}>
      {items.map((item, index) => (
        <div key={index} className={styles.infoItem}>
          <span className={styles.infoLabel}>{item.label}:</span>
          <span className={styles.infoValue}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

TripCardInfo.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.node.isRequired,
    })
  ),
};

export default TripCardInfo;
