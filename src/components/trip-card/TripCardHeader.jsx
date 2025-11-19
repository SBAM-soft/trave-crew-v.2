import PropTypes from 'prop-types';
import MetadataRow from '../ui/MetadataRow';
import styles from './TripCardHeader.module.css';

/**
 * TripCardHeader - Header della TripCard con titolo e metadata
 *
 * Props:
 * - title: Titolo del viaggio
 * - metadata: Array di oggetti metadata { icon, value }
 */
function TripCardHeader({ title, metadata = [] }) {
  return (
    <div className={styles.header}>
      <h3 className={styles.title}>{title}</h3>
      {metadata.length > 0 && (
        <MetadataRow items={metadata} size="sm" className={styles.meta} />
      )}
    </div>
  );
}

TripCardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  metadata: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      value: PropTypes.node.isRequired,
    })
  ),
};

export default TripCardHeader;
