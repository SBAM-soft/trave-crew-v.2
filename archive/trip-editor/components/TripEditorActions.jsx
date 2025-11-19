import Button from '../../../shared/Button';
import useTripEditorStore from '../store/useTripEditorStore';
import styles from './TripEditorActions.module.css';

/**
 * Componente per azioni principali del Trip Editor
 * - CTA buttons (Crea Auto, Crea Itinerario)
 * - Progress indicator
 */
function TripEditorActions({ onAutoFill, onCreateItinerary, disabled }) {
  const progress = useTripEditorStore((state) => state.getProgress());
  const daysRemaining = useTripEditorStore((state) => state.getDaysRemaining());

  const isComplete = daysRemaining === 0;

  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className={styles.progressText}>
          {progress.filled}/{progress.total} giorni pianificati ({progress.percentage}%)
        </span>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {!isComplete ? (
          <>
            <Button
              onClick={onAutoFill}
              variant="outline"
              disabled={disabled}
            >
              ⚡ Riempi Automaticamente
            </Button>
            <div className={styles.spacer} />
          </>
        ) : (
          <Button
            onClick={onCreateItinerary}
            variant="primary"
            size="large"
            disabled={disabled}
          >
            ✨ Crea Itinerario
          </Button>
        )}
      </div>

      {/* Days Remaining Info */}
      {daysRemaining > 0 && (
        <div className={styles.info}>
          <span className={styles.infoIcon}>ℹ️</span>
          <span className={styles.infoText}>
            Mancano ancora {daysRemaining} {daysRemaining === 1 ? 'giorno' : 'giorni'} da pianificare
          </span>
        </div>
      )}

      {isComplete && (
        <div className={styles.success}>
          <span className={styles.successIcon}>✅</span>
          <span className={styles.successText}>
            Tutti i giorni sono stati pianificati! Puoi creare l'itinerario.
          </span>
        </div>
      )}
    </div>
  );
}

export default TripEditorActions;
