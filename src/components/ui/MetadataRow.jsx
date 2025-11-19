import PropTypes from 'prop-types';
import styles from './MetadataRow.module.css';

/**
 * MetadataRow - Componente per visualizzare metadata con icone
 *
 * Props:
 * - items: Array di oggetti { icon, label, value }
 * - separator: Separatore tra gli elementi (default: '•')
 * - size: Dimensione (sm, md, lg)
 */
function MetadataRow({ items, separator = '•', size = 'md', className = '' }) {
  const sizeClass = styles[`metadata--${size}`];

  return (
    <div className={`${styles.metadataRow} ${sizeClass} ${className}`}>
      {items.map((item, index) => (
        <div key={index} className={styles.metadataGroup}>
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          {item.label && <span className={styles.label}>{item.label}</span>}
          <span className={styles.value}>{item.value}</span>
          {index < items.length - 1 && separator && (
            <span className={styles.separator}>{separator}</span>
          )}
        </div>
      ))}
    </div>
  );
}

MetadataRow.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      label: PropTypes.string,
      value: PropTypes.node.isRequired,
    })
  ).isRequired,
  separator: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default MetadataRow;
