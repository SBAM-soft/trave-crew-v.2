import MapInteractive from '../MapInteractive';
import useTripEditorStore from '../store/useTripEditorStore';
import styles from './TripEditorMap.module.css';

/**
 * Componente per la mappa interattiva e selezione zone
 */
function TripEditorMap({ destinazioneData, onZoneClick }) {
  const availableZones = useTripEditorStore((state) => state.availableZones);
  const selectedZone = useTripEditorStore((state) => state.selectedZone);
  const availableCounter = useTripEditorStore((state) => state.availableCounter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Seleziona una zona</h3>
        {availableZones.length > 0 && (
          <span className={styles.badge}>
            {availableZones.length} {availableZones.length === 1 ? 'zona disponibile' : 'zone disponibili'}
          </span>
        )}
      </div>

      {/* Mappa Interattiva */}
      <div className={styles.mapWrapper}>
        <MapInteractive
          destinazione={destinazioneData?.NOME || 'Destinazione'}
          availableZones={availableZones}
          onZoneClick={onZoneClick}
          selectedZone={selectedZone}
        />
      </div>

      {/* Info Progressive Unlock */}
      {availableCounter > 1 && (
        <div className={styles.unlockInfo}>
          <span className={styles.unlockIcon}>🔓</span>
          <span className={styles.unlockText}>
            Livello {availableCounter}: Nuove zone sbloccate!
          </span>
        </div>
      )}

      {/* Zone List (opzionale, per UI alternativa) */}
      {availableZones.length > 0 && (
        <div className={styles.zonesList}>
          <h4 className={styles.zonesTitle}>Zone disponibili:</h4>
          <div className={styles.zonesGrid}>
            {availableZones.map((zona) => (
              <button
                key={zona.CODICE}
                onClick={() => onZoneClick(zona)}
                className={`${styles.zoneButton} ${
                  selectedZone?.CODICE === zona.CODICE ? styles.zoneButtonActive : ''
                }`}
              >
                <span className={styles.zoneIcon}>📍</span>
                <span className={styles.zoneName}>{zona.ZONA}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TripEditorMap;
