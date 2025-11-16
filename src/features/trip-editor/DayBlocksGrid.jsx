import { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './DayBlocksGrid.module.css';

function DayBlocksGrid({ totalDays, filledBlocks = [], onBlockClick }) {
  // Crea array di blocchi (1 giorno = 1 blocco)
  const blocks = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Giorno 1 è sempre "Arrivo" e non cliccabile
  const isArrivalDay = (day) => day === 1;

  // Controlla se un blocco è pieno (supporta sia array di numeri che array di oggetti)
  const isFilled = (day) => {
    return filledBlocks.some(block =>
      typeof block === 'number' ? block === day : block.day === day
    );
  };

  // Ottieni l'esperienza per un giorno specifico
  const getExperience = (day) => {
    const block = filledBlocks.find(b =>
      typeof b === 'number' ? b === day : b.day === day
    );
    return typeof block === 'object' ? block.experience : null;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>📅 I tuoi giorni</h3>
        <p className={styles.subtitle}>
          {filledBlocks.length} di {totalDays - 1} giorni pianificati
        </p>
        <div className={styles.progressBar}>
          <div 
            className={styles.progress}
            style={{ width: `${((filledBlocks.length) / (totalDays - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Griglia blocchi */}
      <div className={styles.grid}>
        {blocks.map(day => {
          const filled = isFilled(day);
          const arrival = isArrivalDay(day);
          const experience = getExperience(day);

          return (
            <div
              key={day}
              className={`${styles.block} ${
                arrival ? styles.arrival :
                filled ? styles.filled : styles.empty
              }`}
              onClick={() => !arrival && filled && onBlockClick && onBlockClick(day)}
              style={{ cursor: !arrival && filled ? 'pointer' : 'default' }}
            >
              {/* Numero giorno */}
              <span className={styles.dayNumber}>
                {arrival ? '✈️' : `Giorno ${day}`}
              </span>

              {/* Label arrivo */}
              {arrival && (
                <span className={styles.arrivalLabel}>Arrivo</span>
              )}

              {/* Info esperienza per blocchi pieni */}
              {filled && !arrival && experience && (
                <div className={styles.experienceInfo}>
                  <span className={styles.experienceName}>{experience.nome}</span>
                  <div className={styles.checkmark}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Checkmark per blocchi pieni senza esperienza */}
              {filled && !arrival && !experience && (
                <div className={styles.checkmark}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}

              {/* Placeholder per blocchi vuoti */}
              {!filled && !arrival && (
                <div className={styles.placeholder}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBlock} ${styles.arrival}`} />
          <span>Arrivo (no esperienze)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBlock} ${styles.filled}`} />
          <span>Giorno pianificato</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBlock} ${styles.empty}`} />
          <span>Da pianificare</span>
        </div>
      </div>
    </div>
  );
}

DayBlocksGrid.propTypes = {
  totalDays: PropTypes.number.isRequired,
  filledBlocks: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        day: PropTypes.number,
        experience: PropTypes.shape({
          nome: PropTypes.string,
        }),
      }),
    ])
  ),
  onBlockClick: PropTypes.func,
};

export default memo(DayBlocksGrid);