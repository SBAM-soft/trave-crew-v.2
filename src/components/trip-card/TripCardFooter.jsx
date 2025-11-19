import PropTypes from 'prop-types';
import PriceDisplay from '../ui/PriceDisplay';
import styles from './TripCardFooter.module.css';

/**
 * TripCardFooter - Footer della TripCard con prezzo e azioni
 *
 * Props:
 * - price: Prezzo del viaggio
 * - buttonLabel: Etichetta del bottone (default: "Vedi dettagli")
 * - onButtonClick: Callback al click del bottone
 * - expanded: Stato espansione (per cambiare label del bottone)
 */
function TripCardFooter({
  price,
  buttonLabel,
  onButtonClick,
  expanded = false
}) {
  const defaultLabel = expanded ? '▲ Chiudi itinerario' : '▼ Vedi itinerario';
  const label = buttonLabel || defaultLabel;

  return (
    <div className={styles.footer}>
      <PriceDisplay
        amount={price}
        label="da"
        suffix="/ persona"
        size="md"
        variant="primary"
      />
      <button
        className={styles.button}
        onClick={onButtonClick}
      >
        {label}
      </button>
    </div>
  );
}

TripCardFooter.propTypes = {
  price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  buttonLabel: PropTypes.string,
  onButtonClick: PropTypes.func,
  expanded: PropTypes.bool,
};

export default TripCardFooter;
