import { useState } from 'prop-types';
import PropTypes from 'prop-types';
import styles from './FreeDaySelector.module.css';

/**
 * Componente per selezionare il numero di giorni liberi con + e -
 */
function FreeDaySelector({ onConfirm, onCancel }) {
  const [days, setDays] = useState(1);

  const handleIncrement = () => {
    if (days < 10) { // Max 10 giorni liberi
      setDays(days + 1);
    }
  };

  const handleDecrement = () => {
    if (days > 1) { // Min 1 giorno
      setDays(days - 1);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(days);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={styles.selector}>
      <div className={styles.header}>
        <h3 className={styles.title}>🏖️ Quanti giorni liberi vuoi aggiungere?</h3>
        <p className={styles.subtitle}>Giorni per rilassarti ed esplorare in autonomia</p>
      </div>

      <div className={styles.counter}>
        <button
          className={styles.button}
          onClick={handleDecrement}
          disabled={days <= 1}
          type="button"
        >
          −
        </button>

        <div className={styles.value}>
          <span className={styles.number}>{days}</span>
          <span className={styles.label}>{days === 1 ? 'giorno' : 'giorni'}</span>
        </div>

        <button
          className={styles.button}
          onClick={handleIncrement}
          disabled={days >= 10}
          type="button"
        >
          +
        </button>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.cancelButton}
          onClick={handleCancel}
          type="button"
        >
          Annulla
        </button>
        <button
          className={styles.confirmButton}
          onClick={handleConfirm}
          type="button"
        >
          Conferma
        </button>
      </div>
    </div>
  );
}

FreeDaySelector.propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func
};

export default FreeDaySelector;
