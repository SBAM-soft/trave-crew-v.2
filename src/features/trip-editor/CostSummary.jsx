import { memo } from 'react';
import PropTypes from 'prop-types';
import { toPrice } from '../../core/utils/typeHelpers';
import styles from './CostSummary.module.css';

function CostSummary({ baseCost, selectedPlus = [] }) {
  // Calcolo costo plus totale (con conversione sicura)
  const plusTotal = selectedPlus.reduce((sum, plus) => sum + toPrice(plus.prezzo, 0), 0);

  // Costo finale (con conversione sicura)
  const totalCost = toPrice(baseCost, 0) + plusTotal;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>💰 Riepilogo Costi</h3>

      <div className={styles.costsBreakdown}>
        {/* Costo base esperienza */}
        <div className={styles.costRow}>
          <span className={styles.label}>Esperienza base</span>
          <span className={styles.value}>€{baseCost}</span>
        </div>

        {/* Plus selezionati */}
        {selectedPlus.length > 0 && (
          <>
            <div className={styles.divider}></div>
            
            {selectedPlus.map((plus, index) => (
              <div key={index} className={`${styles.costRow} ${styles.plusRow}`}>
                <span className={styles.plusLabel}>
                  <span className={styles.plusIcon}>✨</span>
                  {plus.nome}
                </span>
                <span className={styles.plusValue}>+€{plus.prezzo}</span>
              </div>
            ))}
          </>
        )}

        {/* Totale */}
        <div className={styles.divider}></div>
        
        <div className={`${styles.costRow} ${styles.totalRow}`}>
          <span className={styles.totalLabel}>Totale</span>
          <span className={styles.totalValue}>€{totalCost}</span>
        </div>
      </div>

      {/* Note */}
      <div className={styles.notes}>
        <p className={styles.noteText}>
          ℹ️ Prezzo per persona. Include tutti i servizi descritti.
        </p>
        {selectedPlus.length > 0 && (
          <p className={styles.savingsText}>
            ✨ Hai aggiunto {selectedPlus.length} extra per personalizzare l'esperienza!
          </p>
        )}
      </div>
    </div>
  );
}

CostSummary.propTypes = {
  baseCost: PropTypes.number.isRequired,
  selectedPlus: PropTypes.arrayOf(
    PropTypes.shape({
      nome: PropTypes.string.isRequired,
      prezzo: PropTypes.number.isRequired,
    })
  ),
};

export default memo(CostSummary);