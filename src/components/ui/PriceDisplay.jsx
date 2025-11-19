import PropTypes from 'prop-types';
import styles from './PriceDisplay.module.css';

/**
 * PriceDisplay - Componente per visualizzare prezzi in modo consistente
 *
 * Props:
 * - amount: Importo del prezzo
 * - label: Etichetta opzionale (es. "da", "a partire da")
 * - suffix: Suffisso opzionale (es. "/ persona", "/ notte")
 * - size: Dimensione del prezzo (sm, md, lg)
 * - variant: Stile del prezzo (primary, secondary)
 */
function PriceDisplay({
  amount,
  label = '',
  suffix = '',
  size = 'md',
  variant = 'primary',
  className = ''
}) {
  const sizeClass = styles[`price--${size}`];
  const variantClass = styles[`price--${variant}`];

  // Formatta il prezzo
  const formattedAmount = typeof amount === 'number'
    ? amount.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : amount;

  return (
    <div className={`${styles.priceContainer} ${sizeClass} ${variantClass} ${className}`}>
      {label && <span className={styles.priceLabel}>{label}</span>}
      <span className={styles.priceAmount}>€{formattedAmount}</span>
      {suffix && <span className={styles.priceSuffix}>{suffix}</span>}
    </div>
  );
}

PriceDisplay.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  label: PropTypes.string,
  suffix: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary']),
  className: PropTypes.string,
};

export default PriceDisplay;
