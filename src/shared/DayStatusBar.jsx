import { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './DayStatusBar.module.css';

/**
 * Barra di stato compatta per mostrare il progresso dei giorni pianificati
 * User-friendly e sempre visibile in top bar
 */
function DayStatusBar({ totalDays, filledBlocks = [], compact = false }) {
  // Calcola progresso
  const plannedDays = filledBlocks.length;
  const targetDays = totalDays - 1; // -1 per il giorno di arrivo
  const progressPercentage = (plannedDays / targetDays) * 100;
  const isComplete = plannedDays >= targetDays;

  return (
    <div className={`${styles.statusBar} ${compact ? styles.compact : ''}`}>
      <div className={styles.info}>
        <span className={styles.icon}>📅</span>
        <div className={styles.text}>
          <span className={styles.label}>Giorni pianificati</span>
          <span className={styles.value}>
            {plannedDays} / {targetDays}
            {isComplete && <span className={styles.badge}>✅ Completo</span>}
          </span>
        </div>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progress} ${isComplete ? styles.complete : ''}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <span className={styles.percentage}>{Math.round(progressPercentage)}%</span>
      </div>
    </div>
  );
}

DayStatusBar.propTypes = {
  totalDays: PropTypes.number.isRequired,
  filledBlocks: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        day: PropTypes.number,
        experience: PropTypes.object,
      }),
    ])
  ),
  compact: PropTypes.bool,
};

export default memo(DayStatusBar);
