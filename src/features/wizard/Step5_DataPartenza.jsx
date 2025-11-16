import { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Step5_DataPartenza.module.css';

function Step5_DataPartenza({ value, onChange }) {
  return (
    <div className={styles.step}>
      <h2 className={styles.title}>Quando vuoi partire?</h2>
      <p className={styles.subtitle}>
        Scegli una data di partenza indicativa (opzionale)
      </p>

      <div className={styles.dateContainer}>
        <div className={styles.dateIcon}>📅</div>
        
        <input
          type="date"
          className={styles.dateInput}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />

        <p className={styles.dateNote}>
          Puoi modificare la data in qualsiasi momento
        </p>
      </div>

      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon}>🚧</div>
        <h3 className={styles.placeholderTitle}>Funzionalità in sviluppo</h3>
        <p className={styles.placeholderText}>
          In futuro potrai:
        </p>
        <ul className={styles.featuresList}>
          <li>📆 Vedere le date consigliate in base alla destinazione</li>
          <li>🌤️ Scegliere in base al clima migliore</li>
          <li>💰 Trovare i periodi più economici</li>
          <li>👥 Vedere quando partono altri viaggiatori</li>
        </ul>
      </div>

      <div className={styles.skipNote}>
        💡 Puoi saltare questo step e decidere la data dopo
      </div>
    </div>
  );
}

Step5_DataPartenza.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default memo(Step5_DataPartenza);