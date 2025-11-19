import PropTypes from 'prop-types';
import styles from './Timeline.module.css';

/**
 * Timeline - Componente timeline generico riusabile
 *
 * Props:
 * - items: Array di oggetti timeline { title, description, icon, color, meta }
 * - variant: Stile della timeline (vertical, horizontal)
 * - showConnector: Mostra linea connettrice tra gli elementi
 */
function Timeline({ items, variant = 'vertical', showConnector = true, className = '' }) {
  const variantClass = styles[`timeline--${variant}`];

  return (
    <div className={`${styles.timeline} ${variantClass} ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={index}
            className={`${styles.timelineItem} ${isLast ? styles.last : ''}`}
          >
            {/* Connector line */}
            {showConnector && !isLast && (
              <div
                className={styles.connector}
                style={{ borderColor: item.color || '#d1d5db' }}
              />
            )}

            {/* Marker */}
            <div
              className={styles.marker}
              style={{ backgroundColor: item.color || '#6b7280' }}
            >
              {item.icon && <span className={styles.markerIcon}>{item.icon}</span>}
            </div>

            {/* Content */}
            <div className={styles.content}>
              <h5 className={styles.title}>{item.title}</h5>
              {item.description && (
                <p className={styles.description}>{item.description}</p>
              )}
              {item.meta && (
                <div className={styles.meta}>{item.meta}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.string,
      color: PropTypes.string,
      meta: PropTypes.node,
    })
  ).isRequired,
  variant: PropTypes.oneOf(['vertical', 'horizontal']),
  showConnector: PropTypes.bool,
  className: PropTypes.string,
};

export default Timeline;
