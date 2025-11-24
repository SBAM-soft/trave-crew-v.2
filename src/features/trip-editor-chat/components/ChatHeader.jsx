import PropTypes from 'prop-types';
import styles from './ChatHeader.module.css';

/**
 * Header persistente per Trip Editor Chat
 * Mostra informazioni del viaggio e progresso
 */
function ChatHeader({ wizardData, currentStep, tripData }) {
  // Calcola progresso basato sullo step
  const steps = ['welcome', 'duration', 'zones', 'packages', 'summary_before_hotels', 'hotels', 'final_summary'];
  const currentIndex = steps.indexOf(currentStep);
  const progress = currentIndex >= 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0;

  // Etichette step per UI
  const stepLabels = {
    'welcome': 'Benvenuto',
    'duration': 'Durata',
    'zones': 'Zone',
    'packages': 'Esperienze',
    'summary_before_hotels': 'Riepilogo',
    'hotels': 'Hotel',
    'final_summary': 'Finale'
  };

  return (
    <div className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.tripInfo}>
          <div className={styles.destination}>
            <span className={styles.icon}>📍</span>
            <span className={styles.label}>
              {wizardData.destinazioneNome || wizardData.destinazione || 'Destinazione'}
            </span>
          </div>
          <div className={styles.details}>
            <span className={styles.detail}>
              <span className={styles.icon}>👥</span>
              {wizardData.numeroPersone || 1} {wizardData.numeroPersone === 1 ? 'persona' : 'persone'}
            </span>
            <span className={styles.detail}>
              <span className={styles.icon}>💰</span>
              Budget: {wizardData.budget?.toUpperCase() || 'MEDIO'}
            </span>
            {tripData?.totalDays && (
              <span className={styles.detail}>
                <span className={styles.icon}>📅</span>
                {tripData.totalDays} giorni
              </span>
            )}
            {wizardData.interessi && wizardData.interessi.length > 0 && (
              <span className={styles.detail}>
                <span className={styles.icon}>🎯</span>
                {wizardData.interessi.join(', ')}
              </span>
            )}
          </div>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span className={styles.stepName}>{stepLabels[currentStep] || 'In corso'}</span>
            <span className={styles.percentage}>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline giorni - mostra solo dopo aver selezionato i giorni */}
      {tripData?.totalDays && (
        <div className={styles.stepsBar}>
          {Array.from({ length: tripData.totalDays - 2 }, (_, index) => {
            // Calcola quanti giorni sono stati riempiti usando filledBlocks
            const filledDays = tripData.filledBlocks?.length || 0;
            const availableDays = tripData.totalDays - 2; // -2 per arrivo/partenza

            const blockNumber = index + 1;
            const isFilled = blockNumber <= filledDays;
            const isActive = blockNumber === filledDays + 1;

            return (
              <div
                key={`block-${index}`}
                className={`${styles.step} ${
                  isFilled ? styles.completed :
                  isActive ? styles.active :
                  styles.pending
                }`}
                title={`Giorno ${blockNumber + 1} - ${isFilled ? 'Completato' : isActive ? 'In corso' : 'Da pianificare'}`}
              >
                {isFilled ? '✓' : blockNumber}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

ChatHeader.propTypes = {
  wizardData: PropTypes.object,
  currentStep: PropTypes.string,
  tripData: PropTypes.object
};

ChatHeader.defaultProps = {
  wizardData: {},
  currentStep: 'welcome',
  tripData: {}
};

export default ChatHeader;
