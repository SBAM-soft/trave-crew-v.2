import PropTypes from 'prop-types';
import styles from './Badge.module.css';

/**
 * Badge - Componente riusabile per badge colorati
 *
 * Varianti disponibili:
 * - success: Verde (es. disponibile)
 * - danger: Rosso (es. completo)
 * - info: Blu (es. in corso)
 * - warning: Giallo (es. attenzione)
 * - default: Grigio
 */
function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantClass = styles[`badge--${variant}`] || styles['badge--default'];
  const sizeClass = styles[`badge--${size}`];

  return (
    <span className={`${styles.badge} ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'danger', 'info', 'warning', 'default']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Badge;
