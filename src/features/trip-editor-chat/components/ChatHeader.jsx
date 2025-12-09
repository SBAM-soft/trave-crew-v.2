import PropTypes from 'prop-types';
import styles from './ChatHeader.module.css';

/**
 * Header persistente per Trip Editor Chat
 * Mostra informazioni del viaggio
 */
function ChatHeader({ wizardData, currentStep, tripData }) {
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
      </div>

      {/* Timeline giorni - mostra solo dopo aver selezionato i giorni */}
      {tripData?.totalDays && (
        <div className={styles.stepsBar}>
          {Array.from({ length: tripData.totalDays }, (_, index) => {
            // ✅ FIX: Mostra TUTTI i giorni incluso DEPARTURE (totalDays blocchi, non totalDays-1)
            // filledBlocks contiene ARRIVAL + LOGISTICS + EXPERIENCE + FREE (ma NON DEPARTURE)
            // DEPARTURE è sempre l'ultimo giorno (fisso, sempre pieno)
            const filledBlocks = tripData.filledBlocks?.length || 0;
            const totalBlocks = tripData.totalDays; // Tutti i giorni incluso DEPARTURE

            const blockNumber = index + 1;
            const isDeparture = blockNumber === tripData.totalDays; // Ultimo giorno = DEPARTURE
            const isFilled = blockNumber <= filledBlocks || isDeparture; // DEPARTURE è sempre "pieno"
            const isActive = !isDeparture && blockNumber === filledBlocks + 1;

            return (
              <div
                key={`block-${index}`}
                className={`${styles.step} ${
                  isFilled ? styles.completed :
                  isActive ? styles.active :
                  styles.pending
                }`}
                title={`${isDeparture ? '✈️ Partenza (Day ' + blockNumber + ')' : 'Blocco ' + blockNumber + '/' + (totalBlocks - 1)} - ${isFilled ? 'Completato' : isActive ? 'In corso' : 'Da pianificare'}`}
              >
                {isDeparture ? '✈️' : isFilled ? '✓' : blockNumber}
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
